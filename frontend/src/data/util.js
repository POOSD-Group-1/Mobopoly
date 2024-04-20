import Phaser from 'phaser';
import { scaleFactor } from './board';

const Vector2 = Phaser.Math.Vector2;

function pieceImgFile(pieceNum) {
    return `/assets/piece${pieceNum}.png`;
}

function phaserPieceImgFile(pieceNum) {
    return `assets/piece${pieceNum}.png`;
}


const nameRegex = /^(([a-zA-Z0-9]([a-zA-Z0-9 ]{0,8})[a-zA-Z0-9])|[a-zA-Z0-9])$/;

function validateName(name) {
    return nameRegex.test(name);
}

function randomName() {
    return "Guest " + (1 + Math.floor(Math.random() * 999));
}

function getNameHelperText(name) {
    if (validateName(name)) return "";
    if (name.length === 0) return "Name should not be empty.";
    if (name.length > 10) return "Name should be at most 10 characters.";
    if (name.charAt(0) == ' ') return "Name should not start with a space.";
    if (name.charAt(name.length - 1) == ' ') return "Name should not end with a space.";
    if (!name.match(/^[a-zA-Z0-9 ]+$/)) return "Name should only contain letters, digits, and spaces.";
    return "Unknown error in name.";
}

const roomCodeRegex = /^[A-Z]{6}$/;

function validateRoomCode(roomCode) {
    return roomCodeRegex.test(roomCode);
}

function getRoomCodeHelperText(roomCode) {
    if (validateRoomCode(roomCode)) return "";
    if (!roomCode.match(/^[A-Z]+$/)) return "Room code should only contain uppercase letters.";
    if (roomCode.length === 0) return "Room code should not be empty.";
    if (roomCode.length !== 6) return "Room code should be 6 characters long.";
    return "Unknown error in room code.";
}

function resizeToDim(img, dim) {
    const maxDim = Math.max(img.width, img.height);
    const imgScaleFactor = dim / maxDim;
    return img.setScale(imgScaleFactor);
}

function getTextColor(backgroundColor) {
    // Convert the background color to RGB
    const rgb = parseInt(backgroundColor.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    // Calculate the brightness of the background color
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return white for dark backgrounds and black for light backgrounds
    return brightness > 155 ? 'black' : 'white';
}

export { phaserPieceImgFile, pieceImgFile, resizeToDim, Vector2, validateName, randomName, getNameHelperText, validateRoomCode, getRoomCodeHelperText, getTextColor };
