import Phaser from "phaser";
import { boardWidth, boardHeight, center, locationAnchors, MAX_PLAYERS, playerAnchors, playerDim, playerAnchorIndex } from "../data/board";
import { resizeToDim } from "../data/util";


class gameScene extends Phaser.Scene {
  players = [];
  createCalled = false;
  constructor() {
    super("gameScene");
  }
  preload() {
    this.load.image("board", 'assets/board.png');
    for (let i = 0; i < MAX_PLAYERS; i++) {
      this.load.image(`piece${i}`, `assets/piece${i}.png`);
    }
  }
  create(config) {
    const board = this.add.image(center.x, center.y, "board");
    resizeToDim(board, boardWidth);
    this.setPlayercount(config.numPlayers);
    this.createCalled = true;
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
