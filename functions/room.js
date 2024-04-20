const { v4: uuidv4 } = require('uuid');
const { onRequest, rooms, errorCodes, listeners, games, logger } = require('./index');
const { generateRandomRoomCode, validateName, updateListener, deepcopy } = require('./utility');
const defaultRoom = require("./defaultRoom.json")
const defaultGameState = require("./defaultGameState.json");
const defaultPlayer = require("./defaultPlayer.json")

// checks if a room exists for a given room code
async function doesRoomExist(roomCode) {
	const re = new RegExp("^[A-Z]{6}$");
	if (!re.test(roomCode)) return false;
	let documentExists = false;
	try {
		const doc = await rooms.doc(roomCode).get();
		documentExists = doc.exists;
	}
	catch (error) {
		logger.log("error", error);
		return false;
	}
	return documentExists;
}

exports.doesRoomExist = doesRoomExist;

// Delete the game with a given ID
async function deleteGame(gameID) {
	if (gameID == -1) return;
	try {
		const docRef = await games.doc(gameID);
		await docRef.delete();
	}
	catch (error) {
		logger.log("error in deleteGame", error);
	}
}

// Delete the listener with a given ID
async function deleteListener(listenerID) {
	try {
		const docRef = await listeners.doc(listenerID);
		await docRef.delete();
	}
	catch (error) {
		logger.log("error in deleteListener", error);
	}
}

// Delete a room with a given code
async function deleteRoom(roomCode) {
	let roomData = await getRoomData(roomCode);
	let listenData = roomData.listenDocumentID;
	console.log(listenData);
	let gameID = roomData.gameID;
	await deleteListener(listenData);
	await deleteGame(gameID);
	try {
		const docRef = await rooms.doc(roomCode);
		await docRef.delete();
	}
	catch (error) {
		logger.log("error in deleteRoom", error);
	}
}

// Parameters: roomData, userID
// Returns: playerID
// Finds the playerID given a userID and roomData
function getPlayerID(roomData, userID) {
	let myPlayerID = -1;
	for (let i = 0; i < roomData.users.length; i++) {
		if (roomData.users[i].userID == userID) {
			myPlayerID = roomData.users[i].playerID;
		}
	}
	return myPlayerID;
}

exports.getPlayerID = getPlayerID;

// gets room data, returns undefined if there is an error/no room. (helper function)
async function getRoomData(roomCode) {
	let roomExists = await doesRoomExist(roomCode);
	let roomData = undefined;
	if (!roomExists) { return undefined; }

	try {
		const doc = await rooms.doc(roomCode).get();
		if (doc.exists) {
			roomData = doc.data();
		}
	} catch (error) {
		logger.log("error in getRoomData", error);
		return undefined;
	}

	return roomData;
}

exports.getRoomData = getRoomData;

// Parameters: gameID
// Returns: gameState
// Gets the gameState of a given gameID
async function getGameData(gameID) {
	let gameData = undefined;
	try {
		const doc = await games.doc(gameID).get();
		if (doc.exists) {
			gameData = doc.data();
			return gameData;
		} else {
			return undefined;
		}
	}
	catch (error) {
		logger.log("error", error);
		return undefined; //currently undefined
	}
}

exports.getGameData = getGameData;

// Cleans the game state of all private data that is not the given player's
function cleanGameState(gameState, playerID) {
	const partialGameState = deepcopy(gameState);
	partialGameState.gameID = -1;

	// Remove all ambushes that are not the current player's,
	// and add gang members to the respective player's gang members for their public total
	let newAmbushes = [];
	partialGameState.ambushes.forEach((ambush) => {
		let ownerID = ambush.playerID;
		if (ownerID == playerID)
			newAmbushes.push(ambush);
		else
			partialGameState.players[ownerID].numGangMembers += ambush.numGangMembers;
	});
	partialGameState.ambushes = newAmbushes;

	// Remove all hideouts except the current player's
	for (let i = 0; i < partialGameState.players.length; i++)
		if (i != playerID)
			partialGameState.players[i].hideouts.length = 0;

	return partialGameState;
}

// makes a room with a random room code
// returns the room code of the room created
// parameters none.
exports.makeRoom = onRequest(async (req, res) => {
	let roomCode, DRE;
	do {
		roomCode = generateRandomRoomCode();
		DRE = await doesRoomExist(roomCode);
	} while (DRE);
	const result = { error: errorCodes.noError, roomCode: "" };
	const roomData = deepcopy(defaultRoom);
	roomData.roomCode = roomCode;
	roomData.listenDocumentID = uuidv4();
	const myDocument = await listeners
		.doc(roomData.listenDocumentID)
		.set({
			gameStarted: false,
			counter: 0
		})

	const writeResult = await rooms
		.doc(roomCode)
		.set(roomData);
	result.roomCode = roomCode;
	res.json(result);
	return;
});

// a user joins a room
// parameters: name, roomCode
// returns the user id and the id of the document to listen to
//example: /joinRoom?roomCode=CAIVKX&name=thomas
exports.joinRoom = onRequest(async (req, res) => {
	const name = req.query.name;
	const roomCode = req.query.roomCode;
	result = {
		error: errorCodes.noError,
		userID: "",
		roomListener: ""
	}

	// Check if parameters exist
	if (name === undefined || roomCode === undefined) {
		result.error = errorCodes.missingParameters;
		res.json(result);
		return;
	}

	// Check if name is valid
	if (!validateName(name)) {
		result.error = errorCodes.invalidName;
		res.json(result);
		return;
	}

	// Check if room exits
	let roomData = await getRoomData(roomCode);
	if (roomData === undefined) {
		result.error = errorCodes.roomNotFound;
		res.json(result);
		return;
	}

	// Check if therer is already a user with that name
	roomData.users.forEach((user) => {
		if (user.name === name) {
			result.error = errorCodes.nameDuplicate;
		}
	});

	// Check if room is open
	if (!roomData.open) {
		result.error = errorCodes.roomClosed;
	}

	// Check if the room is full
	if (roomData.users.length >= 6) {
		result.error = errorCodes.roomFull;
	}

	if (result.error != errorCodes.noError) {
		res.json(result);
		return;
	}

	// Assign userID with UUID and make new user
	userID = uuidv4();
	user = {
		name: name,
		userID: userID,
		playerID: -1,
		roomCode: roomCode
	}

	// Add user to room
	roomData.users.push(user);
	const writeResult = await rooms
		.doc(roomCode)
		.set(roomData);

	await updateListener(roomData.listenDocumentID, false);

	result.userID = user.userID;
	result.roomListener = roomData.listenDocumentID
	res.json(result);
	return;
});

// a user leaves a room
// the room is still a lobby at this point
// example /leaveRoom?userID=a795ec39-0388-4d3f-8178-6a4469091142&roomCode=UEUXDN
exports.leaveRoom = onRequest(async (req, res) => {
	const userID = req.query.userID;
	const roomCode = req.query.roomCode;
	const result = {
		error: errorCodes.noError
	};

	// Check if the userID and roomCode are provided
	if (userID === undefined || roomCode === undefined) {
		result.error = errorCodes.missingParameters;
		res.json(result);
		return;
	}

	// Check if room exists
	let roomData = await getRoomData(roomCode);
	if (roomData == undefined) {
		result.error = errorCodes.roomNotFound;
		res.json(result);
		return;
	}

	// Check if room is closed
	if (!roomData.open) {
		result.error = errorCodes.roomClosed;
	}

	// Check if user is in room
	let userInRoom = false;
	for (let i = 0; i < roomData.users.length; i++) {
		if (roomData.users[i].userID == userID) userInRoom = true;
	}
	if (!userInRoom) result.error = errorCodes.userNotFound;

	if (result.error != errorCodes.noError) {
		res.json(result);
		return;
	}

	let userIndex;
	for(let i = 0; i < roomData.users.length; i++) {
		if(roomData.users[i].userID == userID) userIndex = i;
	}

	// Remove the user from the room
	roomData.users.splice(userIndex, 1);

	// Check if user is the only one in the room
	if (roomData.users.length == 0) {
		deleteRoom(roomCode);
		res.json(result);
		return;
	}

	const writeResult = rooms
		.doc(roomCode)
		.set(roomData);

	await updateListener(roomData.listenDocumentID, false);
	res.json(result);
	return;
});

// starts the game for a room
// parameters: roomCode, userID
// /startGame?userID=a795ec39-0388-4d3f-8178-6a4469091142&roomCode=UEUXDN
exports.startGame = onRequest(async (req, res) => {
	const roomCode = req.query.roomCode;
	const userID = req.query.userID;
	const result = {
		error: errorCodes.noError
	};

	// Check if parameters exist
	if (roomCode === undefined || userID === undefined) {
		result.error = errorCodes.missingParameters;
		res.json(result);
		return;
	}

	// Check if room exists
	let roomData = await getRoomData(roomCode);
	if (roomData === undefined) {
		result.error = errorCodes.roomNotFound;
		res.json(result);
		return;
	}

	// Invalid host
	if (roomData.users.length == 0 ||
		roomData.users[0].userID != userID) {
		result.error = errorCodes.invalidHost;
	}

	// Room is closed
	if (!roomData.open) {
		result.error = errorCodes.roomClosed;
	}

	if (result.error != errorCodes.noError) {
		res.json(result);
		return;
	}

	// Generates new gameState
	const gameID = uuidv4();
	roomData.gameID = gameID;
	const myGameState = deepcopy(defaultGameState)
	myGameState.gameID = gameID;

	// Creates and adds new players to the gameState
	for (let i = 0; i < roomData.users.length; i++) {
		let currentPlayer = deepcopy(defaultPlayer);
		currentPlayer.name = roomData.users[i].name;
		currentPlayer.playerID = i;
		roomData.users[i].playerID = i;
		myGameState.players.push(currentPlayer);
	}

	roomData.open = false;

	const makeGameapplyDocument = await games
		.doc(gameID)
		.set(myGameState);

	const changeRoomData = await rooms
		.doc(roomCode)
		.set(roomData);

	await updateListener(roomData.listenDocumentID, true);
	res.json({ error: errorCodes.noError });
	return;
})

// gets the lobby information for a room
// parameters: roomCode, userID
// returns the host, whether the requester is the host, the room listener, and the users in the room
exports.getRoomInfo = onRequest(async (req, res) => {
	const roomCode = req.query.roomCode;
	const userID = req.query.userID;
	let result = {
		error: errorCodes.noError,
		host: "",
		requesterIsHost: false,
		roomListener: "",
		usersInRoom: []
	}

	// Check if parameters exist
	if (roomCode === undefined || userID === undefined) {
		result.error = errorCodes.missingParameters;
		res.json(result);
		return;
	}

	// Check if room exists
	console.log(userID);
	let roomData = await getRoomData(roomCode);
	if (roomData === undefined) {
		result.error = errorCodes.roomNotFound;
		res.json(result);
		return;
	}

	// Check if user exists
	let userInRoom = false;
	console.log(userID);
	console.log(roomData);
	for (let i = 0; i < roomData.users.length; i++) {
		console.log(roomData.users[i].userID);
		if (roomData.users[i].userID == userID) userInRoom = true;
	}

	if (!userInRoom) {
		result.error = errorCodes.userNotFound;
		res.json(result);
		return;
	}

	// Check if user is host
	result.host = roomData.users[0].name;
	result.roomListener = roomData.listenDocumentID;
	if (userInRoom && roomData.users[0].userID == userID) {
		result.requesterIsHost = true;
	}

	// Get users in room
	for (let i = 0; i < roomData.users.length; i++) {
		result.usersInRoom.push(roomData.users[i].name);
	}

	res.json(result);
	return;
});

// Parameters: roomCode, userID
// Returns: a cleaned gameState with only private data for the given user, or error code if needed
exports.getGameState = onRequest(async (req, res) => {
	const roomCode = req.query.roomCode;
	const userID = req.query.userID;
	const result = {
		error: errorCodes.noError,
		gameState: undefined
	};

	// Check if parameters exist
	if (roomCode === undefined || userID === undefined) {
		result.error = errorCodes.missingParameters;
		res.json(result);
		return;
	}

	// Check if room exists
	let roomData = await getRoomData(roomCode);
	if (roomData === undefined) {
		result.error = errorCodes.roomNotFound;
		res.json(result);
		return;
	}

	// Check if user exists
	let userInRoom = false;
	for (let i = 0; i < roomData.users.length; i++) {
		console.log(roomData.users[i].userID);
		if (roomData.users[i].userID == userID) userInRoom = true;
	}
	if (!userInRoom) result.error = errorCodes.userNotFound;

	//  Check if game exists
	let gameID = roomData.gameID;
	let gameState = await getGameData(gameID);
	if (gameState == undefined) {
		result.error = errorCodes.gameNotFound;
	}

	if (result.error != errorCodes.noError) {
		res.json(result);
		return;
	}

	// Clean private data from the game state
	let playerID = getPlayerID(roomData, userID);
	gameState = cleanGameState(gameState, playerID);
	result.gameState = gameState;

	res.json(result);
	return;
})
