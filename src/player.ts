import { IGameObject } from './iGameobject';
import { PlayerState } from './playerState';
import { emit, on } from '../kontra/src/events';
import { GameEvent } from './gameEvent';
import KontraVector from '../kontra/src/vector';
import { Game } from './game';
import {
  checkLineIntersection,
  isOutOfBounds,
  lineIntersection,
} from './gameUtils';
import { Vector, Sprite } from '../kontra/kontra';
import { SpaceShip } from './spaceShip';
import { MonetizeEvent } from './monetizeEvent';

class Player implements IGameObject {
  go: Sprite;
  spaceShip: SpaceShip;
  playerState: PlayerState = PlayerState.idle;
  trails: Vector[] = []; // Points
  ctx: CanvasRenderingContext2D;
  speed: number;
  removedSpace: Vector[] = []; // Points
  wallLineSegments: Vector[] = [];

  constructor(
    private game: Game,
    private scale: number,
    private playerProps: {
      color: string;
      isAi: boolean;
      spaceShipRenderIndex: number;
    }
  ) {
    this.speed = 100 * this.scale;
    this.removedSpace = [];
    this.trails = [];
    this.ctx = this.game.ctx;
    this.wallLineSegments = [
      KontraVector(0, 0),
      KontraVector(this.game.canvas.width, 0),
      KontraVector(this.game.canvas.width, this.game.canvas.height),
      KontraVector(0, this.game.canvas.height),
      KontraVector(0, 0),
    ];
    const spriteProps = {
      x: this.game.canvas.width / 2,
      y: this.game.canvas.height,
      color: this.playerProps.color || '#000',
    };
    this.spaceShip = new SpaceShip(this.game, this.playerState, {
      scale: this.scale,
      spriteProps,
      isPreview: false,
    });

    on(GameEvent.playerRotation, this.onPayerRotation);
    on(GameEvent.startTrace, this.onStartTrace);
    on(GameEvent.hitTrail, this.onHitTrail);
    on(GameEvent.hitRemovedSpace, this.onHitRemovedSpace);
    on(GameEvent.hitWall, this.onHitWall);

    on(MonetizeEvent.progress, this.onMonetizeProgress);

    this.go = this.spaceShip.sprite;
  }
  onMonetizeProgress = (evt: any) => {
    if (
      this.spaceShip.spaceshipIndex !== this.playerProps.spaceShipRenderIndex
    ) {
      this.spaceShip.spaceshipIndex = this.playerProps.spaceShipRenderIndex;
    }
  };
  update(dt: number): void {
    this.go.update(dt);
    checkLineIntersection(this.trails, this.go);
    this.checkRemovedSpaceCollision();
    this.wallCollision();
    this.updateDeadPlayer();
  }
  render(): void {
    this.renderTrail();
    this.renderRemovedSpace();
    this.go.render();
    this.renderDeadPlayer();
  }
  renderTrail = () => {
    if (this.trails.length) {
      this.ctx.lineWidth = 3 * this.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(this.trails[0].x, this.trails[0].y);
      this.ctx.strokeStyle = this.playerProps.color || '#000'; // TODO (johnedvard) generate based on hash from Near.
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
      this.trails.push(KontraVector(this.go.x, this.go.y));
    }
  };
  onStartTrace = () => {
    this.go.dx = this.speed;
    this.go.dy = this.speed;
    this.setPlayerState(PlayerState.tracing);
    this.trails.push(KontraVector(this.go.x, this.go.y));
  };
  onHitTrail = ({ point, go }: { point: Vector; go: Sprite }) => {
    if (go === this.go) {
      this.setPlayerState(PlayerState.dead);
      this.trails.push(point);
    }
  };
  onHitRemovedSpace = ({ point, go }: { point: Vector; go: Sprite }) => {
    if (go === this.go) {
      this.onCommonHit({ point, go });
    }
  };
  onHitWall = ({ point, go }: { point: Vector; go: Sprite }) => {
    if (go === this.go) {
      this.onCommonHit({ point, go });
      this.setPlayerState(PlayerState.dead);
      this.trails.push(point);
    }
  };
  onCommonHit = ({ point, go }: { point: Vector; go: Sprite }) => {
    this.setPlayerState(PlayerState.idle);
    this.removedSpace = [
      ...this.removedSpace,
      ...this.trails,
      KontraVector(go.x, go.y),
    ];
    this.trails = [];
  };

  checkRemovedSpaceCollision = () => {
    if (this.trails.length < 2) return; // prevent hitting wall if the player just started moving while tracing
    if (this.playerState === PlayerState.tracing) {
      for (let i = 0; i < this.removedSpace.length - 1; i++) {
        const point = this.removedSpace[i];
        const point2 = this.removedSpace[i + 1];
        const lastPoint = KontraVector(this.go.x, this.go.y);
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
      const point: Vector = KontraVector(this.go.x, this.go.y);
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
  setPlayerState(state: PlayerState) {
    this.playerState = state;
    emit(GameEvent.playerStateChange, { state, ship: this.spaceShip });
  }
}
export { Player };
