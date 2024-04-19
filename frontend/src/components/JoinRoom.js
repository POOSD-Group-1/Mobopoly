import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, FormHelperText, CircularProgress } from '@mui/material';
import ErrorMessage from "./ErrorMessage.js";
import { joinRoom, errorCodes, getErrorMessage } from "../data/firebase.js";
import { randomName, validateName, getNameHelperText, validateRoomCode, getRoomCodeHelperText } from "../data/util.js";
import "../styles.css";

const JoinRoom = () => {
    const [name, setName] = useState(randomName());
    const [roomCode, setRoomCode] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const [joining, setJoining] = useState(false);
    const navigate = useNavigate();
    const changeName = (e) => {
        setName(e.target.value);
    }
    const changeRoomCode = (e) => {
        setRoomCode(e.target.value);
    }
    const canJoin = validateName(name) && validateRoomCode(roomCode);
    const goToRoom = async (event) => {
        event.preventDefault();
        if (!canJoin) return;
        if (localStorage.getItem(roomCode) !== null) {
            setErrorMessage("You have already joined the room.");
            return;
        }
        try {
            setJoining(true);
            const response = await joinRoom({ roomCode, name });
            setJoining(false);
            if (response === undefined || response.error === undefined) {
                console.error("response to joinRoom undefined");
                return;
            }
            if (response.error != errorCodes.noError) {
                setErrorMessage(getErrorMessage(response.error));
                return;
            }
            setErrorMessage(null);
            console.log(response);
            const { userID, roomListener } = response;
            console.log(userID, roomListener);
            localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener, name }));
            navigate(`/room/${roomCode}`);
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <form className="landing" onSubmit={goToRoom}>
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo" />
            <TextField variant="outlined" label="Enter a Name" required
                value={name}
                onChange={changeName}
                error={!validateName(name)}
                helperText={getNameHelperText(name)} />
            <div style={{ height: "1rem" }} />
            <TextField variant="outlined" label="Enter Room Code" required
                value={roomCode}
                onChange={changeRoomCode}
                error={!validateRoomCode(roomCode)}
                helperText={getRoomCodeHelperText(roomCode)} />
            {errorMessage !== null && <ErrorMessage error={errorMessage} />}
            <div className="button-row">
                <Button variant="contained" disabled={!canJoin} type="submit" 
                sx={{ marginTop: "1rem" }} startIcon={joining ? <CircularProgress size={20} color="inherit"/> : null}>
                    Join Room</Button>
            </div>
        </form>
    );
};

export default JoinRoom;
