import { Sprite } from '../kontra/kontra';
import { emit, on } from '../kontra/src/events';
import { bindKeys, keyPressed } from '../kontra/src/keyboard';
import KontraSprite from '../kontra/src/sprite';
import { Game } from './game';
import { GameEvent } from './gameEvent';
import { PlayerState } from './playerState';
import { spaceShipRenderers } from './spaceShipRenderers';

export class SpaceShip {
  sprite: Sprite;
  rightKey = 'right';
  leftKey = 'left';
  spaceshipIndex = 0;
  ships: any[] = [...spaceShipRenderers];
  rotating = false;
  constructor(
    private game: Game,
    private playerState: PlayerState,
    props: {
      scale: number;
      spriteProps: any;
      isPreview: boolean;
      leftKey?: string;
      rightKey?: string;
    }
  ) {
    this.rightKey = props.rightKey || this.rightKey;
    this.leftKey = props.leftKey || this.leftKey;
    const spaceShip = this;
    const rotationSpeed = 5;
    const ship: any = KontraSprite({
      x: props.spriteProps.x,
      y: props.spriteProps.y,
      color: props.spriteProps.color || '#000',
      width: 15 * props.scale,
      height: 10 * props.scale,
      dx: 0,
      anchor: { x: 0.1, y: 0.5 },
      rotation: -Math.PI / 2,
      render: function () {
        spaceShip.renderSpaceShip(this);
      },
      update: function (dt: number) {
        if (keyPressed(spaceShip.leftKey)) {
          this.rotation -= rotationSpeed * dt;
          emit(GameEvent.playerRotation, {
            rotationDirection: -1,
            sprite: spaceShip.sprite,
          });
          spaceShip.rotating = true;
        } else if (keyPressed(spaceShip.rightKey)) {
          this.rotation += rotationSpeed * dt;
          emit(GameEvent.playerRotation, {
            rotationDirection: 1,
            sprite: spaceShip.sprite,
          });
          spaceShip.rotating = true;
        } else {
          spaceShip.rotating = false;
        }
        // move the ship forward in the direction it's facing
        this.x = this.x + this.dx * dt * Math.cos(this.rotation);
        this.y = this.y + this.dy * dt * Math.sin(this.rotation);
      },
    });
    this.sprite = ship;
    on(GameEvent.playerStateChange, (evt: any) =>
      this.onPlayerStateChange(evt)
    );
  }

  onPlayerStateChange(evt: { state: PlayerState; ship: SpaceShip }) {
    if (evt.ship === this) {
      this.playerState = evt.state;
    }
  }

  renderSpaceShip(sprite: Sprite) {
    if (this.playerState !== PlayerState.dead) {
      spaceShipRenderers[this.spaceshipIndex](sprite);
    }
  }
}
