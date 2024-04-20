const { getPlayerID, getRoomData, getGameData } = require("./room");
const { deepcopy, updateListener } = require("./utility");
const { v4: uuidv4 } = require('uuid');
const { onRequest, rooms, listeners, logger, games, errorCodes } = require('./index');
const defaultRoom = require("./defaultRoom.json")
const defaultGameState = require("./defaultGameState.json");
const defaultPlayer = require("./defaultPlayer.json")
const hideoutCost = 150;
const BOARDSIZE = 28;
const PASSGOREWARD = 200;
const GOSQUARE = 0;
const JAILSQUARE = 7;
const GOTOJAILSQUARE = 21;
const GANGREWARD = 20;
const MUGGINGAMOUNT = 50;
const MINWAGERLOSS = 500;
const BETRAYALSQUARE = 14;

const actionTypes = Object.freeze({
	ROLL_DICE: 0,
	WAGER: 1,
	BUY_PROPERTY: 2,
	CREATE_HIDEOUT: 3,
	CREATE_AMBUSH: 4,
	END_TURN: 5
});


const eventTypes = Object.freeze({
	PLAYER_DIES: 0,
	DICE_ROLLED: 1
})
function logGameState(gameState) {
	let newGameState = deepcopy(gameState);
	delete newGameState.properties;
	console.log("gameState:");
	console.log(newGameState);
}


defaultAction = {
	type: -1,
	numGangMembers: 0,
};

exampleAmbush = {
	location: 0,
	numGangMembers: 0,
	playerID: 0
}

function validateAction(gameState, action) {
	if (gameState.isGameOver == true) return false;
	console.log("validateAction" + action.type);
	logGameState(gameState)
	// Must roll dice at beginning of turn
	if (gameState.turn.hasRolledDice == false)
		return action.type == actionTypes.ROLL_DICE;

	// Current player
	let player = gameState.players[gameState.turn.playerTurn];
	let isCorner = player.location % 7 == 0;
	let hasEnoughMoney;

	// Must wager immediately after dice roll if necessary
	if (!gameState.turn.hasWagered) {
		let opponent = null;
		for (let i = 1; i < gameState.players.length; i++) {
			// Iterates through players in order of latest to most recent move
			let idx = (i + gameState.turn.playerTurn) % gameState.players.length;
			// Skip deceased players
			if (!gameState.players[idx].isAlive) continue;
			// Player is on same square
			if (gameState.players[idx].location == player.location)
				opponent = gameState.players[idx];
		}
		if (action.type == actionTypes.WAGER) {
			// Opponent must exist
			// Must have enough gang members
			// Must wager nonnegative # of gang members
			return opponent != null && player.numGangMembers >= action.numGangMembers && action.numGangMembers >= 0;
		} else if (opponent != null) return false; // Wager is supposed to occur
	} else if (action.type == actionTypes.WAGER) return false; // Already wagered

	switch (action.type) {
		case actionTypes.ROLL_DICE:
			// Can roll iff player has not already rolled
			return !gameState.turn.hasRolledDice;
		case actionTypes.BUY_PROPERTY:
			let property = gameState.properties[player.location];
			let propertyOwned = property.playerID != -1;
			hasEnoughMoney = player.money >= property.cost;
			// Cannot buy corner square
			// Cannot buy owned property
			// Must have enough money
			return !isCorner && !propertyOwned && hasEnoughMoney;
		case actionTypes.CREATE_HIDEOUT:
			let hideOutHere = player.hideouts.includes(player.location);
			hasEnoughMoney = player.money >= hideoutCost;
			// Cannot place on corners
			// Cannot place hideout if player already has a hideout here
			// Must have enough money
			return !isCorner && !hideOutHere && hasEnoughMoney;
		case actionTypes.CREATE_AMBUSH:
			let ambushHere = false;
			for (let i = 0; i < gameState.ambushes.length; i++) {
				let ambush = gameState.ambushes[i];
				if (ambush.location == player.location/* && ambush.playerID != playerID*/) {
					ambushHere = true;
					break;
				}
			}
			let validGangMembers = player.numGangMembers >= action.numGangMembers && action.numGangMembers > 0;
			// Cannot place on corners
			// Cannot place on square if someone else has an ambush there (Should never occur)
			// Must have enough gang numGangMembers
			// Must place a positive amount of gang members
			return !isCorner && !ambushHere && validGangMembers;
		case actionTypes.END_TURN:
			console.log("end turn");
			return true;
		default:
			return false;
	}
}

function killPlayer(gameState, playerID) {
	// Retrieve player
	let player = null;
	let playerIndex = -1;
	for (let i = 0; i < gameState.players.length; i++) {
		if (playerID === gameState.players[i].playerID) {
			player = gameState.players[i];
			playerIndex = i;
			break;
		}
	}

	// Player not found
	if (player === null) {
		return gameState;
	}

	// Make player's properties purchasable again
	for (let i = 0; i < player.properties.length; i++) {
		gameState.properties[player.properties[i]].playerID = -1;
	}

	// Remove player's ambushes
	gameState.ambushes = gameState.ambushes.filter(ambush => ambush.playerID !== playerID);

	// Make player a spectator
	gameState.players[playerIndex].isAlive = false;
	gameState.ranking.push(playerIndex);
	gameState.history.push({
		eventType: eventTypes.PLAYER_DIES,
		playerID: playerIndex
	})
	let numberAlive = 0;
	for (let i = 0; i < gameState.players.length; i++) {
		if (gameState.players[i].isAlive) numberAlive++;
	}
	if (numberAlive == 1) {
		for (let i = 0; i < gameState.players.length; i++) {
			if (gameState.players[i].isAlive) {
				gameState.ranking.push(gameState.players[i].playerID);
			}
		}
		gameState.isGameOver = true;
	}
	return gameState;
}

//COMPLETELY UNTESTED AT ALL LIKE SERIOUSLY NOT TESTED FRFR
function rollDice() {
	return 1 + Math.floor(Math.random() * 6);
}
//COMPLETELY UNTESTED AT ALL LIKE SERIOUSLY NOT TESTED FRFR
function movePlayer(gameState, movement) {
	let player = gameState.turn.playerTurn;
	let oldlocation = gameState.players[player].location;
	let newLocation = (oldlocation + movement) % BOARDSIZE;
	let passedGo = newLocation < oldlocation;
	let sentToJail = false;
	if (newLocation == GOTOJAILSQUARE) {
		newLocation = JAILSQUARE;
		sentToJail = true;
	}

	gameState.history.push({
		playerID: player,
		from: oldlocation,
		to: newLocation,
		wasSentToJail: sentToJail
	});

	if (newLocation == BETRAYALSQUARE) {
		const lossAmount = 50;
		let tenPercentOfGangMembers = Math.floor(.01 + (gameState.players[activePlayer].numGangMembers / 10));
		gameState.players[activePlayer].numGangMembers -= tenPercentOfGangMembers;
		let moneyLossed = Math.min(gameState.players[activePlayer].money, lossAmount * tenPercentOfGangMembers);
		gameState.players[activePlayer].money -= (moneyLossed);
	}

	if (passedGo) {
		gameState.players[player].money += PASSGOREWARD;
	}

	let passedJail = oldlocation < JAILSQUARE && newLocation >= JAILSQUARE;
	if (passedJail || sentToJail) {
		gameState.players[player].numGangMembers += GANGREWARD;
	}

	gameState.players[player].location = newLocation;

	return gameState;
}

function nextLoc(square) {
	return (square + 1) % BOARDSIZE;
}

function prevLoc(square) {
	return (square - 1 + BOARDSIZE) % BOARDSIZE;
}

function applyAmbush(gameState, ambush) {
	let victim = gameState.turn.playerTurn;
	let perp = ambush.playerID;
	let safeFromAmbush = false;
	gameState.players[victim].hideouts.forEach((hideOutLocation) => {
		let nextToHideOut1 = nextLoc(hideOutLocation);
		let nextToHideOut2 = prevLoc(hideOutLocation);
		if (nextToHideOut1 == ambush.location ||
			nextToHideOut2 == ambush.location ||
			hideOutLocation == ambush.location) {
			safeFromAmbush = true;
		}
	});

	if (safeFromAmbush) {
		return gameState;
	}

	let gangMembersLost = Math.min(ambush.numGangMembers * 2, gameState.players[perp].numGangMembers);
	let ambushRemainingGangMembers = ambush.numGangMembers - gangMembersLost;
	let moneyLost = ambushRemainingGangMembers * MUGGINGAMOUNT;
	gameState.players[victim].numGangMembers -= gangMembersLost;
	gameState.players[victim].money -= moneyLost;
	if (gameState.players[victim].money < 0) {
		gameState = killPlayer(gameState, victim);
		if (gameState.isGameOver == true) {
			return gameState;
		}
	}

	gameState.players[perp].money += moneyLost;
	return gameState;
}

function applyEndTurn(gameState) {
	gameState.turn.hasRolledDice = false;
	gameState.turn.hasWagered = false;
	gameState.turn.playerTurn = getNextPlayer(gameState);

	let newPlayer = gameState.turn.playerTurn;

	console.log("infinite loop?");
	if (gameState.players[newPlayer].isBot)
		gameState = makeBotMove(gameState);

	return gameState;
}

function probAttackerWins(numDefenders, numAttackers) {
	if (numAttackers == 0) return 0;
	return 1 - (numDefenders / (numDefenders + (numAttackers * 2)));
}

function didAttackerWin(numDefenders, numAttackers) {
	let prob = probAttackerWins(numDefenders, numAttackers);
	return Math.random() < prob;
}

function getNextPlayer(gameState) {
	for (let i = 1; i < gameState.players.length; i++) {
		let idx = (gameState.turn.playerTurn + i) % gameState.players.length;
		if (gameState.players[idx].isAlive) {
			return gameState.players[idx].playerID;
		}
	}
	return -1;
}

function mostRecentPlayer(gameState) {
	let playerID = -1;
	for (let i = 1; i < gameState.players.length; i++) {
		const idx = (gameState.turn.playerTurn + i) % gameState.players.length;
		if (gameState.players[idx].isAlive && gameState.players[idx].location == gameState.players[gameState.turn.playerTurn].location) {
			playerID = gameState.players[idx].playerID;
		}
	}
	return playerID;
}

//COMPLETELY UNTESTED AT ALL LIKE SERIOUSLY NOT TESTED FRFR
function applyActionHelper(gameState, action) {
	console.log("applyActionHelper");
	if (!validateAction(gameState, action)) return gameState;
	let activePlayer = gameState.turn.playerTurn;
	let playerLoc = gameState.players[activePlayer].location;
	console.log(action)
	switch (action.type) {
		case actionTypes.ROLL_DICE:
			console.log("rolling dice");
			gameState.dice1 = rollDice();
			gameState.dice2 = rollDice();
			let movementAmount = gameState.dice1 + gameState.dice2;
			gameState = movePlayer(gameState, movementAmount);
			logGameState(gameState);
			let newPlayerLocation = gameState.players[activePlayer].location;
			let newAmbushes = [];
			let applicableAmbushes = [];
			gameState.ambushes.forEach((currentAmbush) => {
				if (currentAmbush.location != newPlayerLocation ||
					currentAmbush.playerID == activePlayer) {
					newAmbushes.push(currentAmbush);
				} else {
					applicableAmbushes.push(currentAmbush);
				}
			});

			applicableAmbushes.forEach((currentAmbush) => {
				gameState = applyAmbush(gameState, currentAmbush);
			});
			if (!gameState.players[activePlayer].isAlive) {
				gameState = applyEndTurn(gameState);
				return gameState;
			}

			console.log("applying ambushes")
			logGameState(gameState);

			//paying rent to property owners
			let propertyOwner = gameState.properties[newPlayerLocation].playerID;
			if (propertyOwner != -1 && propertyOwner != activePlayer) {
				let amountTransfered = Math.min(gameState.properties[newPlayerLocation].rent,
					gameState.players[activePlayer].money);
				gameState.players[propertyOwner].money += amountTransfered;
				gameState.players[activePlayer].money -= amountTransfered;
				if (amountTransfered < gameState.properties[newPlayerLocation].rent) {
					gameState = killPlayer(gameState, activePlayer);
					if (gameState.isGameOver == true) {
						return gameState;
					}
				}
			}
			if (!gameState.players[activePlayer].isAlive) {
				gameState = applyEndTurn(gameState);
				return gameState;
			}
			console.log("paying rent")
			logGameState(gameState);

			let playersOnSameSquare = gameState.players.filter((player) => player.isAlive && player.location == newPlayerLocation);
			gameState.turn.hasRolledDice = true;
			if (playersOnSameSquare.length <= 1) {
				gameState.turn.hasWagered = true;
			}

			return gameState;
		case actionTypes.BUY_PROPERTY:
			let propertyCost = gameState.properties[playerLoc].cost;
			gameState.players[activePlayer].money -= propertyCost;
			gameState.properties[playerLoc].playerID = activePlayer;
			gameState.players[activePlayer].properties.push(playerLoc);
			return gameState;
		case actionTypes.CREATE_HIDEOUT:
			gameState.players[activePlayer].hideouts.push(playerLoc);
			gameState.players[activePlayer].money -= hideoutCost;
			return gameState;
		case actionTypes.CREATE_AMBUSH:
			let myAmbush = {
				location: playerLoc,
				numGangMembers: action.numGangMembers,
				playerID: activePlayer
			}
			gameState.ambushes.push(myAmbush);
			gameState.players[activePlayer].numGangMembers -= action.numGangMembers;
			return gameState;
		case actionTypes.WAGER:
			let defendingPlayer = mostRecentPlayer(gameState);
			let defendingGangMembers = gameState.players[defendingPlayer].numGangMembers;
			let attackerWin = didAttackerWin(defendingGangMembers, action.numGangMembers);
			if (attackerWin) {
				let attackers = 2 * action.numGangMembers;
				let numDefenderLost = Math.min(gameState.players[defendingPlayer].numGangMembers, attackers);
				attackers -= numDefenderLost;
				gameState.players[defendingPlayer].numGangMembers -= numDefenderLost;
				if (attackers > 0) {
					let defenderMoney = gameState.players[defendingPlayer].money;
					let moneyLost = Math.max(MINWAGERLOSS, Math.floor(0.2 * defenderMoney + 0.1));
					let moneyGain = Math.min(moneyLost, defenderMoney);
					gameState.players[activePlayer].money += moneyGain;
					gameState.players[defendingPlayer].money -= moneyLost;
					if (gameState.players[defendingPlayer].money < 0) {
						gameState = killPlayer(gameState, defendingPlayer);
						if (gameState.isGameOver == true) {
							return gameState;
						}
					}
				}
			} else {
				gameState.players[activePlayer].numGangMembers -= action.numGangMembers;
			}
			gameState.turn.hasWagered = true;
			return gameState;
		case actionTypes.END_TURN:
			return applyEndTurn(gameState);
	}
}

// UNTESTED
function generateActions(gameState) {
	let possibleActions = [];

	// Roll the dice
	let diceRollAction = { ...defaultAction };
	diceRollAction.type = actionTypes.ROLL_DICE;
	if (validateAction(gameState, diceRollAction)) {
		possibleActions.push(diceRollAction);
		return possibleActions;
	}

	let activePlayer = gameState.turn.playerTurn;
	let playerNumGangMembers = gameState.players[activePlayer].numGangMembers;

	// Wager
	// Might need to add if there are 0 gang members?
	let wagerAction = { ...defaultAction };
	wagerAction.type = actionTypes.WAGER;
	wagerAction.numGangMembers = playerNumGangMembers;
	if (validateAction(gameState, wagerAction)) {
		possibleActions.push(wagerAction);
		return possibleActions;
	}

	// Buy property
	let buyPropertyAction = { ...defaultAction };
	buyPropertyAction.type = actionTypes.BUY_PROPERTY;
	if (validateAction(gameState, buyPropertyAction)) {
		possibleActions.push(buyPropertyAction);
	}

	// Create hideout
	let createHideoutAction = { ...defaultAction };
	createHideoutAction.type = actionTypes.CREATE_HIDEOUT;
	if (validateAction(gameState, createHideoutAction)) {
		possibleActions.push(createHideoutAction);
	}

	// Create ambush
	let createAmbushAction = { ...defaultAction };
	createAmbushAction.type = actionTypes.CREATE_AMBUSH;
	createAmbushAction.numGangMembers = playerNumGangMembers;
	if (validateAction(gameState, createAmbushAction)) {
		possibleActions.push(createAmbushAction);
	}

	// End turn
	let endTurnAction = { ...defaultAction };
	endTurnAction.type = actionTypes.END_TURN;
	if (validateAction(gameState, endTurnAction)) {
		possibleActions.push(endTurnAction);
	}

	return possibleActions;
}

exports.applyAction = onRequest(async (req, res) => {
	const roomCode = req.query.roomCode;
	const userID = req.query.userID;
	let myActionType = req.query.type;
	let result = {
		error: errorCodes.noError
	}
	let myNumGangMembers = req.query.numGangMembers;
	if (myActionType === undefined) {
		result.error = errorCodes.missingParameters;
		res.json(result);
		return;
	}
	if (myNumGangMembers == undefined) myNumGangMembers = 0;
	myActionType = parseInt(myActionType);
	myNumGangMembers = parseInt(myNumGangMembers);
	if (isNaN(myActionType) || isNaN(myNumGangMembers)) {
		result.error = errorCodes.missingParameters;
		res.json(result);
		return;
	}
	let roomData = await getRoomData(roomCode);
	if (roomData == undefined) {
		result.error = errorCodes.roomNotFound;
		res.json(result);
		return;
	}

	let requesterPlayerID = getPlayerID(roomData, userID);
	let gameID = roomData.gameID;
	let gameState = await getGameData(gameID);
	if (gameState == undefined) {
		result.error = errorCodes.gameNotFound;
		res.json(result);
		return;
	}
	let action = {
		type: myActionType,
		numGangMembers: myNumGangMembers
	}
	console.log(action);

	if (requesterPlayerID != gameState.turn.playerTurn || (validateAction(gameState, action) == false)) {
		console.log(requesterPlayerID, gameState.turn.playerTurn, validateAction(gameState, action));
		// logGameState(gameState);
		console.log(action);
		result.error = errorCodes.invalidAction;
		res.json(result);
		return;
	}
	console.log("valid action");

	gameState = applyActionHelper(gameState, action);
	console.log("applied action");
	logGameState(gameState);
	await updateListener(roomData.listenDocumentID, false);

	const writeResult = await games
		.doc(gameID)
		.set(gameState);
	res.json(result);
	return;
});

exports.getActionsForTurn = onRequest(async (req, res) => {
	let roomCode = req.query.roomCode;
	let userID = req.query.userID;
	let result = {
		error: errorCodes.noError,
		actions: []
	}
	let roomData = await getRoomData(roomCode);
	if (roomData == undefined) {
		result.error = errorCodes.roomNotFound;
		res.json(result);
		return;
	}

	let gameID = roomData.gameID;
	let gameState = await getGameData(gameID);
	if (gameState == undefined) {
		result.error = errorCodes.gameNotFound;
		res.json(result);
		return;
	}
	let requesterPlayerID = getPlayerID(roomData, userID);
	console.log("playerID: " + requesterPlayerID, gameState.turn.playerTurn);
	if (requesterPlayerID != gameState.turn.playerTurn) {
		res.json(result);
		return;
	}
	result.actions = generateActions(gameState);
	res.json(result);
	return;
});

// Helper function, [)
function getRandomNumber(lBound, rBound) {
	let range = rBound - lBound;
	return lBound + Math.floor(Math.random() * range);
}

// Returns true if any of the players are humans
function checkAllBots(gameState) {
	let anyHuman = false;
	for (let i = 0; i < gameState.players.length; i++) {
		if (!gameState.players[i].isBot) anyHuman = true;
	}
	if (anyHuman) return false;

	// Game is all bots
	gameState.isGameOver = true;
	return true;
}

function makeBotMove(gameState) {
	if (checkAllBots(gameState)) return;
	let playerID = gameState.turn.playerTurn;

	let action = { ...defaultAction };
	while (gameState.isGameOver == false && gameState.turn.playerTurn == playerID && action.type != actionTypes.END_TURN) {
		// Get an array of all possible actions
		console.log("getiing available actions!")
		let possibleActions = generateActions(gameState);

		console.log("count: ", possibleActions.length);
		for(let i = 0; i < possibleActions.length; i++) {
			console.log("possible action: ", possibleActions[i].type);
		}

		if(possibleActions.length == 0) break;
		// Randomly pick one
		let moveNumber = getRandomNumber(possibleActions.length);
		let action = { ...possibleActions[moveNumber] };

		// Do speical things if needed
		if (action.type == actionTypes.ROLL_DICE) {
			// do nothing special
		} else if (action.type == actionTypes.WAGER) {
			// Pick a random number of gang members to be wagered
			let numGangMembersWager = getRandomNumber(0, action.numGangMembers + 1);
			action.numGangMembers = numGangMembersWager;
		} else if (action.type == actionTypes.BUY_PROPERTY) {
			let buyProperty = (getRandomNumber(0, 2) == 1);
			if (buyProperty) {
				// do nothing special
			} else {
				// Don't buy the property, so just continue to next action
				continue;
			}
		} else if (action.type == actionTypes.CREATE_HIDEOUT) {
			// do nothing special
		} else if (action.type == actionTypes.CREATE_AMBUSH) {
			// Pick a random number of gang members to be on the ambush
			let numGangMembersWager = getRandomNumber(0, action.numGangMembers + 1);
			action.numGangMembers = numGangMembersWager;
		} else if (action.type == actionTypes.END_TURN) {
			// do nothing special
		}

		// Make the action
		console.log("making the bot's action");
		gameState = applyActionHelper(gameState, action);
	}

	return gameState;
}

exports.quitGame = onRequest(async (req, res) => {
	console.log("in quitGame");
	let roomCode = req.query.roomCode;
	let userID = req.query.userID;
	let result = {
		error: errorCodes.noError
	}
	let roomData = await getRoomData(roomCode);
	if (roomData == undefined) {
		result.error = errorCodes.roomNotFound;
		res.json(result);
		return;
	}

	let gameID = roomData.gameID;
	let gameState = await getGameData(gameID);
	if (gameState == undefined) {
		result.error = errorCodes.gameNotFound;
		res.json(result);
		return;
	}
	let playerID = getPlayerID(roomData, userID);
	if (playerID == -1) {
		result.error = errorCodes.userNotFound;
		res.json(result);
		return;
	}

	console.log("quitGame: ", playerID);
	gameState.players[playerID].isBot = true;
	const writeResult = await games
		.doc(gameID)
		.set(gameState);
	res.json(result);
	return;
});