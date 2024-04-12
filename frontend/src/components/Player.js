import { useContext } from 'react';
import { GameContext } from './Game';
import { pieceImgFile } from '../data/util.js';
import { Avatar, Card, CardContent, CardHeader, Typography } from '@mui/material';

function Player({ player }) {
    const gameState = useContext(GameContext);
    const { playerID, name, location, money, hideouts, properties } = player;
    return (
        <Card className="player">
            <CardHeader
                avatar={<Avatar sx={{ width: 24, height: 24 }} src={pieceImgFile(playerID)} alt="Player Icon" />}
                title={name}
            />
            <CardContent>
                <Typography variant="body">Location: {gameState.properties[location].name}</Typography><br />
                <Typography variant="body">Money: {money}</Typography><br />
                <Typography variant="body">Hideouts: {hideouts.length}</Typography><br />
                <Typography variant="body">Properties: {properties.length}</Typography>
            </CardContent>
        </Card>
    );
}

export default Player;
