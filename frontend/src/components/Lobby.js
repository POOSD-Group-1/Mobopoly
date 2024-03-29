import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

function Lobby() {
    const navigate = useNavigate();
    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo" />
            <div className="button-row">
                <h1>Room Code: 1234</h1>
                <h2>Players:</h2>
                <ul>
                    <li>Player 1</li>
                    <li>Player 2</li>
                    <li>Player 3</li>
                    <li>Player 4</li>
                </ul>
                <Button variant="contained" onClick={() => navigate("/game")} sx={{ marginTop: "1rem" }}>Start Game</Button>
            </div>
        </div>)
}

export default Lobby;
