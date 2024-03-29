import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from '@mui/material';
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
                <Button variant="contained" onClick={() => navigate("/game")} sx={{ marginTop: "1rem" }}>Join Room</Button>
            </div>
        </div>
    );
};

export default JoinRoom;
