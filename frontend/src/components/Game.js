import Phaser from 'phaser';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { Typography, ToggleButtonGroup, ToggleButton, Icon, Tabs, Tab, Box, Grid, Backdrop, CircularProgress, IconButton } from '@mui/material';
import { KeyboardArrowDown, PaletteOutlined, HelpOutlineOutlined, Logout } from '@mui/icons-material';
import gameScene from "../phaser/gameScene";
import { boardWidth, boardHeight, MAX_PLAYERS } from '../data/board';
import initialGameJSON from '../data/initialGame.json';
import initialUserJSON from '../data/initialUser.json';
import { pieceImgFile } from '../data/util';
import { GameState, User, fromJSON } from '../data/types';
import { db, errorCodes, getGameState, quitGame } from "../data/firebase.js";
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

const GameContext = createContext(null);
const ColorContext = createContext(false);
function Game() {
    const navigate = useNavigate();
    const { roomCode } = useParams();
    if (roomCode === undefined) {
        navigate("/");
    }
    const phaserGame = useRef(null);
    const [userID, setUserID] = useState(null);
    const [name, setName] = useState(null);
    const [roomListener, setRoomListener] = useState(null);
    const [loaded, setLoaded] = useState(roomCode === undefined);
    const [gameState, setGameState] = useState(null);
    const [selectedUser, setSelectedUser] = useState(0);
    const [tabIndex, setTabIndex] = useState(0);
    const [boardColor, setBoardColor] = useState(false);

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
        setLoaded(true);
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
            navigate("/");
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
        if (phaserGame.current.scene.getScene('gameScene') && gameState !== null) {
            const freq = gameState.properties.map(() => 0);
            let locations = [];
            for (let i = 0; i < MAX_PLAYERS; i++) locations.push([-1, -1]);
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
    const toggleBoardColor = () => {
        if (phaserGame.current.scene.getScene('gameScene')) {
            phaserGame.current.scene.getScene('gameScene').toggleBoardColor();
            setBoardColor((prev) => !prev);
        }
    }
    const clickQuitGame = async () => {
        if (userID === null || roomCode === null) return;
        try {
            let reponse = await quitGame({ roomCode, userID });
            if (reponse === undefined || reponse.error === undefined || reponse.error !== errorCodes.noError) {
                console.log("error:" + reponse.error)
                return;
            }
            localStorage.removeItem(roomCode);
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        if (!phaserGame.current) {
            phaserGame.current = new Phaser.Game(gameConfig);
            phaserGame.current.scene.start('gameScene', { numPlayers: MAX_PLAYERS });
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
    }, [gameState]);

    if (gameState !== null && gameState.isGameOver) {
        navigate("/end/" + roomCode);
    }

    return <GameContext.Provider value={gameState}>
        <ColorContext.Provider value={boardColor}>
        <div className="game-player-container">
            <div id="game" />
            <Box sx={{ width: "100%" }}>
                <div className="flex-row" style={{ borderBottom: "1px solid", borderColor: "divider" }}>
                    <Tabs value={tabIndex} onChange={handleTabIndex} >
                        <Tab label="Game Info" />
                        <Tab label="History" />
                    </Tabs>
                    <div style={{ marginLeft: "auto" }}>
                        <IconButton onClick={toggleBoardColor}>
                            <PaletteOutlined />
                        </IconButton>
                        <IconButton>
                            <HelpOutlineOutlined />
                        </IconButton>
                        <IconButton onClick={clickQuitGame}>
                            <Logout/>
                        </IconButton>
                    </div>
                </div>
                {tabIndex == 0 && gameState !== null &&
                    <Grid container width="100%" spacing={2}>
                        <Grid item xs={6}>
                            <div className="flex-column">
                                <Typography variant="h4" sx={{ display: "inline-block" }}>Players</Typography>
                                <Typography variant="body1" sx={{ display: "inline-block" }}>
                                    It's {gameState.players[gameState.turn.playerTurn].name}'s Turn!</Typography>
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
                                {selectedUser !== -1 && <Player player={gameState.players[selectedUser]} user={name} />}
                            </div>

                        </Grid>
                        <Grid item xs={6}>
                            <ActionMenu roomCode={roomCode} userID={userID} roomListener={roomListener} />

                        </Grid>
                    </Grid>
                }
                {tabIndex == 1 && gameState !== null &&
                    <Box>
                        <Typography variant="h4">History</Typography>
                        <Typography variant="body1">Coming soon...</Typography>
                    </Box>}
            </Box>
            <Backdrop open={!loaded}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
        </ColorContext.Provider>
    </GameContext.Provider>
}

export { GameContext, ColorContext };
export default Game;
