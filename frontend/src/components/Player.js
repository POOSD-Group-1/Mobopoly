import { useContext } from 'react';
import { Avatar, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { GameContext } from './Game';
import { pieceImgFile } from '../data/util.js';
import Location from './Location.js';

function Player({ player, user }) {
    const { playerID, name, location, numGangMembers, money, hideouts, properties, isAlive, isBot } = player;
    const propertyList = properties.map((property) => <Location key={property} location={property} />);
    return (
        <Card className="player">
            <CardHeader
                avatar={<Avatar
                    sx={{ bgcolor: 'transparent' }}
                    variant="square" alt="Player Icon"
                ><img src={pieceImgFile(playerID)} style={{
                    width: 24, height: 24, objectFit: 'contain', filter: isAlive ? 'none' : 'grayscale(100%)'
                }} /></Avatar>}
                title={<div className='flex-row'>
                    <Typography variant="subtitle1">{name + (name === user ? ' (You)' : '') + (isBot ? ' \u{1F916}' : "")}</Typography>
                    {!isAlive && <Typography variant="subtitle1" sx={{ color: "red" }}>&nbsp;(Deceased)</Typography>}
                </div>
                }
            />
            {isAlive && <CardContent>
                <Typography variant="body">Location: </Typography><br />
                <Location location={location} /><br />
                <Typography variant="body">Money: {money}</Typography><br />
                <Typography variant="body">Gang Members: {numGangMembers}</Typography><br />
                <Typography variant="body">Hideouts: {hideouts.length}</Typography><br />
                <Typography variant="body">Properties Owned: {properties.length}</Typography>
                <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column" }}>
                    {propertyList}
                </div>
            </CardContent>}
        </Card>
    );
}

export default Player;
