import { useContext, useState } from 'react';
import { GameContext } from './Game';
import { Card, Collapse, Typography, IconButton, CardContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getLocationColor } from '../data/board';

function Location({ location }) {
    const gameState = useContext(GameContext);
    const [expanded, setExpanded] = useState(false);
    const property = gameState.properties[location];
    const playerID = property.playerID;
    console.log(playerID)
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Card className="location" sx={{ borderLeftColor: getLocationColor(location) }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <Typography variant='body2' sx={{ marginLeft: "1rem", marginRight: "1rem" }}>{property.name}</Typography>
                <IconButton
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                >
                    <ExpandMoreIcon />
                </IconButton>
            </div>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Typography variant="body">Cost: ${property.cost}</Typography><br />
                    <Typography variant="body">Rent: ${property.rent}</Typography><br />
                    <Typography variant="body">Owned by: {playerID == -1 ? "No one" : gameState.players[playerID].name}</Typography>
                </CardContent>
            </Collapse>
        </Card>
    );
}

export default Location;
