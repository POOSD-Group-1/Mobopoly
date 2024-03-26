import { Vector2 } from './util.js';
const boardWidth = 600;
const boardHeight = 600;

const MAX_PLAYERS = 6;

const center = new Vector2(boardWidth / 2, boardHeight / 2);


// the anchor for where the players should be placed on each location on the board
const locationAnchors = [new Vector2(200, 215), new Vector2(180, 215), new Vector2(90, 215)];

// where to put the players on each location relative to the location anchor
// bottom row, left column, top row, right column
const playerAnchors = [new Vector2(-10, 0)];


export { boardWidth, boardHeight, center, locationAnchors, playerAnchors, MAX_PLAYERS };
