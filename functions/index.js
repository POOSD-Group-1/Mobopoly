//import {v4 as uuidv4} from 'uuid';
const {v4} = require('uuid');
const initialGameState = require("./Default_Game_State.json");
const defaultPlayer = require("./defaultPlayer.json")
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

/**
 * Currently, all of this code is either being copied from 
 * https://firebase.google.com/docs/functions/get-started
 * or left in from the default index.js file. 
 */

// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {logger} = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

const firebaseApp = initializeApp()
const db = getFirestore(firebaseApp)
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started



// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addmessage = onRequest(async (req, res) => {
	// Grab the text parameter.
	const original = req.query.text;
	// Push the new message into Firestore using the Firebase Admin SDK.
	const writeResult = await getFirestore()
		.collection("messages")
		.add({original: original});
	// Send back a message that we've successfully written the message
	res.json({result: `Message with ID: ${writeResult.id} added.`});
});

function makeRandomID(){
	const length = 6;
	const roomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let roomCode = "";
	for(let i = 0; i < length; i++){
		roomCode+=roomCharacters.charAt(Math.floor(Math.random() * roomCharacters.length));
	}
	return roomCode;
}	

const roomDataTemplate = {
	"gameID": -1,
	"users": [
	],
	"open": true,
	"roomCode": "",
	"listenDocumentID": "",
};



async function doesRoomExist(roomCode){
    const re = new RegExp("^[A-Z]{6}$");
    if(!re.test(roomCode)) return false;
    const docRef = db.collection('rooms').doc(roomCode);
    let documentExists = false;
    try {
        const doc = await docRef.get();
        documentExists = doc.exists;
    }
    catch(error) {
        logger.log("error", error);
        return false;
    }
    return documentExists;
}

const errorCodes = Object.freeze({
    noError: 0,
    roomNotFound: -1,
    invalidName: -2,
    roomClosed: -3,
    roomFull: -4,
    nameInvalid: -5,
    nameDuplicate: -6,
    invalidHost: -7,
    userNotFound: -8
});

exports.startgame = onRequest(async (req, res) => {
	const roomCode = req.query.roomCode;
	const userID = req.query.userID
	let DRE = await doesRoomExist(roomCode);
	if(!DRE){
		res.json({error: errorCodes.roomNotFound});
		return;
	}

	const docRef = db.collection('rooms').doc(roomCode);
	let roomData = 0;
	await docRef.get().then((doc) => {
		if(doc.exists){ roomData = doc.data();
		}else{
			res.json({error: errorCodes.roomNotFound});
			return;
		}
	}).catch((error) => {
		logger.log("error",error);
		res.json({error: errorCodes.roomNotFound});
		return;
	});

	if(roomData.users.length == 0 || 
	   roomData.users[0].userID != userID){
		console.log(roomData.user[0].userID);
		console.log(userID);
		res.json({error:errorCodes.invalidHost});
		return;
	}

	gameID = v4();
	roomData.gameID = gameID;
	let myGameState = initialGameState;
	myGameState.gameID = gameID;
	for(let i = 0; i < roomData.users.length; i++){
		currentPlayer = defaultPlayer;
		currentPlayer.name = roomData.users[i].name;
		currentPlayer.playerID = i;
		roomData.users[i].playerID = i;
		roomData.open = false;
		myGameState.players.push(currentPlayer);
	}

	const makeGameDocument = await getFirestore()
		.collection("games")
		.doc(gameID)
		.set(myGameState);

	const changeRoomData = await getFirestore()
		.collection("rooms")
		.doc(roomCode)
		.set(roomData)
	
	updateListener(roomData.listenDocumentID,true);
	res.json({error: errorCodes.noError});
	return;
})


exports.makeroom = onRequest(async (req, res) => {
	let roomCode = makeRandomID();
	let DRE = await doesRoomExist(roomCode);
	while(DRE){
		roomCode = makeRandomID();
		DRE = await doesRoomExist(roomCode);
	}
	roomData = roomDataTemplate;
	roomData.roomCode = roomCode;
	roomData.listenDocumentID = v4();
	const myDocument = await getFirestore()
		.collection("listeners")
		.doc(roomData.listenDocumentID)
		.set({
			gameStarted: false,
			counter: 0
		})

	const writeResult = await getFirestore()
		.collection("rooms")
		.doc(roomCode)
		.set(roomData);
	return;
});

function validateName(name){
	const re = new RegExp("^(([a-zA-Z0-9]([a-zA-Z0-9 ]{0,8})[a-zA-Z0-9])|[a-zA-Z0-9])$");
	return re.test(name);
}





async function updateListener(listenerID,startGame){
	const docRef = db.collection('listeners').doc(listenerID);
	let listenerData = {
		gameStarted: false,
		counter: -1
	}
	await docRef.get().then((doc) => {
		if(doc.exists){
			listenerData = doc.data();
		}else{
			return;
		}
	}).catch((error) => {
		logger.log("error",error);
		return;
	});
	
	if(listenerData.counter == -1) return;
	listenerData.counter++;
	if(startGame) listenerData.gameStarted = true; 
	const listenerUpdate = await getFirestore()
	.collection("listeners")
	.doc(listenerID)
	.set(listenerData)
};

exports.joinroom = onRequest(async (req, res) => {

	const name = req.query.name;
	const roomCode = req.query.roomCode;
	result = {
		"error": errorCodes.noError,
		"userID": "",
		"gameListener": ""
	}

	
	if(!validateName(name)){
		result.error = errorCodes.invalidName;
		res.json(result);
		return;
	}
	
	let DRE = await doesRoomExist(roomCode);
	if(!DRE){
		result.error = errorCodes.roomNotFound;
		res.json(result);
		return;
	}
	
	const docRef = db.collection('rooms').doc(roomCode);
	
	let roomData = 0;
	await docRef.get().then((doc) => {
		if(doc.exists){
			roomData = doc.data();
		}else{
			result.error = errorCodes.roomNotFound;
			res.json(result);
			return;
		}
	}).catch((error) => {
		logger.log("error",error);
		result.error = errorCodes.roomNotFound;
		res.json(result);
		return;
	});
	
	let foundDuplicate = false
	roomData.users.forEach((user) => {
		if(user.name === name){
			result.error = errorCodes.nameDuplicate;
			foundDuplicate = true;
			res.json(result);
		}
	});

	if(foundDuplicate) return;
	
	if(roomData.open == false){
		result.error = errorCodes.roomClosed;
		res.json(result);
		return;
	}
	
	if(roomData.users.length >= 6){
		result.error = errorCodes.roomFull;
		res.json(result);
		return;
	}
	
	userID = v4(); //assign userID with UUID 
	User = {
		"name": name,
		"userID": userID,
		"playerID": -1,
		"roomCode": roomCode
	}

	roomData.users.push(User);
	const writeResult = await getFirestore()
		.collection("rooms")
		.doc(roomCode)
		.set(roomData);

	await updateListener(roomData.listenDocumentID,false);
	
	result.userID = User.userID;
	result.gameListener = roomData.listenDocumentID
	res.json(result);
	return;
});


// Listens for new messages added to /messages/:documentId/original
// and saves an uppercased version of the message
// to /messages/:documentId/uppercase
exports.makeuppercase = onDocumentCreated("/messages/{documentId}", (event) => {
	// Grab the current value of what was written to Firestore.
	const original = event.data.data().original;
  
	// Access the parameter `{documentId}` with `event.params`
	logger.log("Uppercasing", event.params.documentId, original);
  
	const uppercase = original.toUpperCase();
  
	// You must return a Promise when performing
	// asynchronous tasks inside a function
	// such as writing to Firestore.
	// Setting an 'uppercase' field in Firestore document returns a Promise.
	return event.data.ref.set({uppercase}, {merge: true});
});