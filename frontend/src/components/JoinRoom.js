import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from '@mui/material';
import { joinRoom, errorCodes } from "../data/firebase.js";
import { randomName, validateName, getNameHelperText, validateRoomCode, getRoomCodeHelperText } from "../data/util.js";
import "../styles.css";

const JoinRoom = () => {
    const [name, setName] = useState(randomName());
    const [roomCode, setRoomCode] = useState("");
    const navigate = useNavigate();
    const changeName = (e) => {
        setName(e.target.value);
    }
    const changeRoomCode = (e) => {
        setRoomCode(e.target.value);
    }
    const canJoin = validateName(name) && validateRoomCode(roomCode);
    const goToRoom = async () => {
        if(!canJoin) return;
        if(localStorage.getItem(roomCode) !== null) {
            // TODO: make this visible to the user
            console.error("You have already joined the room.");
            return;
        }
        try {
            const response = await joinRoom({ roomCode, name });
            if (response === undefined || response.error === undefined || response.error !== errorCodes.noError) {
                console.log("error:" + response.error)
                return;
            }
            console.log(response);
            const { userID, roomListener } = response;
            console.log(userID, roomListener);
            localStorage.setItem(roomCode, JSON.stringify({ userID, roomListener, name }));
            navigate(`/room/${roomCode}`);
        } catch(err) {
            console.error(err);
        }
    };
    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo" />
            <TextField variant="outlined" label="Enter a Name"
                value={name}
                onChange={changeName}
                error={!validateName(name)}
                helperText={getNameHelperText(name)} />
            <div style={{ height: "1rem" }} />
            <TextField variant="outlined" label="Enter Room Code"
                value={roomCode}
                onChange={changeRoomCode}
                error={!validateRoomCode(roomCode)}
                helperText={getRoomCodeHelperText(roomCode)} />
            <div className="button-row">
                <Button variant="contained" disabled={!canJoin} onClick={goToRoom} sx={{ marginTop: "1rem" }}>Join Room</Button>
            </div>
        </div>
    );
};

export default JoinRoom;
