import Phaser from 'phaser';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { boardWidth, boardHeight, zoomFactor } from '../data/board';
import initialGameJSON from '../data/initialGame.json';
import initialUserJSON from '../data/initialUser.json';
import { GameState, User, fromJSON } from '../data/types';
import gameScene from "../phaser/gameScene";
import Player from './Player';
import { Typography } from '@mui/material';

const gameConfig = {
    type: Phaser.AUTO,
    parent: 'game',
    width: boardWidth,
    height: boardHeight,
    scene: gameScene
};

const UserContext = createContext(fromJSON(initialUserJSON, User));
const GameContext = createContext(fromJSON(initialGameJSON, GameState));
function Game() {
    const phaserGame = useRef(null);
    const [user, setUser] = useState(fromJSON(initialUserJSON, User));
    const [gameState, setGameState] = useState(fromJSON(initialGameJSON, GameState));

    const updatePlayers = () => {
        if (phaserGame.current.scene.getScene('gameScene')) {
            const freq = new Map();
            let locations = gameState.players.map(player => [-1, -1]);
            for(let i = 0; i < gameState.players.length; i++) {
                const idx = (gameState.playerTurn + i) % gameState.players.length;
                if(!freq.has(gameState.players[idx].location)) freq.set(gameState.players[idx].location, 0);
                locations[idx] = [gameState.players[idx].location, freq.get(gameState.players[idx].location)];
                freq.set(gameState.players[idx].location, freq.get(gameState.players[idx].location) + 1);
            }
            phaserGame.current.scene.getScene('gameScene').updatePlayers(locations);
        }
    };
    useEffect(() => {
        if (!phaserGame.current) {
            phaserGame.current = new Phaser.Game(gameConfig);
            phaserGame.current.scene.start('gameScene', {numPlayers: gameState.players.length});
            phaserGame.current.events.once('ready', () => {
                updatePlayers();
            });
        }

        return () => {
            if (phaserGame.current) {
                phaserGame.current.destroy(true);
                phaserGame.current = null;
            }
        };
    }, []);
    useEffect(() => {
        updatePlayers();
    }, [gameState.players]);
    const players = <div className="player-container">
        {gameState.players.map((player, i) => <Player key={i} player={player} />)}
    </div>
    return <GameContext.Provider value={gameState}>
        <UserContext.Provider value={user}>
            <div className="game-player-container">
                <div id="game" />
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Typography variant="h4">Players</Typography>
                    <Typography variant="body1">It's {gameState.players[gameState.playerTurn].name}'s Turn!</Typography>
                    {players}
                </div>
            </div>
        </UserContext.Provider>
    </GameContext.Provider>
}

export { GameContext, UserContext };
export default Game;
