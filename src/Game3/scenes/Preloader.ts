import Phaser from "phaser";
import WebFontFile from "../files/WebFontFile";

// 폰트 적용
export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    const fonts = new WebFontFile(this.load, ["Poppins", "Righteous"]);
    this.load.addFile(fonts);

    // 음악,효과음 preload
    this.load.audio("game-music", "assets/music/CaveLoop.wav");
    this.load.audio("confirmation", "assets/sfx/confirmation_001.ogg");
    this.load.audio("move", "assets/sfx/maximize_008.ogg");
    this.load.audio("error", "assets/sfx/error_006.ogg");
    this.load.audio("click", "assets/sfx/click_002.ogg");
  }

  create() {
    //음악재생
    this.sound.play("game-music", {
      loop: true,
      volume: 0.125,
    });

    //씬(스테이지) 스타트
    this.scene.start("game", { level: 1 });
  }
}
