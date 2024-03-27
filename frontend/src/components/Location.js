import { useContext } from 'react';
import { GameContext } from './Game';
import { Card, Typography } from '@mui/material';
import { getLocationColor } from '../data/board';

function Location({ location }) {
    const gameState = useContext(GameContext);
    let property = gameState.properties[location];
    return (
        <Card className="location" sx={{borderLeftColor: getLocationColor(location)}}>
            <Typography variant='body2' sx={{marginLeft: "1rem", marginRight: "1rem"}}>{property.name}</Typography>
        </Card>
    );
}

export default Location;
