import { IGameObject } from './iGameobject';
import { PlayerState } from './playerState';
import { emit, on } from '../kontra/src/events';
import { GameEvent } from './gameEvent';
import KontraVector from '../kontra/src/vector';
import { Game } from './game';
import { getRandomPos, isOutOfBounds } from './gameUtils';
import { Vector, Sprite } from '../kontra/kontra';
import { SpaceShip } from './spaceShip';
import { MonetizeEvent } from './monetizeEvent';
import { EngineParticleEffect } from './engineParticleEffect';
import { addPlayer, checkLineIntersection, playerTrails } from './trails';

class Player implements IGameObject {
  sprite: Sprite;
  spaceShip: SpaceShip;
  playerState: PlayerState = PlayerState.idle;
  trails: Vector[];
  ctx: CanvasRenderingContext2D;
  speed: number;
  effect: EngineParticleEffect;
  playerId: number;
  rotating = false;
  constructor(
    private game: Game,
    private scale: number,
    private playerProps: {
      color: string;
      isAi: boolean;
      spaceShipRenderIndex: number;
      playerId: number;
    }
  ) {
    this.playerId = this.playerProps.playerId;
    this.effect = new EngineParticleEffect();
    this.speed = 100 * this.scale;
    this.trails = playerTrails[this.playerProps.playerId];
    this.ctx = this.game.ctx;
    const spriteProps = {
      x: getRandomPos(this.game.canvasWidth * this.game.scale),
      y: getRandomPos(this.game.canvasHeight * this.game.scale),
      color: this.playerProps.color || '#000',
    };
    let leftKey = 'left';
    let rightKey = 'right';
    if (playerProps.playerId === 1) {
      leftKey = 'a';
      rightKey = 'd';
    }
    this.spaceShip = new SpaceShip(this.game, this.playerState, {
      scale: this.scale,
      spriteProps,
      isPreview: false,
      rightKey,
      leftKey,
    });

    on(GameEvent.playerRotation, this.onPayerRotation);
    on(GameEvent.startTrace, this.onStartTrace);
    on(GameEvent.hitTrail, this.onHitTrail);
    on(GameEvent.hitWall, this.onHitWall);

    on(MonetizeEvent.progress, this.onMonetizeProgress);

    this.sprite = this.spaceShip.sprite;
    addPlayer(this);
  }
  onMonetizeProgress = (evt: any) => {
    if (
      this.spaceShip.spaceshipIndex !== this.playerProps.spaceShipRenderIndex
    ) {
      this.spaceShip.spaceshipIndex = this.playerProps.spaceShipRenderIndex;
    }
  };
  update(dt: number): void {
    this.sprite.update(dt);
    checkLineIntersection(this.trails[this.trails.length - 1], this.sprite);
    this.updateEngineEffect(dt);
    this.wallCollision();
    this.updateDeadPlayer();
  }
  render(): void {
    this.renderTrail();
    this.sprite.render();
    this.effect.render();
    this.renderDeadPlayer();
  }
  renderTrail = () => {
    if (this.trails.length) {
      this.ctx.lineWidth = 3 * this.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(this.trails[0].x, this.trails[0].y);
      this.ctx.strokeStyle = this.playerProps.color || '#000';
      this.trails.forEach((t) => {
        this.ctx.lineTo(t.x, t.y);
      });
      this.ctx.stroke();
      if (this.playerState !== PlayerState.dead) {
        this.ctx.lineTo(this.sprite.x, this.sprite.y);
        this.ctx.stroke();
      }
    }
  };
  onPayerRotation = ({
    sprite,
    rotationDirection,
  }: {
    sprite: Sprite;
    rotationDirection: number;
  }) => {
    if (sprite === this.sprite && this.playerState === PlayerState.tracing) {
      this.trails.push(KontraVector(this.sprite.x, this.sprite.y));
    }
  };
  onStartTrace = () => {
    this.sprite.dx = this.speed;
    this.sprite.dy = this.speed;
    this.setPlayerState(PlayerState.tracing);
    this.trails.push(KontraVector(this.sprite.x, this.sprite.y));
  };
  onHitTrail = ({ point, go }: { point: Vector; go: Sprite }) => {
    if (go === this.sprite) {
      if (this.playerState !== PlayerState.dead) {
        console.log(this);
      }
      this.setPlayerState(PlayerState.dead);
      // finish trail by adding last point
      this.trails.push(point);
    }
    if (!this.spaceShip.rotating) {
      // Add point to prevent alive player from dying right after being hit, but only if not rotating
      this.trails.push(KontraVector(this.sprite.x, this.sprite.y));
    }
  };
  onHitWall = ({ point, go }: { point: Vector; go: Sprite }) => {
    if (go === this.sprite) {
      if (this.playerState !== PlayerState.dead) {
        console.log(this);
      }
      this.setPlayerState(PlayerState.dead);
      // finish trail by adding last point
      this.trails.push(point);
    }
  };
  wallCollision = () => {
    if (
      this.playerState === PlayerState.tracing &&
      isOutOfBounds(this.game, this.sprite)
    ) {
      const point: Vector = KontraVector(this.sprite.x, this.sprite.y);
      emit(GameEvent.hitWall, {
        point: point,
        go: this.sprite,
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
  updateEngineEffect = (dt: number) => {
    this.effect.sprite.x = this.sprite.x - 5;
    this.effect.sprite.y = this.sprite.y - 5;
    this.effect.dx = this.sprite.dx;
    this.effect.dy = this.sprite.dy;
    this.effect.rotation = this.sprite.rotation;
    this.effect.sprite.color = this.sprite.color;
    this.effect.update(dt);
  };
}
export { Player };
