import { Vector2 } from './util.js';
import initialGameJSON from './initialGame.json';

const minDim = Math.min(window.innerWidth, window.innerHeight);
const boardWidth = minDim;
const boardHeight = minDim;
const referenceDim = 600;
const scaleFactor = minDim / referenceDim;

const playerDim = 20 * scaleFactor;



const MAX_PLAYERS = 6;

const center = new Vector2(boardWidth / 2, boardHeight / 2);

let playerAnchorIndex = [];
for (let i = 0; i < 8; i++) {
    playerAnchorIndex.push(0);
}
for (let i = 0; i < 7 + 7 + 6; i++) {
    playerAnchorIndex.push(1);
}

// the anchor for where the players should be placed on each location on the board
const bottomRowY = 230;
const bottomRowStartX = 183;
const bottomRowOffset = -73.2;
let locationAnchorsUnscaled = [new Vector2(260, bottomRowY), new Vector2(bottomRowStartX, bottomRowY)];
for (let i = 0; i < 5; i++) {
    locationAnchorsUnscaled.push(new Vector2(locationAnchorsUnscaled[locationAnchorsUnscaled.length - 1].x + bottomRowOffset, bottomRowY));
}
locationAnchorsUnscaled.push(new Vector2(-255, bottomRowY));
const leftColumnX = -255;
const leftColumnStartY = 185;
const leftColumnOffset = -73.2;
locationAnchorsUnscaled.push(new Vector2(leftColumnX, leftColumnStartY));
for (let i = 0; i < 6; i++) {
    locationAnchorsUnscaled.push(new Vector2(leftColumnX, locationAnchorsUnscaled[locationAnchorsUnscaled.length - 1].y + leftColumnOffset));
}
const topRowY = -253;
const topRowOffset = -bottomRowOffset;
const topRowStartX = -257 + topRowOffset;
locationAnchorsUnscaled.push(new Vector2(topRowStartX, topRowY));
for (let i = 0; i < 6; i++) {
    locationAnchorsUnscaled.push(new Vector2(locationAnchorsUnscaled[locationAnchorsUnscaled.length - 1].x + topRowOffset, topRowY));
}
const rightColumnX = 255;
const rightColumnOffset = -leftColumnOffset;
const rightColumnStartY = topRowY + rightColumnOffset;
locationAnchorsUnscaled.push(new Vector2(rightColumnX, rightColumnStartY));
for (let i = 0; i < 6; i++) {
    locationAnchorsUnscaled.push(new Vector2(rightColumnX, locationAnchorsUnscaled[locationAnchorsUnscaled.length - 1].y + rightColumnOffset));
}
const locationAnchors = locationAnchorsUnscaled.map((anchor) => anchor.clone().scale(scaleFactor));

// where to put the players on each location relative to the location anchor
// bottom row, left column, top row, right column
// corners: ???

const playerAnchorsUnscaled = [
    [new Vector2(-25, 0), new Vector2(0, 0), new Vector2(25, 0),
        new Vector2(-25, 55), new Vector2(0, 55), new Vector2(25, 55)],
    [new Vector2(-25, 0), new Vector2(0, 0), new Vector2(25, 0),
        new Vector2(-25, 22), new Vector2(0, 22), new Vector2(25, 22)]
];
const playerAnchors = playerAnchorsUnscaled.map((anchorArr) => anchorArr.map((anchor)=>anchor.clone().scale(scaleFactor)));
console.log(locationAnchorsUnscaled);
function getLocationColor(location) {
    if (initialGameJSON.properties[location].name.includes("Brown")) {
        return "#784D3C";
    }
    else if (initialGameJSON.properties[location].name.includes("Light Blue")) {
        return "#B9DAED";
    }
    else if (initialGameJSON.properties[location].name.includes("Magenta")) {
        return "#A93A7F";
    }
    else if (initialGameJSON.properties[location].name.includes("Orange")) {
        return "#D58A37";
    }
    else if (initialGameJSON.properties[location].name.includes("Red")) {
        return "#BB292C";
    }
    else if (initialGameJSON.properties[location].name.includes("Yellow")) {
        return "#FFF039";
    }
    else if (initialGameJSON.properties[location].name.includes("Green")) {
        return "#5EA45C";
    }
    else if (initialGameJSON.properties[location].name.includes("Dark Blue")) {
        return "#2C67A1";
    }
    else {
        return "#FFFFFF";
    }
}


export { boardWidth, boardHeight, playerDim, scaleFactor, center, locationAnchors, playerAnchors, playerAnchorIndex, MAX_PLAYERS, getLocationColor };
