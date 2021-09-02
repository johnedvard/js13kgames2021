import KontraSprite from '../kontra/src/sprite';
import KontraPool from '../kontra/src/pool';
import { Pool } from '../kontra/kontra';

export class EngineParticleEffect {
  private pool: Pool;
  speed = 0.5;
  constructor() {
    this.pool = KontraPool({
      create: KontraSprite,
      size: 1,
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

  updatePool() {
    this.pool.get({
      x: 0,
      y: 2.5,
      dx: -2,
      dy: this.minmax(1 - Math.random() * 2),
      color: 'white',
      width: 1,
      height: 1,
      ttl: 40,
      mass: 50,
      render: function () {
        this.context.fillRect(this.x, this.y, this.ttl / 4, this.ttl / 4);
      },
    });
    this.pool.update();
  }
  render() {
    this.pool.render();
  }
}
