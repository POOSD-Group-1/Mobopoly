import Phaser from 'phaser';
import { scaleFactor } from './board';

const Vector2 = Phaser.Math.Vector2;

function pieceImgFile(pieceNum) {
    return `assets/piece${pieceNum}.png`;
}

function resizeToDim(img, dim) {
    const maxDim = Math.max(img.width, img.height);
    const imgScaleFactor = dim / maxDim;
    return img.setScale(imgScaleFactor);
}

export { pieceImgFile, resizeToDim, Vector2 };
