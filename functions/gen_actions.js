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


defaultAction = {
	type: -1,
	numGangMembers: 0,
};

// UNTESTED
function generateAction(gameState) {
	possibleActions = [];

	// Roll the dice
	if(gameState.turn.hasRolledDice == false) {
		let action = { ...defaultAction };
		action.type = ROLL_DICE;
		possibleActions.push(action);
		return possibleActions;
	}

	let activePlayer = gameState.turn.playerTurn;
	let playerLocation = gameState.players[activePlayer].location;
	let playerNumGangMembers = gameState.players[activePlayer].numGangMembers;

	// Wager
	// Might need to add if there are 0 gang members?
	if(gameState.turn.hasWagered == false) {
		let action = { ...defaultAction };
		action.type = WAGER;
		action.numGangMembers = gameState.players[activePlayer].numGangMembers;
		possibleActions.push(action);
		return possibleActions;
	}

	let playerMoney = gameState.players[activePlayer].money;

	// Buy property
	if(playerMoney >= gameState.properties[playerLocation].cost) {
		let action = { ...defaultAction };
		action.type = BUY_PROPERTY;
		possibleActions.push(action);
	}

	// Create hideout
	if(playerMoney >= HIDEOUTCOST) {
		let action = { ...defaultAction };
		action.type = CREATE_HIDEOUT;
		possibleActions.push(action);
	}

	// Create ambush
	if(playerNumGangMembers > 0) {
		let action = { ...defaultAction };
		action.type = CREATE_AMBUSH;
		action.numGangMembers = playerNumGangMembers;
		possibleActions.push(action);
	}

	// End turn
	let endTurnAction = { ...defaultAction };
	endTurnAction.action = END_TURN;
	possibleActions.push(endTurnAction);

	return possibleActions;
}

exports.getActionsForTurn = onRequest((req, res) => {

});