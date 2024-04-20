import Phaser from "phaser";
import { boardWidth, boardHeight, center, locationAnchors, MAX_PLAYERS, MAX_LOCATIONS, playerAnchors, playerDim, anchorIndexes, propAnchors, ambushDim } from "../data/board";
import { resizeToDim } from "../data/util";


class gameScene extends Phaser.Scene {
  players = [];
  ambushes = [];
  hideouts = [];
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
    this.load.image("ambush", 'assets/ambush.png');
    this.load.image("hideout", 'assets/hideout.png');
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
    for(let i = 0; i < MAX_LOCATIONS; i++) {
      const ambush = this.add.image(0, 0, "ambush");
      ambush.setVisible(false);
      resizeToDim(ambush, ambushDim);
      this.ambushes.push(ambush);
    }
    for(let i = 0; i < MAX_LOCATIONS; i++) {
      const hideout = this.add.image(0, 0, "hideout");
      hideout.setVisible(false);
      resizeToDim(hideout, ambushDim);
      this.hideouts.push(hideout);
    }
    // this.add.image(center.x, center.y, "hideout");
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
      player.setVisible(true);
      resizeToDim(player, playerDim);
      this.players.push(player);
    }
  }

  updateHideouts(hideouts) {
    const setHideouts = () => {
      for (let i = 0; i < hideouts.length; i++) {
        this.hideouts[i].setVisible(true);
        const index = anchorIndexes[hideouts[i]];
        const location = center.clone().add(locationAnchors[hideouts[i]]).add(propAnchors[index][1]);
        this.hideouts[i].setPosition(location.x, location.y);
      }
    };
    if (this.createCalled) {
      setHideouts();
    } else {
      this.events.once('create', setHideouts);
    }
  }

  updateAmbushes(ambushes) {
    const setAmbushes = () => {
      for (let i = 0; i < ambushes.length; i++) {
        this.ambushes[i].setVisible(true);
        const index = anchorIndexes[ambushes[i]];
        const location = center.clone().add(locationAnchors[ambushes[i]]).add(propAnchors[index][0]);
        this.ambushes[i].setPosition(location.x, location.y);
      }
      for(let i = ambushes.length; i < this.ambushes.length; i++) {
        this.ambushes[i].setVisible(false);
      }
    };
    if (this.createCalled) {
      setAmbushes();
    } else {
      this.events.once('create', setAmbushes);
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
        const index = anchorIndexes[players[i][0]];
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
