import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button, Card, Typography, CardHeader, Avatar } from "@mui/material";
import { doc, onSnapshot } from "firebase/firestore";
import { db, errorCodes, getRoomInfo } from "../data/firebase.js";
import { pieceImgFile } from "../data/util.js";
import "../styles.css";

function Lobby() {
    const navigate = useNavigate();
    const { roomCode } = useParams();
    if (roomCode === undefined) {
        navigate("/");
    }
    const [userID, setUserID] = useState(null);
    const [roomListener, setRoomListener] = useState(null);
    const [host, setHost] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [userNames, setUserNames] = useState([]);
    const refreshRoomData = async () => {
        if (userID === null || roomListener === null) return;
        const response = await getRoomInfo({ roomCode, userID });
        if (response === undefined || response.error === undefined || response.error !== errorCodes.noError) {
            console.log("error:" + response.error)
            return;
        }
        const { roomListener: newRoomListener, usersInRoom, requesterIsHost, host } = response;
        setRoomListener(newRoomListener);
        setIsHost(requesterIsHost);
        setHost(host);
        setUserNames(usersInRoom);
    }
    useEffect(() => {
        const data = localStorage.getItem(roomCode);
        if (data !== null) {
            const { userID, roomListener } = JSON.parse(data);
            setUserID(userID);
            setRoomListener(roomListener);
            refreshRoomData();
        }
    }, [roomCode]);
    useEffect(() => {
        if (roomListener !== null) {
            const unsubscribe = onSnapshot(doc(db, "listeners", roomListener), (doc) => {
                const { counter, gameStarted } = doc.data();
                if (!gameStarted) {
                    refreshRoomData();
                }
            });
            return () => unsubscribe();
        }
    }, [roomListener]);
    const userList = userNames.map((user, i) =>
        <Card key={i} raised>
            <CardHeader
                avatar={<Avatar
                    sx={{ bgcolor: 'transparent' }}
                    variant="square" alt="Player Icon"
                ><img src={pieceImgFile(i)} style={{ width: 24, height: 24, objectFit: 'contain' }} /></Avatar>}
                title={
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        <Typography variant="subtitle1">
                            {user}
                        </Typography>
                        {host === user && <Typography variant="subtitle1" sx={{ color: "red" }}>&nbsp;(Host)</Typography>}
                        { }
                    </div>
                }
            />
        </Card>
    );
    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo-small" />
            <Card className="lobby" raised>
                <Typography variant="h3">Room Code: {roomCode}</Typography>
                <Typography variant="h5">Players:</Typography>
                {userList}
                {isHost && <Button variant="contained" onClick={() => navigate("/game")} sx={{ marginTop: "1rem" }}>
                    Start Game</Button>}
                {!isHost && <Typography variant="subtitle1" sx={{ marginTop: "1rem" }}>Waiting for host to start the game...</Typography>}
            </Card>
        </div>)
}

export default Lobby;
