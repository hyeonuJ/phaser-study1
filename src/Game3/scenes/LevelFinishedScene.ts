import Phaser from "phaser";
import "jsx-dom";

import { sharedInstance as Levels } from "../levels/LevelsService";

export default class LevelFinishedScene extends Phaser.Scene {
  constructor() {
    super("level-finished");
  }

  create(d: { moves: number; currentLevel: number }) {
    const data = Object.assign({ moves: 0, currentLevel: 1 }, d);
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .text(width * 0.5, height * 0.4, "Level Complete!", {
        fontFamily: "Righteous",
        color: "#d4fa00",
        fontSize: "48px",
      })
      .setOrigin(0.5);
    this.add
      .text(width * 0.5, height * 0.5, `Moves: ${data.moves}`, {
        fontFamily: "Poppins",
      })
      .setOrigin(0.5);

    this.add
      .dom(width * 0.5, height * 0.6, "button", "width:200px", "Retry")
      .setClassName("button is-medium")
      .addListener("click")
      .once("click", () => {
        this.sound.play("click");
        this.scene.start("game", { level: data.currentLevel });
      });
    this.add
      .dom(width * 0.5, height * 0.72, "button", "width:200px", "Next Level")
      .setClassName("button is-primary is-medium")
      .addListener("click")
      .once("click", () => {
        this.sound.play("click");
        this.scene.start("game", { level: data.currentLevel + 1 });
      });
  }
}
