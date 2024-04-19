import { Typography, List, ListItem, ListItemText } from "@mui/material";
import "../styles.css";

function Rules() {
    const basicRules = [
        "The game is played on a board divided into squares. Each square represents a property or an action.",
        "Players take turns rolling dice and moving their tokens around the board.",
        "When a player lands on a property, they can choose to buy it if it's available.",
        "If a player owns all the properties of a color group, they can build houses and hotels on them.",
        "When another player lands on a property owned by someone else, they have to pay rent.",
        "The goal of the game is to bankrupt the other players and become the wealthiest player."
    ];
    const additionalRules = [
        "Chance and Community Chest cards provide special instructions and can change the course of the game.",
        "Landing on Income Tax or Luxury Tax squares requires the player to pay a certain amount of money.",
        "Jail is a special square. Players can be sent to jail if they land on the 'Go to Jail' square or draw a certain card.",
        "Players can get out of jail by paying a fine, using a 'Get Out of Jail Free' card, or rolling doubles.",
        "Free Parking is just a resting place and does not have any special rules.",
        "The game ends when only one player is left standing."
    ];
    return <div className="rules">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <img src="/assets/logo.png" alt="Monopoly Logo" className="logo-rules" />
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
                The game introduces new elements to enhance the mafia theme. For example, instead of Chance and Community Chest cards, Mobopoly features "Hitman" and "Informant" cards that can either help players eliminate rival gang members or provide valuable information about their opponents' activities.
            </Typography>
            <Typography variant="body1">
                Jail in Mobopoly represents a safehouse for incarcerated gang members. Players can send rival gang members to jail by landing on specific squares or using certain cards. To get out of jail, players must either pay a hefty bail, use their connections to secure a release, or roll doubles to escape.
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
