const { games } = require(".");
const { deepcopy } = require("./utility");

const hideoutCost = 150;
const BOARDSIZE = 28;
const PASSGOREWARD = 200;
const GOSQUARE = 0;
const JAILSQUARE = 7;
const GOTOJAILSQUARE = 21;
const GANGREWARD = 20;
const MUGGINGAMOUNT = 50;
const actionTypes = Object.freeze({
    ROLL_DICE: 0,
    WAGER: 1,
    BUY_PROPERTY: 2,
    CREATE_HIDEOUT: 3,
    CREATE_AMBUSH: 4,
    END_TURN: 5
});

//
exampleAction = {
    type: "action type",
    numGangMembers: 0,
}

exampleAmbush = {
    location: 0,
    gangMembers: 0,
    ownerID: 0
}

function validateAction(gameState, action) {
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

    switch(action.type) {
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
            let hideOutHere = player.hideouts.includes(playerLocation);
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
            return true;
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

    return gameState;
}

function cleanGameState(gameState) {
    const partialGameState = deepcopy(gameState);
    partialGameState.gameID = -1;
    partialGameState.ambushes.forEach((ambush) => {
        let ownerID = ambush.ownerID;
        partialGameState.players[ownerID].gangMembers+=ambush.gangMembers;
    });
    partialGameState.ambushes.length = 0;
    for (let i = 0; i < partialGameState.players.length; i++)
        partialGameState.players[i].hideouts.length = 0;
    return partialGameState;
}

//COMPLETELY UNTESTED AT ALL LIKE SERIOUSLY NOT TESTED FRFR
function rollDice(){
    return 1+Math.floor(Math.random()*6);
}
//COMPLETELY UNTESTED AT ALL LIKE SERIOUSLY NOT TESTED FRFR
function movePlayer(gameState, movement){
    let player = gameState.turn.playerTurn;
    let oldlocation = gameState.players[player].location;
    let newLocation = (oldlocation+movement)%BOARDSIZE;
    let passedGo = newLocation<oldlocation;
    let sentToJail = false;
    if(newLocation == GOTOJAILSQUARE){
        newLocation = JAILSQUARE;
        sentToJail = true;
    }
    if(passedGo){
        gameState.players[player].money+=PASSGOREWARD;
    }
    
    let passedJail = oldlocation < JAILSQUARE && newLocation >= JAILSQUARE;
    if(passedJail || sentToJail){
        gameState.players[player].numGangMembers+=GANGREWARD;
    }

    return gameState;
}
//COMPLETELY UNTESTED AT ALL LIKE SERIOUSLY NOT TESTED FRFR
function applyAmbush(gameState, ambush){
    let victim = gameState.turn.playerTurn;
    let perp = ambush.ownerID;
    let gangMembersLost = min(ambush.gangMembers*2,gameState.players[perp].gangMembers);
    let ambushRemainingGangMembers = ambush.gangMembers-gangMembersLost;
    let moneyLost = ambushRemainingGangMembers*MUGGINGAMOUNT;
    gameState.players[victim]-=gangMembersLost;
    gameState.players[victim]-=moneyLost;
    if(gameState.players[victim] < 0){
        gameState = killPlayer(gameState,victim);
    }
    gameState.players[perp]+=moneyLost;
    return gameState;
}
//COMPLETELY UNTESTED AT ALL LIKE SERIOUSLY NOT TESTED FRFR
function applyAction(gameState, action){
    if(!validateAction(gameState,action)) return gameState;
    let activePlayer = gameState.turn.playerTurn;
    switch(action.type){
        case actionTypes.rollDice:
            gameState.dice1 = rollDice();
            gameState.dice2 = rollDice();
            let movementAmount = gameState.dice1+gameState.dice2;
            gameState = movePlayer(gameState,movementAmount);
            let newPlayerLocation = gameState.players[activePlayer].location;
            let newAmbushes = [];
            let applicableAmbushes = [];
            gameState.ambushes.forEach((currentAmbush) => {
                if(currentAmbush.location != newPlayerLocation || 
                   currentAmbush.ownerID == activePlayer){
                    newAmbushes.push(currentAmbush);
                }else{
                    applicableAmbushes.push(currentAmbush);
                }
            });

            applicableAmbushes.forEach((currentAmbush) => {
                gameState = applyAmbush(gameState,currentAmbush); 
            });
    }
}