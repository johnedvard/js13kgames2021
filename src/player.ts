import { IGameObject } from './iGameobject';
import { PlayerState } from './playerState';
import { emit, on } from '../kontra/src/events';
import { GameEvent } from './gameEvent';
import KontraVector from '../kontra/src/vector';
import { Game } from './game';
import { getPlayerControls, getRandomPos, isOutOfBounds } from './gameUtils';
import { Vector, Sprite } from '../kontra/kontra';
import { SpaceShip } from './spaceShip';
import { MonetizeEvent } from './monetizeEvent';
import { EngineParticleEffect } from './engineParticleEffect';
import { addPlayer, checkLineIntersection, playerTrails } from './trails';
import { bindKeys } from '../kontra/src/keyboard';
import { Bullet } from './bullet';

class Player implements IGameObject {
  sprite: Sprite;
  spaceShip: SpaceShip;
  playerState: PlayerState = PlayerState.idle;
  trails: Vector[][] = []; // list of line segments
  ctx: CanvasRenderingContext2D;
  speed: number;
  effect: EngineParticleEffect;
  playerId: number;
  rotating = false;
  maxBullets = 1;
  numBullets = this.maxBullets;
  bullets: Bullet[] = [];
  timeToAddTrailInterval = 0.05; //s
  timeSinceLastTrailAdded = 0;
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
    this.getEndTrail();
    this.ctx = this.game.ctx;
    const spriteProps = {
      x: getRandomPos(this.game.canvasWidth * this.game.scale),
      y: getRandomPos(this.game.canvasHeight * this.game.scale),
      color: this.playerProps.color || '#000',
    };
    const [leftKey, rightKey, weaponKey] = getPlayerControls(this.playerId);
    this.spaceShip = new SpaceShip(this.game, this.playerState, {
      scale: this.scale,
      spriteProps,
      isPreview: false,
      rightKey,
      leftKey,
    });

    bindKeys(
      weaponKey,
      (e) => {
        emit(GameEvent.weaponAttack, {
          sprite: this.spaceShip.sprite,
        });
      },
      { handler: 'keyup' }
    );

    on(GameEvent.weaponAttack, (evt: any) => this.onPayerAttack(evt));
    on(GameEvent.startTrace, () => this.onStartTrace());
    on(GameEvent.hitTrail, (evt: any) => this.onHitTrail(evt));
    on(GameEvent.hitWall, (evt: any) => this.onHitWall(evt));
    on(GameEvent.gameOver, (evt: any) => this.onGameOver(evt));
    on(MonetizeEvent.progress, this.onMonetizeProgress);

    this.sprite = this.spaceShip.sprite;
    addPlayer(this);
  }
  onPayerAttack(evt: { sprite: Sprite }) {
    if (
      evt.sprite == this.sprite &&
      this.game.isGameStarted &&
      !this.game.isGameOver &&
      this.numBullets > 0
    ) {
      console.log('shoot bullet');
      const x = this.sprite.x;
      const y = this.sprite.y;
      const rotation = this.sprite.rotation;
      const color = this.sprite.color;

      this.bullets.push(new Bullet(this.game, { x, y, rotation, color }));
      --this.numBullets;
    }
  }
  onMonetizeProgress = (evt: any) => {
    if (
      this.spaceShip.spaceshipIndex !== this.playerProps.spaceShipRenderIndex
    ) {
      this.spaceShip.spaceshipIndex = this.playerProps.spaceShipRenderIndex;
    }
  };
  update(dt: number): void {
    this.addPointToTrail(dt);
    this.sprite.update(dt);
    checkLineIntersection(this.getLastTrailPoint(), this.sprite);
    this.updateEngineEffect(dt);
    this.wallCollision();
    this.updateDeadPlayer();
    this.bullets.forEach((b) => b.update(dt));
  }
  render(): void {
    this.renderTrail();
    this.sprite.render();
    this.effect.render();
    this.renderDeadPlayer();
    this.bullets.forEach((b) => b.render());
  }
  addPointToTrail(dt: number) {
    if (this.playerState === PlayerState.tracing) {
      this.timeSinceLastTrailAdded += dt;
      if (this.timeSinceLastTrailAdded >= this.timeToAddTrailInterval) {
        this.getEndTrail().push(KontraVector(this.sprite.x, this.sprite.y));
        this.timeSinceLastTrailAdded = 0;
      }
    }
  }
  renderTrail() {
    if (this.trails.length) {
      this.ctx.lineWidth = 3 * this.scale;
      this.ctx.beginPath();
      this.trails.forEach((segment, index) => {
        if (!segment || !segment.length) return;
        this.ctx.moveTo(segment[0].x, segment[0].y);
        this.ctx.strokeStyle = this.playerProps.color || '#000';
        segment.forEach((t) => {
          this.ctx.lineTo(t.x, t.y);
        });
        this.ctx.stroke();
        // Draw to player head on last segment
        if (
          this.playerState !== PlayerState.dead &&
          index === this.trails.length - 1
        ) {
          this.ctx.lineTo(this.sprite.x, this.sprite.y);
          this.ctx.stroke();
        }
      });
    }
  }
  onStartTrace() {
    this.sprite.dx = this.speed;
    this.sprite.dy = this.speed;
    this.setPlayerState(PlayerState.tracing);
    this.getEndTrail().push(KontraVector(this.sprite.x, this.sprite.y));
  }
  onHitTrail({
    point,
    go,
    playerId,
    trailIndex,
    segmentIndex,
  }: {
    point: Vector;
    go: Sprite;
    playerId: number;
    trailIndex: number;
    segmentIndex: number;
  }) {
    if (go === this.sprite) {
      this.setPlayerState(PlayerState.dead);
      // finish trail by adding last point
      this.getEndTrail().push(point);
    }
    if (!this.spaceShip.rotating) {
      // Add point to prevent alive player from dying right after being hit, but only if not rotating
      this.getEndTrail().push(KontraVector(this.sprite.x, this.sprite.y));
    }
    if (playerId === this.playerId) {
      this.splitLineSegment({ segmentIndex, trailIndex });
    }
  }
  splitLineSegment({ segmentIndex, trailIndex }: any) {
    const orgSegment = [...this.trails[segmentIndex]];
    this.trails[segmentIndex].length = 0;
    const newTrail = [];
    const numPointsToRemove = 3;
    for (let i = 0; i < orgSegment.length; i++) {
      if (i < trailIndex - numPointsToRemove) {
        this.trails[segmentIndex].push(orgSegment[i]);
      } else if (i > trailIndex + numPointsToRemove) {
        newTrail.push(orgSegment[i]);
      }
    }
    this.trails.push(newTrail);
  }
  onGameOver(props: { winner: Player }) {
    if (props.winner === this) {
      this.setPlayerState(PlayerState.idle);
    }
  }
  onHitWall({ point, go }: { point: Vector; go: Sprite }) {
    if (go === this.sprite) {
      this.setPlayerState(PlayerState.dead);
      // finish trail by adding last point
      this.getEndTrail().push(point);
    }
  }
  wallCollision() {
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
  }
  updateDeadPlayer() {
    if (this.playerState === PlayerState.dead) {
      // TODO create something nice
    }
  }
  renderDeadPlayer() {
    if (this.playerState === PlayerState.dead) {
      // TODO create something nice
    }
  }
  setPlayerState(state: PlayerState) {
    if (this.playerState !== state) {
      this.playerState = state;
      emit(GameEvent.playerStateChange, { state, ship: this.spaceShip });
      if (
        this.playerState === PlayerState.dead ||
        this.playerState === PlayerState.idle
      ) {
        this.sprite.dx = 0;
        this.sprite.dy = 0;
      }
    }
  }
  updateEngineEffect(dt: number) {
    this.effect.sprite.x = this.sprite.x - 5;
    this.effect.sprite.y = this.sprite.y - 5;
    this.effect.dx = this.sprite.dx;
    this.effect.dy = this.sprite.dy;
    this.effect.rotation = this.sprite.rotation;
    this.effect.sprite.color = this.sprite.color;
    this.effect.update(dt);
  }
  resetPlayer() {
    this.trails.splice(0, this.trails.length, []); // remove all segments

    this.numBullets = this.maxBullets;
    this.setPlayerState(PlayerState.idle);
    this.resetStartPos();
  }
  // The last trail of all line segments
  getEndTrail(): Vector[] {
    return this.trails[this.trails.length - 1];
  }
  getLastTrailPoint(): Vector {
    if (this.getEndTrail()) {
      return this.getEndTrail()[this.getEndTrail().length - 1];
    }
  }
  private resetStartPos() {
    this.spaceShip.sprite.x = getRandomPos(
      this.game.canvasWidth * this.game.scale
    );
    this.spaceShip.sprite.y = getRandomPos(
      this.game.canvasHeight * this.game.scale
    );
  }
}
export { Player };
