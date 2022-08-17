import Phaser from "phaser";

import Preloader from "./scenes/Preloader";
import Game from "./scenes/Game";
import LevelFinishedScene from "./scenes/LevelFinishedScene";

const config = {
  type: Phaser.AUTO,
  // Scene에 ButtonJSX 적용을 위한 코드
  parent: "phaser",
  dom: {
    createContainer: true,
  },
  // Scene에 ButtonJSX 적용을 위한 코드
  width: 640,
  height: 512,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      debug: true,
    },
  },
  scene: [Preloader, Game, LevelFinishedScene],
};

export default new Phaser.Game(config);
