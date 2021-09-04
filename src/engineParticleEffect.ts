import KontraSprite from '../kontra/src/sprite';
import KontraPool from '../kontra/src/pool';
import { Pool, Sprite } from '../kontra/kontra';
import { IGameObject } from './iGameobject';

export class EngineParticleEffect implements IGameObject {
  go: Sprite;
  private pool: Pool;
  x = 0;
  y = 0;
  speed = 0.5;
  constructor() {
    this.pool = KontraPool({
      create: KontraSprite,
      size: 10,
    });
  }

  minmax(y: number) {
    const range = 0.4;
    if (y > range) {
      return range - Math.random() * range;
    }
    if (y < -range) {
      return -range + Math.random() * range;
    }
    return y;
  }

  updatePool = (dt: number) => {
    this.pool.get({
      x: 0 + this.x,
      y: 2.5 + this.y,
      dx: -2,
      dy: this.minmax(1 - Math.random() * 2),
      ttl: 40,
      render: function () {
        this.context.fillRect(this.x, this.y, this.ttl / 4, this.ttl / 4);
      },
    });
    this.pool.update();
  };
  render = () => {
    this.pool.render();
  };
  update = (dt: number): void => {
    this.updatePool(dt);
  };
}
