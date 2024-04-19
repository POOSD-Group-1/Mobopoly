const { v4: uuidv4 } = require('uuid');
const { onRequest, rooms, errorCodes, listeners, games,logger } = require('./index');
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
async function deleteGame(gameID){
    if(gameID == -1) return;
    try {
        const docRef = await games.doc(gameID);
        await docRef.delete();
    }
    catch (error) {
        logger.log("error", error);
    }
}

async function deleteListener(listenerID){
    try {
        const docRef = await listeners.doc(listenerID);
        await docRef.delete();
    }
    catch (error) {
        logger.log("error", error);
    }
}

async function deleteRoom(roomCode){
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
        logger.log("error", error);
    }
}

function getPlayerID(roomData,userID){
    let myPlayerID = -1;
    for(let i = 0; i < roomData.users.length; i++){
        if(roomData.users[i].userID == userID){
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
        logger.log("error", error);
        return undefined;
    }

    return roomData;
}

exports.getRoomData = getRoomData;

async function getGameData(gameID){
    let gameData = undefined;
    try {
        const doc = await games.doc(gameID).get();
        if(doc.exists){
            gameData = doc.data();
            return gameData;
        }else{
            return undefined;
        }
    }
    catch (error) {
        logger.log("error", error);
        return undefined; //currently undefined
    }
}

exports.getGameData = getGameData;

function cleanGameState(gameState, playerID) {
    const partialGameState = deepcopy(gameState);
    partialGameState.gameID = -1;

	let newAmbushes = [];
	// add gang members from abushes to public gang member counts except for the current player
    partialGameState.ambushes.forEach((ambush) => {
        let ownerID = ambush.ownerID;
		if(ownerID == playerID) 
			newAmbushes.push(ambush);
		else
	        partialGameState.players[ownerID].gangMembers+=ambush.gangMembers;
    });
    partialGameState.ambushes = newAmbushes;

	// remove all hideouts except the current player's
    for (let i = 0; i < partialGameState.players.length; i++) 
		if(i != playerID)
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

    if (name === undefined || roomCode === undefined) {
        result.error = errorCodes.missingParameters;
        res.json(result);
        return;
    }

    if (!validateName(name)) {
        result.error = errorCodes.invalidName;
        res.json(result);
        return;
    }

    let roomData = await getRoomData(roomCode);
    if (roomData === undefined) {
        result.error = errorCodes.roomNotFound;
        res.json(result);
        return;
    }


    roomData.users.forEach((user) => {
        if (user.name === name) {
            result.error = errorCodes.nameDuplicate;
        }
    });

    if (!roomData.open) {
        result.error = errorCodes.roomClosed;
    }

    if (roomData.users.length >= 6) {
        result.error = errorCodes.roomFull;
    }

    if (result.error != errorCodes.noError) {
        res.json(result);
        return;
    }

    userID = uuidv4(); //assign userID with UUID 
    user = {
        name: name,
        userID: userID,
        playerID: -1,
        roomCode: roomCode
    }

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


    let roomData = await getRoomData(roomCode);
    if (roomData == undefined) {
        result.error = errorCodes.roomNotFound;
        res.json(result);
        return;
    }

    if (!roomData.open) {
        result.error = errorCodes.roomClosed;
    }

    let userIndex = -1;
    for (let i = 0; i < roomData.users.length; i++) {
        if (roomData.users[i].userID === userID) {
            userIndex = i;
            break;
        }
    }

    if (userIndex === -1) {
        result.error = errorCodes.userNotFound;
    }

    if (result.error != errorCodes.noError) {
        res.json(result);
        return;
    }

    roomData.users.splice(userIndex, 1);
    if(roomData.users.length == 0){
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

    if (roomCode === undefined || userID === undefined) {
        result.error = errorCodes.missingParameters;
        res.json(result);
        return;
    }

    let roomData = await getRoomData(roomCode);
    if (roomData === undefined) {
        result.error = errorCodes.roomNotFound;
        res.json(result);
        return;
    }

    if (roomData.users.length == 0 ||
        roomData.users[0].userID != userID) {
        result.error = errorCodes.invalidHost;
    }

    if (!roomData.open) {
        result.error = errorCodes.roomClosed;
    }

    if (result.error != errorCodes.noError) {
        res.json(result);
        return;
    }

    const gameID = uuidv4();
    roomData.gameID = gameID;
    const myGameState = deepcopy(defaultGameState)
    myGameState.gameID = gameID;
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

    if (roomCode === undefined || userID === undefined) {
        result.error = errorCodes.missingParameters;
        res.json(result);
        return;
    }
    console.log(userID);
    let roomData = await getRoomData(roomCode);
    if (roomData === undefined) {
        result.error = errorCodes.roomNotFound;
        res.json(result);
        return;
    }
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

    result.host = roomData.users[0].name;
    result.roomListener = roomData.listenDocumentID;
    if (userInRoom && roomData.users[0].userID == userID) {
        result.requesterIsHost = true;
    }

    for (let i = 0; i < roomData.users.length; i++) {
        result.usersInRoom.push(roomData.users[i].name);
    }
    res.json(result);
    return;
});

exports.getGameState = onRequest(async (req, res) => {
	const roomCode = req.query.roomCode;
	const userID = req.query.userID;
    const result = {
        error: errorCodes.noError,
        gameState: undefined
    };

    if (roomCode === undefined || userID === undefined) {
        result.error = errorCodes.missingParameters;
        res.json(result);
        return;
    }

	let roomData = await getRoomData(roomCode);
    if (roomData === undefined) {
        result.error = errorCodes.roomNotFound;
        res.json(result);
        return;
    }

    let userInRoom = false;
    for(let i = 0; i < roomData.users.length; i++){
        console.log(roomData.users[i].userID);
        if(roomData.users[i].userID == userID) userInRoom = true;
    }

    if(!userInRoom) result.error = errorCodes.userNotFound;
    let gameID = roomData.gameID;
    let gameState = await getGameData(gameID);

    if(gameState == undefined){
        result.error = errorCodes.roomNotFound; //new error code????
    }
    
    if (result.error != errorCodes.noError) {
        res.json(result);
        return;
    }
    
	let playerID = getPlayerID(roomData, userID);
	gameState = cleanGameState(gameState, playerID);
    result.gameState = gameState;

	res.json(result);
	return;
})