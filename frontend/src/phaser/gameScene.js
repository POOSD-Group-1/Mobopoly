import Phaser from "phaser";
import { Vector2 } from "../data/util.js";
import { center, locationAnchors, MAX_PLAYERS } from "../data/board";



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
    board.setScale(0.15);
    this.setPlayercount(config.numPlayers)
    this.createCalled = true;
  }

  setPlayercount(playerCount) {
    console.log("set player count to " + playerCount)
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].destroy();
    }
    this.players = [];
    for (let i = 0; i < playerCount; i++) {
      const player = this.add.sprite(0, 0, `piece${i}`);
      player.setScale(0.08);
      this.players.push(player);
    }
  }

  updatePlayers(players) {
    const setPlayers = () => {
      console.log("this.players: ", this.players);
      for (let i = 0; i < players.length; i++) {
        const location = center.clone().add(locationAnchors[players[i]]);
        console.log(location)
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
