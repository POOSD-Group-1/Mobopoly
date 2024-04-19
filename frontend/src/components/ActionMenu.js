import { useContext, useState, useEffect } from "react";
import { Typography, Button, Card, CardActions } from "@mui/material";
import { Casino, AttachMoney, Apartment, Stop } from "@mui/icons-material";
import { GameContext } from "./Game";
import "../styles.css";
import InputSlider from "./InputSlider";
import { actionTypes, errorCodes, getActionsForTurn, applyAction } from "../data/firebase";

function ActionMenu({ roomCode, userID, roomListener }) {
    const gameState = useContext(GameContext);
    const [ambushGangMembers, setAmbushGangMembers] = useState(1);
    const [wagerGangMembers, setWagerGangMembers] = useState(0);
    const [diceActions, setDiceActions] = useState([]);
    const [wagerActions, setWagerActions] = useState([]);
    const [buyPropertyActions, setBuyPropertyActions] = useState([]);
    const [createHideoutActions, setCreateHideoutActions] = useState([]);
    const [createAmbushActions, setCreateAmbushActions] = useState([]);
    const [endTurnActions, setEndTurnActions] = useState([]);
    const minWager = 0;
    const [maxWager, setMaxWager] = useState(0);
    const minAmbush = 1;
    const [maxAmbush, setMaxAmbush] = useState(0);


    const extractActions = (actions) => {
        setDiceActions(actions.filter(action => action.type === actionTypes.ROLL_DICE));
        let wagerActions = actions.filter(action => action.type === actionTypes.WAGER);
        wagerActions.forEach(action => {
            setMaxWager(action.numGangMembers);
        });
        setWagerActions(wagerActions);
        setBuyPropertyActions(actions.filter(action => action.type === actionTypes.BUY_PROPERTY));
        setCreateHideoutActions(actions.filter(action => action.type === actionTypes.CREATE_HIDEOUT));
        let ambushActions = actions.filter(action => action.type === actionTypes.CREATE_AMBUSH);
        ambushActions.forEach(action => {
            setMaxAmbush(action.numGangMembers);
        });
        setCreateAmbushActions(ambushActions);
        setEndTurnActions(actions.filter(action => action.type === actionTypes.END_TURN));
    };

    const clickRollDice = () => {
        doAction({ type: actionTypes.ROLL_DICE });
    };
    const clickWager = () => {
        doAction({ type: actionTypes.WAGER, numGangMembers: wagerGangMembers });
    };
    const clickBuyProperty = () => {
        doAction({ type: actionTypes.BUY_PROPERTY });
    };
    const clickCreateHideout = () => {
        doAction({ type: actionTypes.CREATE_HIDEOUT });
    };
    const clickCreateAmbush = () => {
        doAction({ type: actionTypes.CREATE_AMBUSH, numGangMembers: ambushGangMembers });
    };
    const clickEndTurn = () => {
        doAction({ type: actionTypes.END_TURN });
    };

    const doAction = async (action) => {
        try {
            let numGangMembers = action.numGangMembers === undefined ? 0 : action.numGangMembers;
            let response = await applyAction({ roomCode, userID, type: action.type, numGangMembers});
            if (response === undefined || response.error !== errorCodes.noError) {
                console.log("error:" + response.error);
                return;
            }
        } catch (err) {
            console.error(err);
            return;
        }
    };

    // get Player Actions
    useEffect(() => {
        const refreshActions = async () => {
            if (roomListener === null || roomCode === undefined || gameState === null) return;
            let response;
            try {
                response = await getActionsForTurn({ roomCode, userID });
                console.log(response);
            } catch (err) {
                console.error(err);
                return;
            }
            if (response === undefined || response.error !== errorCodes.noError) {
                console.log("error:" + response.error);
                return;
            }
            extractActions(response.actions);
        };
        refreshActions();
    }, [gameState]);

    const hasActions = diceActions.length > 0 || wagerActions.length > 0 || buyPropertyActions.length > 0 || createHideoutActions.length > 0 || createAmbushActions.length > 0 || endTurnActions.length > 0;

    return <div className="action-menu">
        <Typography variant="h5">Actions</Typography>
        {!hasActions && <Typography variant="body1">No actions available</Typography>}
        {diceActions.length > 0 && <>
            <Button variant="contained" startIcon={<Casino />} onClick={clickRollDice}>
                Roll Dice
            </Button>
            <div className='dice-container'>
                <div className='dice-box'>
                    <Typography variant='h6'>{gameState.dice1 == -1 ? "" : gameState.dice1}</Typography>
                </div>
                <div className='dice-box'>
                    <Typography variant='h6'>{gameState.dice2 == -1 ? "" : gameState.dice2}</Typography>
                </div>
            </div>
        </>}
        {wagerActions.length > 0 && <Card variant="outlined" sx={{ padding: "1rem" }}>
            <Typography variant="body1">Gang Members</Typography>
            <InputSlider min={minWager} max={maxWager} step={1} value={wagerGangMembers} setValue={setWagerGangMembers} />
            <CardActions>
                <Button variant="contained" onClick={clickWager}>Wager</Button>
            </CardActions>
        </Card>}
        {buyPropertyActions.length > 0 && <Button variant="contained" startIcon={<AttachMoney />} onClick={clickBuyProperty}>
            Buy {gameState.properties[gameState.players[gameState.turn.playerTurn].location].name}
        </Button>}
        {createHideoutActions.length > 0 && <Button variant="contained" startIcon={<Apartment />} onClick={clickCreateHideout}>
            Buy Hideout
        </Button>}
        {createAmbushActions.length > 0 && <Card variant="outlined" sx={{ padding: "1rem" }}>
            <Typography variant="body1">Gang Members</Typography>
            <InputSlider min={minAmbush} max={maxAmbush} step={1} value={ambushGangMembers} setValue={setAmbushGangMembers} />
            <CardActions>
                <Button variant="contained" onClick={clickCreateAmbush}>Set Ambush</Button>
            </CardActions>
        </Card>}
        {endTurnActions.length > 0 && <Button variant="contained" startIcon={<Stop />} onClick={clickEndTurn}>Complete Turn</Button>}
        
    </div>
}

export default ActionMenu;
