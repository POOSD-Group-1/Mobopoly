import { useNavigate } from "react-router-dom";
import "../styles.css";

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo"  />
            <div className="button-row">
                <button className="action-button" onClick={() => navigate("/createroom")}>Create a Room</button>
                <button className="action-button" onClick={() => navigate("/join")}>Join a Room</button>
            </div>
        </div>
    );
};

export default Landing;
