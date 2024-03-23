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
function Game() {
    const phaserGame = useRef(null);
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
    return <UserContext.Provider>
        <div className="game-player-container">
            <div id="game" />
            {players}
        </div>
    </UserContext.Provider>
}

export default Game;