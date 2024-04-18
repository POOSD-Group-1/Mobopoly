const { games } = require(".");
const { deepcopy } = require("./utility");

// THIS NEEDS TO BE UPDATED TO GRAB FROM GAMESTATE.JS
const actionTypes = Object.freeze({
    ROLL_DICE: 0,
    WAGER: 1,
    BUY_PROPERTY: 2,
    CREATE_HIDEOUT: 3,
    CREATE_AMBUSH: 4,
    END_TURN: 5
});
const HIDEOUTCOST = 150;




// UNTESTED
function generateAction(gameState) {
	let possibleActions = [];

	// Roll the dice

	let diceRollAction = { ...defaultAction };
	diceRollAction.type = ROLL_DICE;
	if(validateAction(gameState, diceRollAction)) {
		possibleActions.push(diceRollAction);
		return possibleActions;
	}

	let activePlayer = gameState.turn.playerTurn;
	let playerNumGangMembers = gameState.players[activePlayer].numGangMembers;

	// Wager
	// Might need to add if there are 0 gang members?
	let wagerAction = { ...defaultAction };
	wagerAction.type = WAGER;
	wagerAction.numGangMembers = playerNumGangMembers;
	if(validateAction(gameState, wagerAction)) {
		possibleActions.push(wagerAction);
		return possibleActions;
	}

	// Buy property
	let buyPropertyAction = { ...defaultAction };
	buyPropertyAction.type = BUY_PROPERTY;
	if(validateAction(gameState, buyPropertyAction)) {
		possibleActions.push(buyPropertyAction);
	}

	// Create hideout
	let createHideoutAction = { ...defaultAction };
	createHideoutAction.type = CREATE_HIDEOUT;
	if(validateAction(gameState, createHideoutAction)) {
		possibleActions.push(createHideoutAction);
	}

	// Create ambush
	let createAmbushAction = { ...defaultAction };
	createAmbushAction.type = CREATE_AMBUSH;
	createAmbushAction.numGangMembers = playerNumGangMembers;
	if(validateAction(gameState, createAmbushAction)) {
		possibleActions.push(createAmbushAction);
	}

	// End turn
	let endTurnAction = { ...defaultAction };
	endTurnAction.action = END_TURN;
	if(validateAction(gameState, endTurnAction)) {
		possibleActions.push(endTurnAction);
	}

	return possibleActions;
}

