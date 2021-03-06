import Config from '../Config';
import Enemy3d from '../3d/Enemy3d';
import Scene3d from '../3d/Scene3d';

class Enemy extends Phaser.Sprite {
  constructor(game, x, y, index) {
    super(game, x, y);

    this.width = Config.tileHeight;
    this.height = Config.tileHeight;

    this.game.physics.arcade.enable(this);

    this.enemy3d = new Enemy3d(this, index);
    Scene3d.add(this.enemy3d);

    this.events.onKilled.add(this.onRemove, this);
    this.events.onDestroy.add(this.onRemove, this);
  }

  update() {
    if (!this.alive) {
      return;
    }

    this.game.debug.body(this, '#ff0000');
  }

  onRemove() {
    Scene3d.remove(this.enemy3d);
  }
}

export default Enemy;
