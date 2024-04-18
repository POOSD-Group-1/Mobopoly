const { v4: uuidv4 } = require('uuid');
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
const { logger } = require("firebase-functions");
const { onRequest: onRequestWithoutCors } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const cors = require('cors')({ origin: true });
const onRequest = (handler) => onRequestWithoutCors(async (req, res) => {
	cors(req, res, () => {
		handler(req, res);
	});
});
exports.onRequest = onRequest;

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");


// Initialize the Firebase Admin SDK
const firebaseApp = initializeApp()

// Create exports
exports.logger = logger;
const db = getFirestore(firebaseApp)
exports.db = db;
const rooms = db.collection('rooms');
exports.rooms = rooms;
const listeners = db.collection('listeners');
exports.listeners = listeners;
const games = db.collection('games');
exports.games = games;

const errorCodes = Object.freeze({
	noError: 0,
	roomNotFound: -1,
	invalidName: -2,
	roomClosed: -3,
	roomFull: -4,
	nameDuplicate: -5,
	invalidHost: -6,
	userNotFound: -7,
	missingParameters: -8,
	invalidAction: -9
});
exports.errorCodes = errorCodes;


const { makeRoom, leaveRoom, joinRoom, startGame,getRoomInfo, getGameState  } = require('./room');
const { applyAction, getActionsForTurn } = require('./gameState');
exports.makeRoom = makeRoom;
exports.leaveRoom = leaveRoom;
exports.joinRoom = joinRoom;
exports.startGame = startGame;
exports.getRoomInfo = getRoomInfo;
exports.getGameState = getGameState;
exports.applyAction = applyAction;
exports.getActionsForTurn = getActionsForTurn;


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started



// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addmessage = onRequest(async (req, res) => {
	// Grab the text parameter.
	const original = req.query.text;
	// Push the new message into Firestore using the Firebase Admin SDK.
	const writeResult = await db
		.collection("messages")
		.add({ original: original });
	// Send back a message that we've successfully written the message
	res.json({ result: `Message with ID: ${writeResult.id} added.` });
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
	return event.data.ref.set({ uppercase }, { merge: true });
});
