import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator  } from "firebase/firestore";


const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const DEBUG = false;
if(DEBUG) connectFirestoreEmulator(db, 'localhost', 8080);

const baseURL = DEBUG ? "http://localhost:5001/mobopoly-866b1/us-central1/" : "https://us-central1-mobopoly-866b1.cloudfunctions.net/";

const createFunction = (functionName) => {
    const func = async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        console.log(params);
        const url = `${baseURL}${functionName}?${queryParams}`;
        console.log(url);
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    }
    return func;
}

const makeRoom = createFunction("makeRoom");
const joinRoom = createFunction("joinRoom");
const getRoomInfo = createFunction("getRoomInfo");
const leaveRoom = createFunction("leaveRoom");
const startGame = createFunction("startGame");
const getGameState = createFunction("getGameState");
const getActionsForTurn = createFunction("getActionsForTurn");
const applyAction = createFunction("applyAction");
const quitGame = createFunction("quitGame");

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

const actionTypes = Object.freeze({
    ROLL_DICE: 0,
    WAGER: 1,
    BUY_PROPERTY: 2,
    CREATE_HIDEOUT: 3,
    CREATE_AMBUSH: 4,
    END_TURN: 5
});

function getErrorMessage(errorCode) {
    switch(errorCode) {
        case errorCodes.noError:
            return "No error";
        case errorCodes.roomNotFound:
            return "Room not found";
        case errorCodes.invalidName:
            return "Invalid name";
        case errorCodes.roomClosed:
            return "Room is closed";
        case errorCodes.roomFull:
            return "Room is full";
        case errorCodes.nameDuplicate:
            return "Name is already taken";
        case errorCodes.invalidHost:
            return "Invalid host";
        case errorCodes.userNotFound:
            return "User not found";
        case errorCodes.missingParameters:
            return "Missing parameters";
        case errorCodes.invalidAction:
            return "Invalid action";
        default:
            return "An unknown error occurred";
    }
}

export { db, errorCodes, actionTypes, getErrorMessage, makeRoom, joinRoom, getRoomInfo, leaveRoom, startGame, getGameState, getActionsForTurn, applyAction, quitGame };
