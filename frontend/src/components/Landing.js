import { useNavigate, Link } from "react-router-dom";
import { Button } from '@mui/material';
import "../styles.css";

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className="landing">
            <Link to="/" style={{ display: "flex", justifyContent: "center", flexDirection: "row" }}>
                <img src="/assets/logo.png" alt="Monopoly Logo" className="logo"  />
            </Link>
            <div className="button-row">
                <Button variant="contained" onClick={() => navigate("/create")}>Create a Room</Button>
                <Button variant="contained" onClick={() => navigate("/join")}>Join a Room</Button>
            </div>
        </div>
    );
};

export default Landing;
