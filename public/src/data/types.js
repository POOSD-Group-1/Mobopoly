function fromJSON(json, type) {
    return Object.assign(new type(), json);
}

class GameState {
    gameID = -1;
    players = [];
    properties = [];
    ambushes = [];
    playerTurn = 0;
    static from(json) {
        return Object.assign(new GameState(), json);
    }
}


class Property {
    cost = 0;
    rent = 0;
    location = -1;
    playerID = -1;
    name = "";
}

class Player {
    playerID = -1;
    location = 0;
    numGangMembers = 0;
    money = 0;
    hideouts = [];
    properties = [];
}

class User {
    name = "";
    userID = -1;
    playerID = -1;
    roomCode = "";
    static from(json) {
        return Object.assign(new User(), json);
    }
}

class Ambush {
    location = -1;
    numGangMembers = 0;
    playerID = -1;
}

export { fromJSON, GameState, Property, User };
