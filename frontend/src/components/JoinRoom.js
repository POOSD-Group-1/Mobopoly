import { useNavigate } from "react-router-dom";
import { Button, TextField } from '@mui/material';
import "../styles.css";

const JoinRoom = () => {
    const navigate = useNavigate();
    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo" />
            <TextField variant="outlined" label="Enter a Name" />
            <TextField variant="outlined" label="Enter Room Code" />
            <div className="button-row">
                <Button variant="contained" onClick={() => navigate("/game")} sx={{ marginTop: "1rem" }}>Join Room</Button>
            </div>
        </div>
    );
};

export default JoinRoom;
