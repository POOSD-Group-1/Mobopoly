import Phaser from "phaser";

class gameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
  }
  preload() {
    // this.load.setBaseURL("https://mobopoly-866b1--pr6-assets-be2efvj0.web.app/");
    this.load.setBaseURL('http://localhost:3000');
    this.load.image("board", 'assets/board.png');
  }
  create() {
    const board = this.add.image(300, 300, "board");
    board.setScale(0.15);
  }
}

export default gameScene;
