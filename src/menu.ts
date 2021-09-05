import { Game } from './game';
import { IGameObject } from './iGameobject';
import { Sprite } from '../kontra/kontra';
import { emit, on } from '../kontra/src/events';
import { createColorFromName } from './gameUtils';
import { GameEvent } from './gameEvent';
import { SpaceShip } from './spaceShip';
import { PlayerState } from './playerState';
import { bindKeys } from '../kontra/src/keyboard';
import { MonetizeEvent } from './monetizeEvent';

export class Menu implements IGameObject {
  sprite: Sprite;
  spaceShip: SpaceShip;
  menuEl: HTMLElement;
  spaceDesc: HTMLElement;
  userName: string;
  constructor(private game: Game, scale: number) {
    const spriteProps = {
      x: this.game.canvas.width / 2,
      y: window.innerHeight / 2,
    };
    this.spaceShip = new SpaceShip(this.game, PlayerState.idle, {
      scale: scale || 1,
      spriteProps,
      isPreview: true,
    });
    this.sprite = this.spaceShip.sprite;
    this.menuEl = document.getElementById('menu');

    const nameEl = document.getElementById('name');
    nameEl.addEventListener('keyup', (ev) => this.nameChange(ev));
    this.setUserName(nameEl);

    const startgameEl = document.getElementById('startgame');
    startgameEl.addEventListener('click', (ev) => {
      this.game.nearConnection.ready.then(() => {
        this.game.nearConnection.setName(this.userName);
        emit(GameEvent.startGame, {
          spaceShipRenderIndex: this.spaceShip.spaceshipIndex,
        });
        this.menuEl.classList.add('out');
      });
    });

    this.selectSpaceShipControls();
    this.handleInput();
    this.setSubscriptionTextVisibility(0);
    on(MonetizeEvent.progress, this.onMonetizeProgress);
  }
  onMonetizeProgress = () => {
    this.spaceDesc = this.spaceDesc || document.getElementById('spaceDesc');
    if (!this.spaceDesc.classList.contains('subscriber')) {
      this.spaceDesc.classList.add('subscriber');
      this.spaceDesc.innerHTML =
        'Thanks for being a Coil subscriber. You can use this ship';
    }
  };
  selectSpaceShipControls() {
    const leftArrowEl = document.getElementById('leftArrow');
    const rightArrowEl = document.getElementById('rightArrow');
    leftArrowEl.addEventListener('click', (ev) => this.selectSpaceShip(-1));
    rightArrowEl.addEventListener('click', (ev) => this.selectSpaceShip(1));
  }
  selectSpaceShip(next: number) {
    let newSpaceShipIndex = this.spaceShip.spaceshipIndex + next;
    if (newSpaceShipIndex < 0) {
      newSpaceShipIndex = this.spaceShip.ships.length - 1;
    } else if (newSpaceShipIndex >= this.spaceShip.ships.length) {
      newSpaceShipIndex = 0;
    }
    this.spaceShip.spaceshipIndex = newSpaceShipIndex;
    this.setSubscriptionTextVisibility(newSpaceShipIndex);
  }
  setSubscriptionTextVisibility = (newSpaceShipIndex: number) => {
    this.spaceDesc = this.spaceDesc || document.getElementById('spaceDesc');
    if (newSpaceShipIndex) {
      this.spaceDesc.classList.remove('hide');
    } else {
      this.spaceDesc.classList.add('hide');
    }
  };
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
    this.sprite.update(dt);
  }
  render(): void {
    this.sprite.render();
  }
  nameChange(event: any) {
    this.userName = event.target.value;
    this.setColorFromName(this.userName);
  }
  setColorFromName(name: string) {
    this.sprite.color = '#' + createColorFromName(name);
  }
  async setUserName(nameEl: HTMLElement) {
    await this.game.nearConnection.ready;
    this.userName = await this.game.nearConnection.getName();
    nameEl.setAttribute('value', this.userName);
    this.setColorFromName(this.userName);
  }
}
