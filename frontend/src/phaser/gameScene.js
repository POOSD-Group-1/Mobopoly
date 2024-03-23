import Phaser from "phaser";

class gameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
  }
  preload() {
    this.load.image("board", 'assets/board.png');
  }
  create() {
    const board = this.add.image(300, 300, "board");
    board.setScale(0.15);
  }
}

export default gameScene;
