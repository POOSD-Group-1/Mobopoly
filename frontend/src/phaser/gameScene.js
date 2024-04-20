import Phaser from "phaser";
import { boardWidth, boardHeight, center, locationAnchors, MAX_PLAYERS, playerAnchors, playerDim, playerAnchorIndex } from "../data/board";
import { resizeToDim } from "../data/util";


class gameScene extends Phaser.Scene {
  players = [];
  board = null;
  coloredBoard = null;
  createCalled = false;
  constructor() {
    super("gameScene");
  }
  preload() {
    this.load.setBaseURL(window.location.origin);
    this.load.image("board", 'assets/board.png');
    this.load.image("boardcolor", 'assets/boardcolor.png');
    for (let i = 0; i < MAX_PLAYERS; i++) {
      this.load.image(`piece${i}`, `assets/piece${i}.png`);
    }
  }
  create(config) {
    this.board = this.add.image(center.x, center.y, "board");
    resizeToDim(this.board, boardWidth);
    this.coloredBoard = this.add.image(center.x, center.y, "boardcolor");
    resizeToDim(this.coloredBoard, boardWidth);
    this.coloredBoard.setVisible(false);
    this.setPlayercount(config.numPlayers);
    this.createCalled = true;
  }

  toggleBoardColor() {
    this.coloredBoard.setVisible(!this.coloredBoard.visible);
    this.board.setVisible(!this.board.visible);
  }

  setPlayercount(playerCount) {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].destroy();
    }
    this.players = [];
    for (let i = 0; i < playerCount; i++) {
      const player = this.add.image(0, 0, `piece${i}`);
      resizeToDim(player, playerDim);
      this.players.push(player);
    }
  }

  updatePlayers(players) {
    const setPlayers = () => {
      for (let i = 0; i < players.length; i++) {
        if (players[i][0] === -1) {
          this.players[i].setActive(false);
          this.players[i].setVisible(false);
          continue;
        }
        const index = playerAnchorIndex[players[i][0]];
        const location = center.clone().add(locationAnchors[players[i][0]]).add(playerAnchors[index][players[i][1]]);
        this.players[i].setPosition(location.x, location.y);
      }
    };
    if (this.createCalled) {
      setPlayers();
    } else {
      this.events.once('create', setPlayers);
    }
  }
}

export default gameScene;
