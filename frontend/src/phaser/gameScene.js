import Phaser from "phaser";
import { boardHeight, boardWidth } from "../data/board";

class gameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
  }
  preload() {
    this.load.image("board", 'assets/board.png');
  }
  create() {
    const board = this.add.image(boardWidth / 2, boardHeight / 2, "board");
    board.setScale(0.15);
  }
}

export default gameScene;
