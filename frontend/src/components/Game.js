import Phaser from 'phaser';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { Typography, ToggleButtonGroup, ToggleButton, Icon, Button } from '@mui/material';
import { KeyboardArrowDown, Casino, AttachMoney } from '@mui/icons-material';
import { boardWidth, boardHeight } from '../data/board';
import initialGameJSON from '../data/initialGame.json';
import initialUserJSON from '../data/initialUser.json';
import { phaserPieceImgFile } from '../data/util';
import { GameState, User, fromJSON } from '../data/types';
import gameScene from "../phaser/gameScene";
import Player from './Player';
import ActionMenu from './ActionMenu';
import "../styles.css";

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
    const [selectedUser, setSelectedUser] = useState(-1);

    const changeSelectedUser = (event, newSelectedUser) => {
        if (newSelectedUser === null) {
            setSelectedUser(-1);
            return;
        }
        setSelectedUser(newSelectedUser);
    }

    const updatePlayers = () => {
        if (phaserGame.current.scene.getScene('gameScene')) {
            const freq = gameState.properties.map(() => 0);
            let locations = gameState.players.map(player => [-1, -1]);
            for (let i = 0; i < gameState.players.length; i++) {
                const idx = (gameState.turn.playerTurn + i + (gameState.turn.hasRolledDice ? 1 : 0)) % gameState.players.length;
                locations[idx] = [gameState.players[idx].location, freq[gameState.players[idx].location]];
                freq[gameState.players[idx].location] += 1;
            }
            phaserGame.current.scene.getScene('gameScene').updatePlayers(locations);
        }
    };
    useEffect(() => {
        if (!phaserGame.current) {
            phaserGame.current = new Phaser.Game(gameConfig);
            phaserGame.current.scene.start('gameScene', { numPlayers: gameState.players.length });
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
    const playerIcons =
        <ToggleButtonGroup value={selectedUser} className="player-icon-container" exclusive
            onChange={changeSelectedUser}>
            {gameState.players.map((player, i) =>
                <ToggleButton value={i} onClick={() => setSelectedUser(i)}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {gameState.turn.playerTurn == i ? <KeyboardArrowDown /> : <Icon />}
                        <img key={i} src={phaserPieceImgFile(player.playerID)} className="player-icon"
                            style={{
                                objectFit: 'contain',
                                filter: player.isAlive ? 'none' : 'grayscale(100%)'
                            }} />
                    </div>
                </ToggleButton>)}
        </ToggleButtonGroup>
    return <GameContext.Provider value={gameState}>
        <UserContext.Provider value={user}>
            <div className="game-player-container">
                <div id="game" />
                <div className="flex-column">
                    <Typography variant="h4" sx={{ display: "inline-block" }}>Players</Typography>
                    <Typography variant="body1" sx={{ display: "inline-block" }}>
                        It's {gameState.players[gameState.turn.playerTurn].name}'s Turn!</Typography>
                    {playerIcons}
                    {selectedUser !== -1 && <Player player={gameState.players[selectedUser]} />}
                </div>
                <ActionMenu />
            </div>
        </UserContext.Provider>
    </GameContext.Provider>
}

export { GameContext, UserContext };
export default Game;
