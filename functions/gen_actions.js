exports.getActionsForTurn = onRequest((request, response) => {
	const user_UUID = request.query.user;
	const roomCode = request.query.roomCode;
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