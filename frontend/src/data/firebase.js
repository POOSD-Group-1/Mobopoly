import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyClh8rI28Fgmrd9n6980D2DTx8NvaFU4Nc",
    authDomain: "mobopoly-866b1.firebaseapp.com",
    databaseURL: "https://mobopoly-866b1-default-rtdb.firebaseio.com",
    projectId: "mobopoly-866b1",
    storageBucket: "mobopoly-866b1.appspot.com",
    messagingSenderId: "862610469598",
    appId: "1:862610469598:web:d049ea0023812b4c0c884f",
    measurementId: "G-1G45B69ZXL"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const baseURL = "https://us-central1-mobopoly-866b1.cloudfunctions.net/";

const createFunction = (functionName) => {
    const func = async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
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
});

export { db, errorCodes, makeRoom, joinRoom, getRoomInfo };
