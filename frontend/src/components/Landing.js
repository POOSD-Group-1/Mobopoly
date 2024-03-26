import { useNavigate } from "react-router-dom";
import { Button } from '@mui/material';
import "../styles.css";

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className="landing">
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo"  />
            <div className="button-row">
                <Button variant="contained" onClick={() => navigate("/createroom")}>Create a Room</Button>
                <Button variant="contained" onClick={() => navigate("/join")}>Join a Room</Button>
            </div>
        </div>
    );
};

export default Landing;
