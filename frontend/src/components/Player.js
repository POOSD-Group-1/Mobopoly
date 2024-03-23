

function Player({player}) {
    return (
        <div className="player">
            <h1>Player {player.playerID}</h1>
            <p className="player-description">Location: {player.location}</p>
            <p className="player-description">Money: {player.money}</p>
            <p className="player-description">Hideouts: {player.hideouts.length}</p>
            <p className="player-description">Properties: {player.properties.length}</p>
        </div>
    );
}

export default Player;
