import { Vector2 } from './util.js';
import initialGameJSON from './initialGame.json';


const boardWidth = 600;
const boardHeight = 600;

const MAX_PLAYERS = 6;

const center = new Vector2(boardWidth / 2, boardHeight / 2);


// the anchor for where the players should be placed on each location on the board
const locationAnchors = [new Vector2(240, 215), new Vector2(180, 215), 
    new Vector2(135, 215), new Vector2(90, 215), new Vector2(45, 215), new Vector2(0, 215), new Vector2(-45, 215)];

// where to put the players on each location relative to the location anchor
// bottom row, left column, top row, right column
// corners: ???
const playerAnchors = [new Vector2(-10, 0), new Vector2(10, 0)];

function getLocationColor(location) {
    if (initialGameJSON.properties[location].name.includes("Brown")){
        return "#784D3C";
    }
    else if(initialGameJSON.properties[location].name.includes("Light Blue")){
        return "#B9DAED";
    }
    else {
        return "transparent";
    }
}


export { boardWidth, boardHeight, center, locationAnchors, playerAnchors, MAX_PLAYERS, getLocationColor };
