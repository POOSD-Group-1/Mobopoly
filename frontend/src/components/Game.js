import Phaser from 'phaser';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { boardWidth, boardHeight } from '../data/board';
import initialGameJSON from '../data/initialGame.json';
import initialUserJSON from '../data/initialUser.json';
import { GameState, User, fromJSON } from '../data/types';
import gameScene from "../phaser/gameScene";
import Player from './Player';

const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game',
    width: boardWidth,
    height: boardHeight,
    physics: {
        default: 'arcade',
        arcade: {
            // gravity: { y: 200 }
        }
    },
    scene: gameScene
};

const UserContext = createContext(fromJSON(initialUserJSON, User));
const GameContext = createContext(fromJSON(initialGameJSON, GameState));
function Game() {
    const phaserGame = useRef(null);
    const [user, setUser] = useState(fromJSON(initialGameJSON, User));
    const [gameState, setGameState] = useState(fromJSON(initialGameJSON, GameState));
    useEffect(() => {
        if (!phaserGame.current)
            phaserGame.current = new Phaser.Game(gameConfig);

        return () => {
            if (phaserGame.current) {
                phaserGame.current.destroy(true);
                phaserGame.current = null;
            }
        };
    }, []);
    console.log(gameState);
    const players = <div className="player-container">
        {gameState.players.map((player, i) => <Player key={i} player={player} />)}
    </div>
    return <GameContext.Provider value={gameState}>
        <UserContext.Provider value={user}>
            <div className="game-player-container">
                <div id="game" />
                {players}
            </div>
        </UserContext.Provider>
    </GameContext.Provider>
}

export { GameContext, UserContext };
export default Game;
