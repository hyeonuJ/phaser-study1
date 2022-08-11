import Phaser from "phaser";

import CratesScene from "./scenes/index2";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "matter",
    arcade: {
      gravity: { y: 200 },
    },
    matter: {
      debug: true,
    },
  },
  scene: [CratesScene],
};

let game = new Phaser.Game(config);

export default game;
