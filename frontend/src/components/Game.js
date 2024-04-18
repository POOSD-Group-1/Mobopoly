import Phaser from 'phaser';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { Typography, ToggleButtonGroup, ToggleButton, Icon, Tabs, Tab, Box, Grid } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import gameScene from "../phaser/gameScene";
import { boardWidth, boardHeight } from '../data/board';
import initialGameJSON from '../data/initialGame.json';
import initialUserJSON from '../data/initialUser.json';
import { pieceImgFile } from '../data/util';
import { GameState, User, fromJSON } from '../data/types';
import { db, errorCodes, getGameState } from "../data/firebase.js";
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
    const navigate = useNavigate();
    const { roomCode } = useParams();
    // if (roomCode === undefined) {
    //     navigate("/");
    // }
    const phaserGame = useRef(null);
    const [userID, setUserID] = useState(null);
    const [name, setName] = useState(null);
    const [roomListener, setRoomListener] = useState(null);
    const [actions, setActions] = useState([]);
    const [user, setUser] = useState(fromJSON(initialUserJSON, User));
    const [gameState, setGameState] = useState(fromJSON(initialGameJSON, GameState));
    const [selectedUser, setSelectedUser] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);

    const refreshGameData = async () => {
        if (userID === null || roomListener === null) return;
        let response;
        try {
            response = await getGameState({ roomCode, userID });
        } catch (err) {
            console.error(err);
            return;
        }
        if (response === undefined || response.error !== errorCodes.noError) {
            console.log("error:" + response.error)
            return;
        }
        const { gameState: newGameState } = response;
        console.log(newGameState);
        if (newGameState === null || newGameState === undefined) {
            return;
        }
        setGameState(newGameState);
    };
    // load data from local storage
    useEffect(() => {
        if (roomCode === undefined) {
            return;
        }
        const data = localStorage.getItem(roomCode);
        if (data !== null) {
            const { userID, roomListener, name } = JSON.parse(data);
            setUserID(userID);
            setRoomListener(roomListener);
            setName(name);
            console.log(userID, roomListener, name);
        } else {
            // navigate("/");
        }
    }, [roomCode]);

    // Listen for changes in the room
    useEffect(() => {
        if (roomListener === null) return;
        const unsubscribe = onSnapshot(doc(db, "listeners", roomListener), (doc) => {
            const { counter, gameStarted } = doc.data();
            if (!gameStarted) {
                navigate("/");
            } else {
                refreshGameData();
            }
        });
        return () => unsubscribe();
    }, [roomListener]);

    // get Player Actions
    useEffect(() => {
        const refreshActions = async () => {
            if (roomListener === null || roomCode === undefined) return;
            // let response;
            // try {
            //     response = await functionCall();
            // } catch(err) {
            //     console.error(err);
            //     return;
            // }
            // if (response === undefined || response.error !== errorCodes.noError) {
            //     console.log("error:" + response.error)
            //     return;
            // }
            // setActions(response.actions);
        };
        refreshActions();
    }, [gameState]);

    const changeSelectedUser = (event, newSelectedUser) => {
        if (newSelectedUser === null) {
            setSelectedUser(-1);
            return;
        }
        setSelectedUser(newSelectedUser);
    }

    const handleTabIndex = (event, newTabIndex) => {
        setTabIndex(newTabIndex);
    };

    const updatePlayers = () => {
        if (phaserGame.current.scene.getScene('gameScene')) {
            const freq = gameState.properties.map(() => 0);
            let locations = gameState.players.map(player => [-1, -1]);
            for (let i = 0; i < gameState.players.length; i++) {
                const idx = (gameState.turn.playerTurn + i + (gameState.turn.hasRolledDice ? 1 : 0)) % gameState.players.length;
                if (gameState.players[idx].isAlive) {
                    locations[idx] = [gameState.players[idx].location, freq[gameState.players[idx].location]];
                    freq[gameState.players[idx].location] += 1;
                }
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
                <ToggleButton key={i} value={i} onClick={() => setSelectedUser(i)} sx={{ width: "5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {gameState.turn.playerTurn == i ? <KeyboardArrowDown /> : <Icon />}
                        <img key={i} src={pieceImgFile(player.playerID)} className="player-icon"
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
                <Box sx={{ width: "100%" }}>
                    <Tabs value={tabIndex} onChange={handleTabIndex} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                        <Tab label="Game Info" />
                        <Tab label="History" />
                    </Tabs>

                    {tabIndex == 0 &&
                        <Grid container width="100%" spacing={2}>
                            <Grid item xs={6}>
                                <div className="flex-column">
                                    <Typography variant="h4" sx={{ display: "inline-block" }}>Players</Typography>
                                    <Typography variant="body1" sx={{ display: "inline-block" }}>
                                        It's {gameState.players[gameState.turn.playerTurn].name}'s Turn!</Typography>
                                    {playerIcons}
                                    {selectedUser !== -1 && <Player player={gameState.players[selectedUser]} />}
                                </div>

                            </Grid>
                            <Grid item xs={6}>
                                <ActionMenu />

                            </Grid>
                        </Grid>
                    }
                    {tabIndex == 1 &&
                        <Box>
                            <Typography variant="h4">History</Typography>
                            <Typography variant="body1">Coming soon...</Typography>
                        </Box>}
                </Box>
            </div>
        </UserContext.Provider>
    </GameContext.Provider>
}

export { GameContext, UserContext };
export default Game;
