import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from '@mui/material';
import { randomName, validateName, getNameHelperText } from "../data/util.js";
import "../styles.css";

const CreateRoom = () => {
    const navigate = useNavigate();
    const [name, setName] = useState(randomName());
    const error = !validateName(name);
    const changeName = (e) => {
        setName(e.target.value);
    }

    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo" />
            <TextField variant="outlined" label="Enter a Name"
                value={name}
                onChange={changeName}
                error={error}
                helperText={getNameHelperText(name)} />
            <div className="button-row">
                <Button variant="contained" disabled={error}
                    onClick={() => navigate("/room?roomCode=EFRG")} sx={{ marginTop: "1rem" }}>Create Room</Button>
            </div>
        </div>
    );
};

export default CreateRoom;
