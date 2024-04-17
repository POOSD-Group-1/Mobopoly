const { deepcopy } = require("./utility");

hideoutCost = 150;

async function validateAction(gameState, action) {
    // Must roll dice at beginning of turn
    if (gameState.turn.hasRolledDice == false)
        return action.type == "ROLL_DICE";

    // Current player
    let player = gameState.players[gameState.turn.playerTurn];
    let isCorner = player.location % 7 == 0;
    let hasEnoughMoney;

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
        if (action.type == "WAGER") {
            // Opponent must exist
            // Must have enough gang members
            // Must wager nonnegative # of gang members
            return opponent != null && player.numGangMembers >= action.numGangMembers && action.numGangMembers >= 0;
        } else if (opponent != null) return false; // Wager is supposed to occur
    } else if (action.type == "WAGER") return false; // Already wagered

    switch(action.type) {
        case 'ROLL_DICE':
            // Can roll iff player has not already rolled
            return !gameState.turn.hasRolledDice;
        case 'BUY_PROPERTY':
            let property = gameState.properties[player.location];
            let propertyOwned = property.playerID != -1;
            hasEnoughMoney = player.money >= property.cost;
            // Cannot buy corner square
            // Cannot buy owned property
            // Must have enough money
            return !isCorner && !propertyOwned && hasEnoughMoney;
        case 'CREATE_HIDEOUT':
            let hideoutHere = player.hideouts.includes(playerLocation);
            hasEnoughMoney = player.money >= hideoutCost;
            // Cannot place on corners
            // Cannot place hideout if player already has a hideout here
            // Must have enough money
            return !isCorner && !hideOutHere && hasEnoughMoney;
        case 'CREATE_AMBUSH':
            let ambushHere = false;
            for (let i = 0; i < gameState.ambushes.length; i++) {
                ambush = gameState.ambushes[i];
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
    }
}

async function killPlayer(gameState, playerID) {
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
    partialGameState.ambushes.length = 0;
    for (let i = 0; i < partialGameState.players.length; i++)
        partialGameState.players[i].hideouts.length = 0;
    return partialGameState;
}