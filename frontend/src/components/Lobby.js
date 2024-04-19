import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Card, Typography, CardHeader, Avatar, IconButton, Backdrop, CircularProgress } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { doc, onSnapshot } from "firebase/firestore";
import { db, errorCodes, getRoomInfo, leaveRoom, startGame } from "../data/firebase.js";
import { pieceImgFile } from "../data/util.js";
import "../styles.css";

function Lobby() {
    const navigate = useNavigate();
    const { roomCode } = useParams();
    if (roomCode === undefined) {
        navigate("/");
    }
    const [loaded, setLoaded] = useState(false);
    const [userID, setUserID] = useState(null);
    const [name, setName] = useState(null);
    const [roomListener, setRoomListener] = useState(null);
    const [host, setHost] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [userNames, setUserNames] = useState([]);
    const refreshRoomData = async () => {
        if (userID === null || roomListener === null) return;
        let response;
        try {
            response = await getRoomInfo({ roomCode, userID });
        } catch (err) {
            console.error(err);
            return;
        }
        if (response === undefined || response.error === undefined || response.error !== errorCodes.noError) {
            console.log("error:" + response.error)
            return;
        }
        const { roomListener: newRoomListener, usersInRoom, requesterIsHost, host } = response;
        setRoomListener(newRoomListener);
        setIsHost(requesterIsHost);
        setHost(host);
        setUserNames(usersInRoom);
        setLoaded(true);
    }
    // Load data from local storage
    useEffect(() => {
        const data = localStorage.getItem(roomCode);
        if (data !== null) {
            const { userID, roomListener, name } = JSON.parse(data);
            setUserID(userID);
            setRoomListener(roomListener);
            setName(name);
            refreshRoomData();
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
                refreshRoomData();
            } else {
                navigate("/game/" + roomCode);
            }
        });
        return () => unsubscribe();
    }, [roomListener]);
    // Leave the room
    const clickLeaveRoom = async () => {
        if (userID === null || roomCode === null) return;
        try {
            localStorage.removeItem(roomCode);
            leaveRoom({ roomCode, userID }).then((response) => {
                if (response === undefined || response.error === undefined || response.error !== errorCodes.noError) {
                    console.log("error:" + response.error)
                    return;
                }
            });
            navigate("/");
        } catch (err) {
            console.error(err);
        }
    };
    const canStartGame = isHost && userNames.length > 1;
    const userList = userNames.map((user, i) =>
        <Card key={i} raised sx={{ display: "flex", }}>
            <CardHeader
                avatar={<Avatar
                    sx={{ bgcolor: 'transparent' }}
                    variant="square" alt="Player Icon"
                ><img src={pieceImgFile(i)} style={{ width: 24, height: 24, objectFit: 'contain' }} /></Avatar>}
                title={
                    <div className="flex-row">
                        <Typography variant="subtitle1">
                            {user}
                        </Typography>
                        {host === user && <Typography variant="subtitle1" sx={{ color: "red" }}>&nbsp;(Host)</Typography>}
                        {name === user && <Typography variant="subtitle1" sx={{ color: "green" }}>&nbsp;(You)</Typography>}
                    </div>
                }
            />
            {name === user && <IconButton variant="contained" onClick={clickLeaveRoom} sx={{ marginLeft: "auto" }}>
                <CloseIcon />
            </IconButton>}
        </Card>
    );
    const clickStartGame = async () => {
        if (!canStartGame) return;
        try {
            setLoaded(false);
            const response = await startGame({ roomCode, userID });
            setLoaded(true);
            if (response === undefined || response.error === undefined || response.error !== errorCodes.noError) {
                console.log("error:" + response.error)
                return;
            }
        } catch (err) {
            console.error(err);
            setLoaded(true);
        }
    };
    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo-small" />
            <div style={{ position: "relative" }}>
                <Card className="lobby" raised>
                    <Typography variant="h3">Room Code: {roomCode}</Typography>
                    <Typography variant="h5">Players:</Typography>
                    {userList}
                    {isHost && <Button variant="contained" onClick={clickStartGame}
                        disabled={!canStartGame} sx={{ marginTop: "1rem" }}>Start Game</Button>}
                    {!isHost && <Typography variant="subtitle1" sx={{ marginTop: "1rem" }}>
                        Waiting for host to start the game...</Typography>}
                </Card>
                <Backdrop open={!loaded} sx={{ position: "absolute" }}>
                    <CircularProgress color="inherit"/>
                </Backdrop>
            </div>
        </div>)
}

export default Lobby;
