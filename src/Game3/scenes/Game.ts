import Phaser from "phaser";
import * as Colors from "../consts/Color";
import { Direction } from "../consts/Direction";
import {
  boxColorToTargetColor,
  targetColorToBoxColor,
} from "../utils/ColorUtils";

//모든 타겟(포인트)위에 박스가 있는지 검사
import isAllTargetsCovered from "../targets/isAllTargetsCovered";

import { offsetForDirection } from "../utils/TileUtils";
import { baseTweenForDirection } from "../utils/TweenUtils";

import { sharedInstance as levels } from "../levels/LevelsService";

export default class Game extends Phaser.Scene {
  private player?: Phaser.GameObjects.Sprite;
  //private BlueBoxes: Phaser.GameObjects.Sprite[] = [];
  private layer?: Phaser.Tilemaps.TilemapLayer;
  private movesCountLabel?: Phaser.GameObjects.Text;

  private targetsCoveredByColor: { [key: number]: number } = {};
  private boxesByColor: { [key: number]: Phaser.GameObjects.Sprite[] } = [];
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  private movesCount = 0;
  private currentLevel = 1;

  constructor() {
    super("game");
  }

  init(d: { level: number }) {
    const data = Object.assign({ level: 1 }, d);
    this.currentLevel = data.level;

    this.movesCount = 0;
  }

  preload() {
    this.load.tilemapTiledJSON(
      "tilemap",
      `assets/levels/level${this.currentLevel}.json`
    );
    this.load.spritesheet("tiles", "assets/sokoban_tilesheet.png", {
      frameWidth: 64,
      startFrame: 0,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create(d: { level: number }) {
    // const level = [
    //   [0, 0, 100, 100, 100, 0, 0, 0, 0, 0],
    //   [0, 0, 100, 64, 100, 0, 0, 0, 0, 0],
    //   [0, 0, 100, 0, 100, 100, 100, 100, 0, 0],
    //   [100, 100, 100, 9, 0, 9, 64, 100, 0, 0],
    //   [100, 64, 0, 9, 52, 100, 100, 100, 0, 0],
    //   [100, 100, 100, 100, 9, 100, 0, 0, 0, 0],
    //   [0, 0, 0, 100, 64, 100, 0, 0, 0, 0],
    //   [0, 0, 0, 100, 100, 100, 0, 0, 0, 0],
    // ];

    // const data = Object.assign({ level: 1 }, d);
    // const level = levels.getLevel(data.level);

    // this.currentLevel = data.level;

    // const map = this.make.tilemap({
    //   data: level,
    //   tileWidth: 64,
    //   tileHeight: 64,
    // });
    const map = this.make.tilemap({ key: "tilemap" });

    const tiles = map.addTilesetImage("sokoban", "tiles");
    this.layer = map.createLayer("level", tiles, 0, 0);

    // 플레이어 생성
    //this.player = this.add.sprite(400, 300, "tiles", 52);
    this.player = this.layer
      .createFromTiles(53, 0, { key: "tiles", frame: 52 })
      .pop();
    this.player?.setOrigin(0);

    this.createPlayerAnims();

    this.extractBoxes(this.layer);

    this.movesCountLabel = this.add.text(540, 50, `Moves:${this.movesCount}`, {
      fontFamily: "Poppins",
    });

    // 재시작 버튼
    this.add
      .dom(
        this.scale.width * 0.9,
        this.scale.height * 0.9,
        "button",
        "",
        "restart"
      )
      .addListener("click")
      .once("click", () => {
        this.scene.start("game", { level: this.currentLevel });
      });

    // 이거 없으면 다음 스테이지로 진행 불가
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cache.tilemap.remove("tilemap");
    });
  }

  update() {
    if (!this.cursors || !this.player) return;

    const justLeft = Phaser.Input.Keyboard.JustDown(this.cursors.left);
    const justRight = Phaser.Input.Keyboard.JustDown(this.cursors.right);
    const justUp = Phaser.Input.Keyboard.JustDown(this.cursors.up);
    const justDown = Phaser.Input.Keyboard.JustDown(this.cursors.down);
    if (justLeft) {
      this.tweenMove(Direction.Left, () => {
        this.player?.anims.play("left", true);
      });
    } else if (justRight) {
      this.tweenMove(Direction.Right, () => {
        this.player?.anims.play("right", true);
      });
    } else if (justUp) {
      this.tweenMove(Direction.Up, () => {
        this.player?.anims.play("up", true);
      });
    } else if (justDown) {
      this.tweenMove(Direction.Down, () => {
        this.player?.anims.play("down", true);
      });
      // else if (this.player?.anims.currentAnim) {
      //   // this.player?.anims.play("idle", true);
      //   const key = this.player?.anims.currentAnim?.key;
      //   if (!key.startsWith(`idle-`)) {
      //     this.player?.anims.play(`idle-${key}`, true);
      //   }
      // }
    }
  }

  private extractBoxes(layer: Phaser.Tilemaps.TilemapLayer) {
    const boxColors = [
      Colors.BoxOrange,
      Colors.BoxRed,
      Colors.BoxBlue,
      Colors.BoxGreen,
      Colors.BoxGrey,
    ];
    boxColors.forEach((color) => {
      this.boxesByColor[color] = layer
        .createFromTiles(color + 1, 0, {
          key: "tiles",
          frame: color,
        })
        .map((box) => box.setOrigin(0));

      const targetColor = boxColorToTargetColor(color);
      this.targetsCoveredByColor[targetColor] = 0;
    });
  }

  private tweenMove(direction: Direction, onStart: () => void) {
    if (!this.player || this.tweens.isTweening(this.player!)) return;

    const x = this.player?.x;
    const y = this.player?.y;

    const offset = offsetForDirection(direction);
    const ox = x + offset.x;
    const oy = y + offset.y;

    const hasWall = this.hasWallAt(ox, oy);
    if (hasWall) {
      this.sound.play("error");
      return;
    }

    const baseTween = baseTweenForDirection(direction);

    const boxData = this.getBoxDataAt(ox, oy);
    if (boxData) {
      // 플레이어 방향 다음다음칸에 빈공간이 없으면 리턴(못가게막음)
      const nextOffset = offsetForDirection(direction, 2);
      const nx = x + nextOffset.x;
      const ny = y + nextOffset.y;
      const nextBoxData = this.getBoxDataAt(nx, ny);
      if (nextBoxData) {
        this.sound.play("error");
        return;
      }
      if (this.hasWallAt(nx, ny)) {
        this.sound.play("error");
        return;
      }

      const box = boxData.box;
      const boxColor = boxData.color;
      const targetColor = boxColorToTargetColor(boxColor);
      const coveredTarget = this.hasTargetAt(box.x, box.y, targetColor);
      if (coveredTarget) {
        // 포인트에 위치한 박스를 밖으로 밀어내면 플래그(?) 감소
        this.changeTargetCoveredCountforColor(targetColor, -1);
      }

      this.sound.play("move"); // 박스 움직일때 소리

      this.tweens.add(
        // 박스 이동
        Object.assign(baseTween, {
          targets: box,
          onComplete: () => {
            // 박스가 포인트 위에 위치하는지 검사
            const coveredTarget = this.hasTargetAt(box.x, box.y, targetColor);
            if (coveredTarget) {
              this.changeTargetCoveredCountforColor(targetColor, 1);
            }
          },
        })
      );
    }
    this.tweens.add(
      // 플레이어 이동
      Object.assign(baseTween, {
        targets: this.player,
        onComplete: this.handlePlayerStopped,
        onCompleteScope: this,
        onStart,
      })
    );
  }

  private handlePlayerStopped() {
    this.movesCount++;
    this.stopPlayerAnimation();
    this.updateMovesCount();

    // 박스가 모두 포인트 위에 위치하면 게임피니쉬 씬 나타남
    const levelFinished = isAllTargetsCovered(
      this.targetsCoveredByColor,
      this.boxesByColor
    );
    if (levelFinished) {
      this.scene.start("level-finished", {
        moves: this.movesCount,
        currentLevel: this.currentLevel,
      });
    }
  }

  private updateMovesCount() {
    if (!this.movesCountLabel) return;
    this.movesCountLabel.text = `Moves:${this.movesCount}`;
  }

  private stopPlayerAnimation() {
    if (!this.player) return;
    const key = this.player?.anims.currentAnim?.key;
    if (!key.startsWith("idle-")) {
      this.player!.anims.play(`idle-${key}`, true);
    }
  }

  private changeTargetCoveredCountforColor(color: number, change: number) {
    if (!(color in this.targetsCoveredByColor)) {
      this.targetsCoveredByColor[color] = 0;
    }
    this.targetsCoveredByColor[color] += change;
    if (change > 0) {
      this.sound.play("confirmation");
    }
  }

  private getBoxDataAt(x: number, y: number) {
    const keys = Object.keys(this.boxesByColor);
    for (let i = 0; i < keys.length; ++i) {
      const color = keys[i];
      const box = this.boxesByColor[color].find((box) => {
        const rect = box.getBounds();
        return rect.contains(x, y);
      });
      if (!box) continue;
      return { box, color: parseInt(color) };
    }
    return undefined;
  }

  private hasWallAt(x: number, y: number) {
    if (!this.layer) return undefined;
    const tile = this.layer.getTileAtWorldXY(x, y);
    if (!tile) return false;
    return tile.index === 101;
  }

  private hasTargetAt(x: number, y: number, tileIndex: number) {
    if (!this.layer) return false;
    const tile = this.layer.getTileAtWorldXY(x, y);
    if (!tile) return false;
    return tile.index === tileIndex + 1;
  }

  private createPlayerAnims() {
    this.anims.create({
      key: "idle-left",
      frames: [{ key: "tiles", frame: 81 }],
    });
    this.anims.create({
      key: "idle-right",
      frames: [{ key: "tiles", frame: 78 }],
    });
    this.anims.create({
      key: "idle-up",
      frames: [{ key: "tiles", frame: 55 }],
    });
    this.anims.create({
      key: "idle-down",
      frames: [{ key: "tiles", frame: 52 }],
    });

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("tiles", { start: 81, end: 83 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("tiles", { start: 78, end: 80 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("tiles", { start: 55, end: 57 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("tiles", { start: 52, end: 54 }),
      frameRate: 10,
      repeat: -1,
    });
  }
}
