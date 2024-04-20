const { v4: uuidv4 } = require('uuid');

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
	invalidAction: -9,
	gameNotFound: -10
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