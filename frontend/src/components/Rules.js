import { Link } from "react-router-dom";
import { Typography, List, ListItem, ListItemText } from "@mui/material";
import "../styles.css";

function Rules() {
    const basicRules = [
        "The game is played on a board divided into squares. Each square represents a property or an action.",
        "Players take turns rolling dice and moving their tokens around the board.",
        "When a player lands on a property, they can choose to buy it if it's available.",
        "When another player lands on a property owned by someone else, they have to pay tribute.",
        "The goal of the game is to bankrupt the other players and become the wealthiest player."
    ];
    const additionalRules = [
        "Jail is a special square. Players can be sent to jail if they land on the 'Go to Jail' square or draw a certain card.",
        "Players can also be sent to jail because the Go to Jail square.",
        "Betrayal is a key square in the game. Gang members desert the player's gang and steal some of their money.",
        "The game ends when only one player is left standing."
    ];
    return <div className="rules">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Link to="/" style={{ display: "flex", justifyContent: "center", flexDirection: "row" }}>
                <img src="/assets/logo.png" alt="Monopoly Logo" className="logo-rules" />
            </Link>
            {/* <Typography variant="h4">Rules</Typography> */}
        </div>
        <div className="mafia-theme">
            <Typography variant="h5">Mobopoly: A Mafia-Themed Variant of Monopoly</Typography>
            <Typography variant="body1">
                Mobopoly is a mafia-themed variant of the classic board game Monopoly. In Mobopoly, the traditional properties and actions on the board are replaced with mafia-related elements. Instead of buying properties, players can acquire control over various criminal enterprises such as bars, casinos, and smuggling operations.
            </Typography>
            <Typography variant="body1">
                The gameplay in Mobopoly revolves around the world of organized crime. Players take turns rolling dice and moving their tokens around the board, just like in Monopoly. However, instead of collecting rent from other players, players can extort protection money from rival mafia families who land on their controlled properties.
            </Typography>
            <Typography variant="body1">
                Gang Members are a secondary currency in Mobopoly. They help players attack other players through turf wars and ambushes. Gang members also defend players during turf wars and ambushes.
            </Typography>
            <Typography variant="body1">
                You can set ambushes on squares so that when unsuspecting players land on them, they lose money and gang members.
            </Typography>
            <Typography variant="body1">
                If two players land on the same square, then the second player that landed on the square can wager some of their gang members for the chance to attack and defeat the other player's gang members and take some of their money.
            </Typography>
            <Typography variant="body1">
                You can set hideouts to prevent yourself from being ambushed by other players.
            </Typography>
            <Typography variant="body1">
                Jail in Mobopoly is helpful to players. It gives gang members to any player who passes by. 
            </Typography>
            <Typography variant="body1">
                The objective of Mobopoly remains the same as Monopoly: to bankrupt the other players and become the wealthiest player. However, in Mobopoly, players achieve this by expanding their criminal empire, eliminating rival gangs, and controlling lucrative illegal operations.
            </Typography>
            <Typography variant="body1">
                Overall, Mobopoly offers a unique twist on the classic Monopoly game by immersing players in the thrilling world of organized crime. It combines strategic decision-making, negotiation, and a touch of mafia-style ruthlessness to create an exciting and immersive gaming experience.
            </Typography>
        </div>
        <Typography variant="h5">Basic Rules:</Typography>
        <List>
            {basicRules.map((rule, index) => (
                <ListItem key={index}>
                    <ListItemText primary={`${index + 1}. ${rule}`} />
                </ListItem>
            ))}
        </List>
        <Typography variant="h5">Additional Rules:</Typography>
        <List>
            {additionalRules.map((rule, index) => (
                <ListItem key={index}>
                    <ListItemText primary={`${index + 1}. ${rule}`} />
                </ListItem>
            ))}
        </List>
    </div>
}

export default Rules;
