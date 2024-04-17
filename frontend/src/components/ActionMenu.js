import { useContext, useState } from "react";
import { Typography, Button, Card, CardActions } from "@mui/material";
import { Casino, AttachMoney, Apartment } from "@mui/icons-material";
import { GameContext } from "./Game";
import "../styles.css";
import InputSlider from "./InputSlider";

function ActionMenu() {
    const gameState = useContext(GameContext);
    const [ambushGangMembers, setAmbushGangMembers] = useState(1);
    const [wagerGangMembers, setWagerGangMembers] = useState(1);
    const [wagerMoney, setWagerMoney] = useState(1);
    return <div className="action-menu">
        <Typography variant="h5">Actions</Typography>

        <Button variant="contained" startIcon={<Casino />} disabled={gameState.turn.hasRolledDice}>
            Roll Dice
        </Button>
        <div className='dice-container'>
            <div className='dice-box'>
                <Typography variant='h6'>1</Typography>
            </div>
            <div className='dice-box'>
                <Typography variant='h6'>6</Typography>
            </div>
        </div>
        <Button variant="contained" startIcon={<AttachMoney />}>
            Buy {gameState.properties[gameState.players[gameState.turn.playerTurn].location].name}
        </Button>
        <Button variant="contained" startIcon={<Apartment />}>
            Buy Hideout
        </Button>
        <Card variant="outlined" sx={{padding: "1rem"}}>
            <Typography variant="body1">Gang Members</Typography>
            <InputSlider min={1} max={20} step={1} value={wagerGangMembers} setValue={setWagerGangMembers} />
            <Typography variant="body1">Money</Typography>
            <InputSlider min={1} max={50} step={1} value={wagerMoney} setValue={setWagerMoney} />
            <CardActions>
                <Button variant="contained">Wager</Button>
            </CardActions>
        </Card>
        <Card variant="outlined" sx={{padding: "1rem"}}>
            <Typography variant="body1">Gang Members</Typography>
            <InputSlider min={1} max={20} step={1}  value={ambushGangMembers} setValue={setAmbushGangMembers} />
            <CardActions>
                <Button variant="contained">Set Ambush</Button>
            </CardActions>
        </Card>
    </div>
}

export default ActionMenu;
