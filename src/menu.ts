import { Game } from './game';
import KontraSprite from './../kontra/src/sprite';
import { IGameObject } from './iGameobject';
import { Sprite } from '../kontra/kontra';
import { emit } from '../kontra/src/events';
import { createColorFromName } from './gameUtils';
import { GameEvent } from './gameEvent';
import { SpaceShip } from './spaceShip';
import { PlayerState } from './playerState';
import { bindKeys } from '../kontra/src/keyboard';

export class Menu implements IGameObject {
  go: Sprite;
  menuEl: HTMLElement;
  userName: string;
  constructor(private game: Game, scale: number) {
    const spriteProps = {
      x: this.game.canvas.width / 2, // starting x,y position of the sprite
      y: window.innerHeight / 2,
    };
    const spaceShip = new SpaceShip(this.game, PlayerState.idle, {
      scale: scale || 1,
      spriteProps,
      isPreview: true,
    });
    this.go = spaceShip.sprite;
    this.menuEl = document.getElementById('menu');

    const nameEl = document.getElementById('name');
    nameEl.addEventListener('keyup', (ev) => this.nameChange(ev));
    this.setUserName(nameEl);

    const startgameEl = document.getElementById('startgame');
    startgameEl.addEventListener('click', (ev) => {
      this.game.nearConnection.ready.then(() => {
        this.game.nearConnection.setName(this.userName);
        emit(GameEvent.startGame, {});
        this.menuEl.classList.add('out');
      });
    });
    this.handleInput();
  }
  handleInput() {
    bindKeys(
      'm',
      (e) => {
        this.toggleMenu();
      },
      { handler: 'keyup' }
    );
  }
  toggleMenu() {
    if (this.menuEl.classList.contains('out')) {
      this.menuEl.classList.add('in');
      this.menuEl.classList.remove('out');
    } else {
      this.menuEl.classList.add('out');
      this.menuEl.classList.remove('in');
    }
  }
  update(dt: number): void {
    this.go.update(dt);
  }
  render(): void {
    this.go.render();
  }
  nameChange(event: any) {
    this.userName = event.target.value;
    this.setColorFromName(this.userName);
  }
  setColorFromName(name: string) {
    this.go.color = '#' + createColorFromName(name);
  }
  async setUserName(nameEl: HTMLElement) {
    await this.game.nearConnection.ready;
    this.userName = await this.game.nearConnection.getName();
    nameEl.setAttribute('value', this.userName);
    this.setColorFromName(this.userName);
  }
}
