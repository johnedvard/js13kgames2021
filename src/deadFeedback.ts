import { Sprite } from '../kontra/kontra';
import { on } from '../kontra/src/events';
import { Game } from './game';
import { GameEvent } from './gameEvent';
import { IGameObject } from './iGameobject';
import { PlayerState } from './playerState';
import { SpaceShip } from './spaceShip';

export class DeadFeedback implements IGameObject {
  sprite: Sprite;
  isRender = false;
  constructor(private game: Game) {
    on(GameEvent.playerStateChange, (evt: any) =>
      this.onPlayerStateChange(evt)
    );
  }
  onPlayerStateChange(evt: { state: PlayerState; ship: SpaceShip }) {
    if (evt.state === PlayerState.dead) {
      this.isRender = true;
      setTimeout(() => {
        this.isRender = false;
      }, 90);
    }
  }
  update(dt: number) {}
  render() {
    if (this.isRender) {
      this.game.ctx.fillStyle = 'black';
      this.game.ctx.fillRect(
        0,
        0,
        this.game.canvas.width,
        this.game.canvas.height
      );
    }
  }
}
