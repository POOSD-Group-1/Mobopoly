import { useContext, useState } from 'react';
import { GameContext } from './Game';
import { Card, Collapse, Typography, IconButton, CardContent, Box } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { getLocationColor } from '../data/board';
import { getTextColor } from '../data/util';

function Location({ location }) {
    const gameState = useContext(GameContext);
    const [expanded, setExpanded] = useState(false);
    const property = gameState.properties[location];
    const playerID = property.playerID;
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Card className="location" sx={{ borderLeftColor: getLocationColor(location) }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                {!expanded && <Typography variant='body2'
                    sx={{ marginLeft: "1rem", marginRight: "1rem" }}>{property.name}</Typography>}
                <IconButton
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                    sx={{ marginLeft: "auto" }}
                >
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </div>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Box sx={{
                        backgroundColor: getLocationColor(location),
                        padding: "0.5rem", border: "2px solid black",
                        marginBottom: "0.5rem", 
                    }}>
                        <Typography variant="subtitle1" sx={{
                            textAlign: "center",
                            color: getTextColor(getLocationColor(location))
                        }}>{property.name}</Typography>
                    </Box>
                    <Typography variant="body">Cost: ${property.cost}</Typography><br />
                    <Typography variant="body">Tribute: ${property.rent}</Typography><br />
                    <Typography variant="body">Owned by: {playerID == -1 ? "No one" : gameState.players[playerID].name}</Typography>
                </CardContent>
            </Collapse>
        </Card>
    );
}

export default Location;
