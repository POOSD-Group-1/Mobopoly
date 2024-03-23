import { useNavigate } from "react-router-dom";
import "../styles.css";

const JoinRoom = () => {
    const navigate = useNavigate();
    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo"  />
            <input type="text" placeholder="Enter Room Code" className="text-input" />
            <div className="button-row">
                <button className="action-button" onClick={() => navigate("/game")}>Join Room</button>
            </div>
        </div>
    );
};

export default JoinRoom;
