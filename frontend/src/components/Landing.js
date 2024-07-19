import { useNavigate, Link } from "react-router-dom";
import { Button, IconButton } from '@mui/material';
import { HelpOutline } from "@mui/icons-material";
import "../styles.css";

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className="landing">
            <Link to="/" style={{ display: "flex", justifyContent: "center", flexDirection: "row" }}>
                <img src="/assets/logo.png" alt="Monopoly Logo" className="logo"  />
            </Link>
            <IconButton
                style={{ position: "absolute", top: 0, right: 0 }}
                onClick={() => window.open("/rules")}
            >
                <HelpOutline />
            </IconButton>
            <div style={{ gap: "1rem", display: "flex", flexDirection: "column" }}>
                <Button variant="contained" onClick={() => navigate("/create")}>Create a Room</Button>
                <Button variant="contained" onClick={() => navigate("/join")}>Join a Room</Button>
            </div>
        </div>
    );
};

export default Landing;
