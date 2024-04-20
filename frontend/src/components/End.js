import { useNavigate, useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Card, Typography, CardHeader, Avatar, IconButton, Backdrop, CircularProgress } from "@mui/material";
import { EmojiEvents, HighlightOff } from "@mui/icons-material";
import { errorCodes, getGameState } from "../data/firebase.js";
import { pieceImgFile } from "../data/util.js";
import "../styles.css";

function End() {
    const navigate = useNavigate();
    const { roomCode } = useParams();
    if (roomCode === undefined) {
        navigate("/");
    }
    const [userID, setUserID] = useState(null);
    const [name, setName] = useState(null);
    const [roomListener, setRoomListener] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [loaded, setLoaded] = useState(roomCode === undefined);
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
    console.log(roomListener, roomCode, userID);
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
    // wait for room data to load
    useEffect(() => {
        if (userID === null || roomCode === undefined) return;
        refreshGameData();
    }, [roomListener]);
    const playerList = gameState === null ? [] : gameState.players.map((player, i) =>
        <Card key={i} raised sx={{ display: "flex", }}>
            <CardHeader
                avatar={i == gameState.players.length - 1 ? <EmojiEvents sx={{ color: "gold" }} /> : <HighlightOff sx={{ color: "red" }} />}
                title={
                    <div className="flex-row">
                        <Typography variant="subtitle1">
                            {player.name}
                        </Typography>
                        {name === player.name && <Typography variant="subtitle1" sx={{ color: "green" }}>&nbsp;(You)</Typography>}
                    </div>
                }
            />
        </Card>
    );
    playerList.reverse();

    return (
        <div className="landing">
            <Link to="/" style={{ display: "flex", justifyContent: "center", flexDirection: "row" }}>
                <img src="/assets/logo.png" alt="Monopoly Logo" className="logo-small" />
            </Link>

            <div style={{ position: "relative" }}>
                <Card className="lobby" raised>
                    <Typography variant="h3">Game {roomCode} is Over!</Typography>
                    <Typography variant="h5">Players:</Typography>
                    {playerList}
                </Card>
                <Backdrop open={!loaded} sx={{ position: "absolute" }}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </div>
        </div>)
}

export default End;
