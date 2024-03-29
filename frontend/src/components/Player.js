import { useContext } from 'react';
import { Avatar, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { GameContext, UserContext } from './Game';
import { pieceImgFile } from '../data/util.js';
import Location from './Location.js';

function Player({ player }) {
    const gameState = useContext(GameContext);
    const user = useContext(UserContext);
    const { playerID, name, location, numGangMembers, money, hideouts, properties } = player;
    const propertyList = properties.map((property) => <Location key={property} location={property} />);
    return (
        <Card className="player" sx={playerID == gameState.playerTurn ? {backgroundColor: "darkgrey"} : {}}>
            <CardHeader
                avatar={<Avatar
                    sx={{ bgcolor: 'transparent' }}
                    variant="square" alt="Player Icon"
                ><img src={pieceImgFile(playerID)} style={{width: 24, height: 24, objectFit: 'contain'}}/></Avatar>}
                title={<Typography variant="subtitle1">{name + (playerID === user.playerID ? ' (You)' : '')}</Typography>}
            />
            <CardContent>
                <Typography variant="body">Location: </Typography><br />
                <Location location={location} /><br />
                <Typography variant="body">Money: {money}</Typography><br />
                <Typography variant="body">Gang Members: {numGangMembers}</Typography><br />
                <Typography variant="body">Hideouts: {hideouts.length}</Typography><br />
                <Typography variant="body">Properties Owned: {properties.length}</Typography>
                <div style={{marginTop: "1rem"}}>
                    {propertyList}
                </div>
            </CardContent>
        </Card>
    );
}

export default Player;
