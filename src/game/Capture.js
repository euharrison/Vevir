import anime from 'animejs';

import Config from '../Config';
import Audio from './Audio';
import Level from './Level';
import Spectrogram3d from '../3d/Spectrogram3d';
import ColorManager from '../3d/ColorManager';
import Scene3d from '../3d/Scene3d';

class Capture extends Phaser.State {
  constructor() {
    super();
    this.key = 'capture';
  }

  create() {
    Scene3d.camera.near = 600;
    Scene3d.camera.far = 20000;
    Scene3d.camera.updateProjectionMatrix();

    ColorManager.shuffle();

    this.game.spectrogram = Audio.getSpectrogram();

    this.spec3d = new Spectrogram3d(this.game.spectrogram.length);
    Scene3d.add(this.spec3d);

    this.level = new Level(this.game);

    const x = this.column * Config.tileWidth;
    const y = Config.verticalTiles * Config.tileHeight;

    this.game.tiles = [
      { type: 'wall', x, y: y },
      { type: 'wall', x, y: y },
    ];

    const tiles = [
    ];

    this.column = 0;
    this.intervalId = setInterval(
      this.createTile.bind(this),
      Config.captureTime / Config.horizontalTiles
    );
  }

  update() {
    const floors = this.level.floors.children;
    const lastFloor = floors[floors.length-1];

    if (this.column < Config.horizontalTiles) {
      this.game.camera.x = -1300 + (lastFloor ? lastFloor.x : 0);
    }

    Scene3d.updateCamera(this.camera);

    this.game.spectrogram = Audio.getSpectrogram();

    this.spec3d.update(this.game.spectrogram);
    // this.spec3d.position.x = this.game.camera.x;
    this.spec3d.position.x = lastFloor ? lastFloor.x : 0;
  }

  render() {
    this.game.debug.text('CAPTURING...', 20, 400);
    this.game.debug.cameraInfo(this.game.camera, 20, 20);
  }

  createTile() {
    const x = this.column * Config.tileWidth;
    const y = Config.verticalTiles * Config.tileHeight;

    const tiles = [
      { type: 'wall', x, y: y },
    ];

    // TODO podemos fixar os numeros do audio ao inves de normalizar?
    // if (Audio.getVolume() > 170) {
    // if (Audio.getVolume() > 0.8) {
    if (Math.random() > 0.8) {
      // tiles.push({ type: 'wall', x, y: y - (4 * Config.tileHeight) });
    }
    if (Math.random() < 0.3 && x > 1000 && this.column % 2 == 0) {
      tiles.push({ type: 'coin', x, y: y - (1 * Config.tileHeight) });
    }
    if (Math.random() < 0.3 && x > 1000 && this.column % 2 == 1) {
      tiles.push({ type: 'enemy', x, y: y - (1 * Config.tileHeight) });
    }
    tiles.forEach((tile) => this.level.createTile(tile));

    this.game.tiles.push(...tiles);

    this.column++;
    if (this.column === Config.horizontalTiles) {
      this.finish();
    }
  }

  finish() {
    clearTimeout(this.intervalId);

    Scene3d.remove(this.spec3d);

    anime({
      targets: this.game.camera,
      duration: 3000,
      easing: 'easeInOutExpo',
      delay: 1000,
      x: -300,
      complete: () => {
        setTimeout(() => this.game.state.start('play'), 1000);
      },
    })
  }

  shutdown() {
    clearTimeout(this.intervalId);
    Scene3d.remove(this.spec3d);
  }
}

export default new Capture();
