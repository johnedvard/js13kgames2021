import Sprite from './../kontra/src/sprite';
import { keyPressed, bindKeys } from './../kontra/src/keyboard';
import { IGameObject } from './iGameobject';
import { PlayerState } from './playerState';
import { emit, on } from '../kontra/src/events';
import { Trail } from './trail';
import { GameEvent } from './gameEvent';
import Vector from '../kontra/src/vector';
import { Game } from './game';
import { lineIntersection } from './gameUtils';

class Player implements IGameObject {
  go: any;
  player2: any;
  playerState: PlayerState = PlayerState.idle;
  trail: Trail;
  trails: any[] = [];
  ctx: CanvasRenderingContext2D;
  deadPoint: any = null;
  speed: number;

  constructor(private game: Game, private scale: number) {
    this.speed = 100 * scale;
    const _p = this;
    this.trails = [];
    this.ctx = this.game.ctx;
    this.trail = new Trail();
    const player: any = Sprite({
      x: 100, // starting x,y position of the sprite
      y: 100,
      color: 'black', // fill color of the sprite rectangle
      width: 15 * scale, // width and height of the sprite rectangle
      height: 10 * scale,
      dx: 0,
      anchor: { x: 0.1, y: 0.5 },
      rotation: 0,
      render: function () {
        // render triangle
        if (_p.playerState !== PlayerState.dead) {
          this.context.fillStyle = this.color;
          this.context.beginPath();
          this.context.lineCap = 'round';
          this.context.moveTo(0, 0); // top left corner
          this.context.lineTo(this.width, this.height / 2); // bottom
          this.context.lineTo(0, this.height); // top right corner
          this.context.fill();
        }
      },
      update: function (dt: number) {
        if (keyPressed('left')) {
          this.rotation -= 10 * dt;
          emit(GameEvent.playerRotation, -1);
        }
        if (keyPressed('right')) {
          this.rotation += 10 * dt;
          emit(GameEvent.playerRotation, 1);
        }
        // move the ship forward in the direction it's facing
        this.x = this.x + this.dx * dt * Math.cos(this.rotation);
        this.y = this.y + this.dy * dt * Math.sin(this.rotation);
      },
    });
    this.handleInput();

    on(GameEvent.playerRotation, this.onPayerRotation);
    on(GameEvent.startTrace, this.onStartTrace);
    on(GameEvent.hitTrail, this.onHitTrail);

    this.go = player;
    this.go.addChild(this.trail.go);
    // this.player2 = Sprite({
    //   x: 100, // starting x,y position of the sprite
    //   y: 100,
    //   color: 'green', // fill color of the sprite rectangle
    //   width: 15, // width and height of the sprite rectangle
    //   height: 10,
    //   dx: 0,
    //   dy: 0,
    //   anchor: { x: 0.1, y: 0.5 },
    //   rotation: 0,
    // });
  }
  update(dt: number): void {
    // this.player2.update(dt);
    this.go.update(dt);
    this.checkLineIntersection();
    this.updateDeadPlayer();
  }
  render(): void {
    // this.player2.render();
    this.renderTrail();
    this.go.render();
    this.renderDeadPlayer();
  }
  renderTrail = () => {
    if (this.trails.length) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.trails[0].x, this.trails[0].y);
      this.trails.forEach((t) => {
        this.ctx.strokeStyle = 'green'; // TODO (johnedvard) generate based on hash from Near.
        this.ctx.lineTo(t.x, t.y);
        this.ctx.stroke();
      });
      if (this.playerState !== PlayerState.dead) {
        this.ctx.lineTo(this.go.x, this.go.y);
        this.ctx.stroke();
      }
    }
  };
  onPayerRotation = (rotationDirection: number) => {
    if (this.playerState === PlayerState.tracing) {
      this.trails.push(Vector(this.go.x, this.go.y));
    }
  };
  onStartTrace = () => {
    this.go.dx = this.speed;
    this.go.dy = this.speed;
    this.playerState = PlayerState.tracing;
    this.trails.push(Vector(this.go.x, this.go.y));
  };
  onHitTrail = ({ point, go }: { point: any; go: any }) => {
    if (go === this.go) {
      this.deadPoint = point;
      console.log('trails', this.trails);
      this.playerState = PlayerState.dead;
      this.go.dx = 0;
      this.go.dy = 0;
      this.trails.push(point);
    }
  };
  checkLineIntersection = () => {
    let currIntersection = this.deadPoint;
    const points = [...this.trails, Vector(this.go.x, this.go.y)];
    for (let i = 0; i < points.length - 1; i++) {
      const point = points[i];
      const point2 = points[i + 1];
      for (let j = i + 2; j < points.length - 1; j++) {
        const otherPoint = points[j];
        const otherPoint2 = points[j + 1];
        if (point !== otherPoint && point2 !== otherPoint2) {
          const intersection = lineIntersection(
            point,
            point2,
            otherPoint,
            otherPoint2
          );
          if (intersection && intersection.x) {
            currIntersection = intersection;
            emit(GameEvent.hitTrail, { point: intersection, go: this.go });
            break;
          }
        }
      }
      if (currIntersection) break;
    }
  };
  updateDeadPlayer = () => {
    if (this.playerState === PlayerState.dead) {
      // TODO create something nice
    }
  };
  renderDeadPlayer = () => {
    if (this.playerState === PlayerState.dead) {
      // TODO create something nice
    }
  };
  handleInput() {
    bindKeys(
      'space',
      (e) => {
        if (
          this.playerState !== PlayerState.tracing &&
          this.playerState !== PlayerState.dead
        ) {
          emit(GameEvent.startTrace);
        }
      },
      { handler: 'keyup' }
    );
  }
}

export { Player };
