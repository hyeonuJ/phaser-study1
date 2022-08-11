import Phaser from "phaser";

import { KEY_CRATE } from "./CratePool";

const INFO_FORMAT = `Size:      %1
Spawned:    %2
Despawned:  %3`;

export default class CrateScene extends Phaser.Scene {
  private group?: Phaser.GameObjects.Group;
  private infoText?: Phaser.GameObjects.Text;

  constructor() {
    super("crates-scene-basic");
  }

  preload() {
    this.load.image(KEY_CRATE, "assets/star.png");
  }

  create() {
    this.matter.world.setBounds(
      0,
      -100,
      this.scale.width,
      this.scale.height + 100
    );

    this.group = this.add.cratePool();

    this.infoText = this.add.text(16, 16, "");
    this.infoText.setDepth(1000);
  }

  update() {
    if (!this.group || !this.infoText) return;

    const size = this.group.getLength();
    const used = this.group.getTotalUsed();
    const text = Phaser.Utils.String.Format(INFO_FORMAT, [
      size,
      used,
      size - used,
    ]);
    this.infoText.setText(text);
  }

  private spawnCrate(x = 400, y = 300) {
    if (!this.group) {
      return null;
    }

    const crate = this.group.spawn(x, y);

    crate.alpha = 1;
    crate.scale = 1;
    crate.setVisible(true);
    crate.setActive(true);

    this.tweens.add({
      targets: crate,
      scale: 2,
      alpha: 0,
      duration: Phaser.Math.Between(500, 1500),
      onComplete: (tween) => {
        this.tweens.killTweensOf(crate);
        this.group!.despawn(crate);
      },
    });

    return crate;
  }
}
