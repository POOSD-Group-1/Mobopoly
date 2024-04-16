const { db, listeners } = require('./index');

function generateRandomRoomCode() {
	const length = 6;
	const roomCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let roomCode = "";
	for (let i = 0; i < length; i++) {
		roomCode += roomCharacters.charAt(Math.floor(Math.random() * roomCharacters.length));
	}
	return roomCode;
}
exports.generateRandomRoomCode = generateRandomRoomCode;

function validateName(name) {
	const re = new RegExp("^(([a-zA-Z0-9]([a-zA-Z0-9 ]{0,8})[a-zA-Z0-9])|[a-zA-Z0-9])$");
	return re.test(name);
}
exports.validateName = validateName;

async function updateListener(listenerID, startGame) {
	let listenerData = undefined;
	try {
		const doc = await listeners.doc(listenerID).get();
		if (doc.exists) {
			listenerData = doc.data();
		}
	} catch (error) {
		logger.log("error", error);
	}
	if (listenerData == undefined) return;
	listenerData.counter++;
	if (startGame) listenerData.gameStarted = true;
	const listenerUpdate = await listeners
		.doc(listenerID)
		.set(listenerData)
};
exports.updateListener = updateListener;

function deepcopy(obj) {
	return JSON.parse(JSON.stringify(obj));
}
exports.deepcopy = deepcopy;
