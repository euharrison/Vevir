import * as d3 from 'd3';

import Config from '../Config';
import Coin from './Coin';
import Enemy from './Enemy';
import Checkpoint from './Checkpoint';
import Floor from './Floor';
import Scene3d from '../3d/Scene3d';

class Level extends Phaser.Group {
  constructor(game) {
    super(game);

    this.tiles = [];

    this.floors = this.game.add.group();

    this.coins = [];
    this.enemies = [];
    this.checkpoints = [];

    for (let i = 0; i < Config.population; i++) {
      this.coins.push(this.game.add.group());
      this.enemies.push(this.game.add.group());
      this.checkpoints.push(this.game.add.group());
    }
  }

  create(input) {
    const level = [];

    const verticalLength = Config.verticalTiles;
    const horizontalLength = Config.horizontalTiles;

    const maxInput = input.reduce((result, i) => Math.max(result, i));
    const maxFloorHeight = verticalLength / 2;

    const scaleVertical = d3.scaleLinear()
      .domain([0, maxInput])
      .range([0, maxFloorHeight])

    const scaledInput = input.map(i => scaleVertical(i));

    const scaleHorizontalIndex = d3.scaleLinear()
      .domain([0, scaledInput.length])
      .range([0, horizontalLength])

    const domainHorizontal = new Array(scaledInput.length).fill(0).map((v, index) => scaleHorizontalIndex(index));
    const scaleHorizontalValue = d3.scaleLinear()
      .domain(domainHorizontal)
      .range(scaledInput)

    const horizontalValues = new Array(horizontalLength).fill(0).map((v, index) => scaleHorizontalValue(index))

    let hasCoin = false;
    for (let y = 0; y < verticalLength; y++) {
      level[y] = [];
      for (let x = 0; x < horizontalLength; x++) {
        const crop = verticalLength - horizontalValues[x] - 1;
        if (x < 2 && y === maxFloorHeight) {
          level[y][x] = 'x';
        }
        else if (y === maxFloorHeight+5) {
          const ceil = Math.ceil(crop);
          // if (y === ceil || y === ceil+1) {
            level[y][x] = 'x';
          // } else {
          //   level[y][x] = ' ';
          // }
        }
        else if (y === verticalLength - maxFloorHeight+4 && x % 3 === 0) {
          if (x < 20) {
            level[y][x] = x > 2 && Math.random() < 0.5 ? '!' : ' ';
          } else {
            level[y][x] = x > 2 && Math.random() < 0.8 ? '!' : ' ';
          }
          // level[y][x] = ' ';
        }
        else if (y > verticalLength - horizontalValues[x] - 3 && x % 2 === 1) {
          level[y][x] = Math.random() < 0.2 ? ' ' : ' ';
          // if (x > 70) {
          //   level[y][x] = hasCoin ? ' ' : 'o';
          //   hasCoin = true;
          // } else {
          //   level[y][x] = ' ';
          // }
        }
        else {
          level[y][x] = ' ';//'o';
        }
      }
    }

    this.createSprites(level);

    // Debug
    // console.log(input)
    // console.log(level.map(row => `|${row.join('')}|`).join('\n'));
  }

  createTile(tile) {
    this.tiles.push(tile);

    switch (tile.type) {
      case 'wall':
        const floor = new Floor(this.game, tile.x, tile.y);
        this.floors.add(floor);
        break;

      case 'coin':
        for (let i = 0; i < Config.population; i++) {
          const y = tile.yPerSimulation[i];
          const coin = new Coin(this.game, tile.x, y, i);
          this.coins[i].add(coin);
        }
        break;

      case 'enemy':
        for (let i = 0; i < Config.population; i++) {
          const y = tile.yPerSimulation[i];
          const enemy = new Enemy(this.game, tile.x, y, i);
          this.enemies[i].add(enemy);
        }
        break;

      case 'checkpoint':
        for (let i = 0; i < Config.population; i++) {
          const y = tile.yPerSimulation[i];
          const checkpoint = new Checkpoint(this.game, tile.x, y, i);
          this.checkpoints[i].add(checkpoint);
        }
        break;
    }
  }

  removeSimulation(index) {
    this.coins[index].killAll();
    this.enemies[index].killAll();
    this.checkpoints[index].killAll();
  }
}

export default Level;
