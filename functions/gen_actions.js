exports.getActionsForTurn = onRequest((req, res) => {
	const user_UUID = req.query.user;
	const roomCode = req.query.roomCode;
	result = {
		"error": errorCodes.noError,
		"userID": ""
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

});