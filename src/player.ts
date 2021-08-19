import Sprite from './../kontra/src/sprite';
import { keyPressed, bindKeys } from './../kontra/src/keyboard';
import { IGameObject } from './iGameobject';
import { PlayerState } from './playerState';
import { emit, on } from '../kontra/src/events';
import { Trail } from './trail';
import { GameEvent } from './gameEvent';
import Vector from '../kontra/src/vector';
import { Game } from './game';
import { isOutOfBounds, lineIntersection, isPointOnLine } from './gameUtils';

class Player implements IGameObject {
  go: any;
  player2: any;
  playerState: PlayerState = PlayerState.idle;
  trail: Trail;
  trails: any[] = []; // Points
  ctx: CanvasRenderingContext2D;
  deadPoint: any = null;
  speed: number;
  removedSpace: any[] = []; // Points
  intersectionPoints: any[] = [];
  wallLineSegments: any[] = [];

  constructor(private game: Game, private scale: number) {
    this.speed = 100 * scale;
    this.removedSpace = [];
    const _p = this;
    this.trails = [];
    this.ctx = this.game.ctx;
    this.trail = new Trail();
    this.wallLineSegments = [
      Vector(0, 0),
      Vector(this.game.canvas.width, 0),
      Vector(this.game.canvas.width, this.game.canvas.height),
      Vector(0, this.game.canvas.height),
      Vector(0, 0),
    ];
    const player: any = Sprite({
      x: this.game.canvas.width / 2, // starting x,y position of the sprite
      y: this.game.canvas.height,
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
        if (
          _p.playerState === PlayerState.dead ||
          _p.playerState === PlayerState.idle
        ) {
          this.dx = this.dy = 0;
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
    on(GameEvent.hitRemovedSpace, this.onHitRemovedSpace);
    on(GameEvent.hitWall, this.onHitWall);

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
    this.checkRemovedSpaceCollision();
    this.wallCollision();
    this.updateDeadPlayer();
  }
  render(): void {
    // this.player2.render();
    this.renderTrail();
    this.renderRemovedSpace();
    this.go.render();
    this.renderDeadPlayer();
  }
  renderTrail = () => {
    if (this.trails.length) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.trails[0].x, this.trails[0].y);
      this.ctx.strokeStyle = 'green'; // TODO (johnedvard) generate based on hash from Near.
      this.trails.forEach((t) => {
        this.ctx.lineTo(t.x, t.y);
      });
      this.ctx.stroke();
      if (this.playerState !== PlayerState.dead) {
        this.ctx.lineTo(this.go.x, this.go.y);
        this.ctx.stroke();
      }
    }
  };
  renderRemovedSpace = () => {
    if (!this.removedSpace.length) return;
    this.ctx.beginPath();
    this.ctx.moveTo(this.removedSpace[0].x, this.removedSpace[0].y);
    this.ctx.fillStyle = 'blue'; // TODO (johnedvard) generate based on hash from Near.
    this.removedSpace.forEach((p) => {
      this.ctx.lineTo(p.x, p.y);
    });
    this.ctx.stroke();
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
    const intersectionPointStart: any = Vector(this.go.x, this.go.y);
    intersectionPointStart.isIntersectionPoint = true;
    if (isOutOfBounds(this.game, intersectionPointStart)) {
      console.log('is out of bound');
      this.insertIntoWallLines(intersectionPointStart);
    } else {
      // insiert into removed space trace
    }
    this.intersectionPoints.push(intersectionPointStart);
    this.trails.push(Vector(this.go.x, this.go.y));
  };
  onHitTrail = ({ point, go }: { point: any; go: any }) => {
    if (go === this.go) {
      this.deadPoint = point;
      this.playerState = PlayerState.dead;
      this.trails.push(point);
    }
  };
  onHitRemovedSpace = ({ point, go }: { point: any; go: any }) => {
    if (go === this.go) {
      this.onCommonHit({ point, go });
      this.trails = [];
    }
  };
  onHitWall = ({ point, go }: { point: any; go: any }) => {
    if (go === this.go) {
      const interSectionPointEnd = point;
      interSectionPointEnd.isIntersectionPoint = true;
      this.insertIntoWallLines(interSectionPointEnd);
      this.intersectionPoints.push(interSectionPointEnd);
      this.onCommonHit({ point, go });
      this.trails = [];
    }
  };
  onCommonHit = ({ point, go }: { point: any; go: any }) => {
    this.playerState = PlayerState.idle;
    this.removedSpace = [
      ...this.removedSpace,
      ...this.trails,
      Vector(go.x, go.y),
    ];
  };
  checkLineIntersection = () => {
    let currIntersection = this.deadPoint;
    const points = [...this.trails, Vector(this.go.x, this.go.y)];
    for (let i = 0; i < points.length - 3; i++) {
      const point = points[i];
      const point2 = points[i + 1];
      const lastPoint = points[points.length - 2];
      const lastPoint2 = points[points.length - 1];
      if (point !== lastPoint && point2 !== lastPoint2) {
        const intersection = lineIntersection(
          point,
          point2,
          lastPoint,
          lastPoint2
        );
        if (intersection && intersection.x) {
          currIntersection = intersection;
          emit(GameEvent.hitTrail, { point: intersection, go: this.go });
        }
      }
      if (currIntersection) break;
    }
  };
  checkRemovedSpaceCollision = () => {
    if (this.trails.length < 2) return; // prevent hitting wall if the player just started moving while tracing
    if (this.playerState === PlayerState.tracing) {
      for (let i = 0; i < this.removedSpace.length - 1; i++) {
        const point = this.removedSpace[i];
        const point2 = this.removedSpace[i + 1];
        const lastPoint = Vector(this.go.x, this.go.y);
        const lastPoint2 = this.trails[this.trails.length - 1];
        if (point && point2 && lastPoint && lastPoint2) {
          const intersection = lineIntersection(
            point,
            point2,
            lastPoint,
            lastPoint2
          );
          if (intersection && intersection.x) {
            emit(GameEvent.hitRemovedSpace, {
              point: intersection,
              go: this.go,
            });
          }
        }
      }
    }
  };
  wallCollision = () => {
    if (
      this.playerState === PlayerState.tracing &&
      isOutOfBounds(this.game, this.go)
    ) {
      const point: any = { x: this.go.x, y: this.go.y };
      // clamp to wall edges
      if (this.go.x <= 0) {
        point.x = 0;
      } else if (this.go.x >= this.game.canvas.width) {
        point.x = this.game.canvas.width;
      }
      if (this.go.y <= 0) {
        point.y = 0;
      } else if (this.go.y >= this.game.canvas.height) {
        point.y = this.game.canvas.height;
      }
      emit(GameEvent.hitWall, {
        point: point,
        go: this.go,
      });
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
  insertIntoWallLines(point: any) {
    let insertIndex = -1;
    // Find where to insert the point in the wall lines
    for (let i = 0; i < this.wallLineSegments.length - 1; i++) {
      const wallPoint1 = this.wallLineSegments[i];
      const wallPoint2 = this.wallLineSegments[i + 1];
      if (isPointOnLine(wallPoint1, wallPoint2, point)) {
        insertIndex = i;
        break;
      }
    }
    if (insertIndex >= 0) {
      this.wallLineSegments.splice(insertIndex, 0, point);
      console.log('intersection point added to wall', this.wallLineSegments);
    }
  }
}
export { Player };
