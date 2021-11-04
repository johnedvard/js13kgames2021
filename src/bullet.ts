import { Sprite, Vector } from 'kontra';
import { on } from 'kontra';
import { BulletState } from './BulletState';
import { Game } from './game';
import { GameEvent } from './gameEvent';
import { isOutOfBounds } from './gameUtils';
import { IGameObject } from './iGameobject';
import { playBulletExplotion } from './sound';
import { checkLineIntersection } from './trails';

export class Bullet implements IGameObject {
  sprite: Sprite;
  speed = 300;
  prevPoint: Vector;
  explotionSize = 40;
  startOffset = 20;
  bulletState: BulletState = BulletState.idle;
  constructor(
    private game: Game,
    {
      x,
      y,
      rotation,
      color,
    }: {
      x: number;
      y: number;
      rotation: number;
      color: string;
    }
  ) {
    const bullet = this;
    const kontraSprite: any = new Sprite({
      x: x + Math.cos(rotation) * this.startOffset,
      y: y + Math.sin(rotation) * this.startOffset,
      width: 10,
      height: 10,
      color: color,
      // custom properties
      dx: this.speed,
      dy: this.speed,
      rotation: rotation,
      update: function (dt: number) {
        if (bullet.bulletState === BulletState.dead) return;
        bullet.prevPoint = new Vector(this.x, this.y);
        this.x = this.x + this.dx * dt * Math.cos(this.rotation);
        this.y = this.y + this.dy * dt * Math.sin(this.rotation);
      },
    });
    this.sprite = kontraSprite;
    on(GameEvent.hitTrail, (evt: any) => this.onBulletHitTrail(evt));
  }
  onBulletHitTrail(evt: any) {
    if (evt.go === this.sprite) {
      this.bulletState = BulletState.explode;
      playBulletExplotion();
      this.sprite.dx = 0;
      this.sprite.dy = 0;
    }
  }
  update(dt: number) {
    if (this.bulletState === BulletState.dead) return;
    this.updateDeadBullet();
    this.checkWallHit();
    if (this.prevPoint && this.sprite) {
      checkLineIntersection(this.prevPoint, this.sprite);
    }
    this.sprite.update(dt);
  }
  checkWallHit() {
    if (isOutOfBounds(this.game, this.sprite)) {
      this.bulletState = BulletState.dead;
    }
  }
  updateDeadBullet() {
    if (this.bulletState === BulletState.explode) {
      if (this.sprite.width < this.explotionSize) {
        this.sprite.rotation += 10;
        this.sprite.width += 1;
        this.sprite.height += 1;
      } else {
        this.bulletState = BulletState.dead;
        this.sprite.width = 0;
        this.sprite.height = 0;
      }
    }
  }
  render() {
    if (this.bulletState === BulletState.dead) return;
    this.sprite.render();
  }
}
