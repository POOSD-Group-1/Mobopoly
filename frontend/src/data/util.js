import Phaser from 'phaser';

const Vector2 = Phaser.Math.Vector2;

function pieceImgFile(pieceNum) {
    return `assets/piece${pieceNum}.png`;
}

export { pieceImgFile, Vector2 };
