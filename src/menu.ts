import { Game } from './game';
import { IGameObject } from './iGameobject';
import { Sprite } from '../kontra/kontra';
import { emit, on } from '../kontra/src/events';
import { createColorFromName, getPlayerControls } from './gameUtils';
import { GameEvent } from './gameEvent';
import { SpaceShip } from './spaceShip';
import { PlayerState } from './playerState';
import { bindKeys } from '../kontra/src/keyboard';
import { MonetizeEvent } from './monetizeEvent';

export class Menu implements IGameObject {
  sprite: Sprite;
  spaceShips: SpaceShip[];
  menuEl: HTMLElement;
  spaceDesc: HTMLElement;
  userName: string;
  constructor(private game: Game, scale: number) {
    const offset = 130;
    const gap = 355;
    this.spaceShips = [...Array(game.maxPlayers).keys()].map((id) => {
      const spriteProps = {
        x: this.game.canvas.width / 4 + gap * id - offset,
        y: window.innerHeight / 2,
        color:
          id > 0
            ? '#' + createColorFromName(game.extraPlayerNames[id - 1])
            : '',
      };
      const [leftKey, rightKey] = getPlayerControls(id);
      return new SpaceShip(this.game, PlayerState.idle, {
        scale: scale || 1,
        spriteProps: { ...spriteProps },
        isPreview: true,
        leftKey,
        rightKey,
      });
    });
    this.menuEl = document.getElementById('menu');

    const nameEl = document.getElementById('name');
    nameEl.addEventListener('keyup', (ev) => this.nameChange(ev));
    this.setUserName(nameEl);

    const startgameEl = document.getElementById('startgame');
    startgameEl.addEventListener('click', (ev) => {
      this.game.nearConnection.ready.then(() => {
        this.game.nearConnection.setName(this.userName);
        emit(GameEvent.startGame, {
          spaceShipRenderIndices: this.spaceShips.map((ship) => {
            return ship.spaceshipIndex;
          }),
        });
        this.menuEl.classList.add('out');
      });
    });

    this.handleInput();
    this.setSubscriptionTextVisibility(0);
    this.initSpaceshipSelectionUi();
    on(MonetizeEvent.progress, () => this.onMonetizeProgress());
    window.addEventListener(
      'drand',
      (e: any) => {
        this.setNewPlayerNames(e.detail);
      },
      false
    );
  }
  setNewPlayerNames(colorNames: string[]) {
    this.spaceShips.forEach((ship, index) => {
      // ignore player 1
      if (index > 0) {
        ship.sprite.color = '#' + createColorFromName(colorNames[index - 1]);
      }
    });
  }
  initSpaceshipSelectionUi() {
    const arrowGroupEl: HTMLElement = document.getElementById('arrowGroup');
    arrowGroupEl.addEventListener('click', (evt) => this.onArrowClicked(evt));
    for (let i = 0; i < this.game.maxPlayers; i++) {
      const leftArrow = document.createElement('button');
      leftArrow.setAttribute('id', 'leftArrow-' + i);
      leftArrow.innerHTML = '<';
      const rightArrow = document.createElement('button');
      rightArrow.setAttribute('id', 'rightArrow-' + i);
      rightArrow.innerHTML = '>';
      arrowGroupEl.appendChild(leftArrow);
      arrowGroupEl.appendChild(rightArrow);
    }
  }
  onArrowClicked(evt: Event) {
    const target: HTMLElement = <HTMLElement>evt.target;
    const idAttr = target.getAttribute('id');
    if (idAttr.match('rightArrow-') || idAttr.match('leftArrow-')) {
      const next = idAttr.match('leftArrow') ? 1 : -1;
      const playerId = parseInt(idAttr.split('-')[1], 10);
      console.log('playerId', playerId);
      console.log('next', next);
      this.selectSpaceShip(playerId, next);
    }
  }
  onMonetizeProgress() {
    this.spaceDesc = this.spaceDesc || document.getElementById('spaceDesc');
    if (!this.spaceDesc.classList.contains('subscriber')) {
      this.spaceDesc.classList.add('subscriber');
      this.spaceDesc.innerHTML =
        'Thanks for being a Coil subscriber. You can use this ship';
    }
  }
  selectSpaceShip(spaceShipId: number, next: number) {
    let newSpaceShipIndex = this.spaceShips[spaceShipId].spaceshipIndex + next;
    if (newSpaceShipIndex < 0) {
      newSpaceShipIndex = this.spaceShips[spaceShipId].ships.length - 1;
    } else if (newSpaceShipIndex >= this.spaceShips[spaceShipId].ships.length) {
      newSpaceShipIndex = 0;
    }
    this.spaceShips[spaceShipId].spaceshipIndex = newSpaceShipIndex;
  }
  setSubscriptionTextVisibility(newSpaceShipIndex: number) {
    this.spaceDesc = this.spaceDesc || document.getElementById('spaceDesc');
    if (newSpaceShipIndex) {
      this.spaceDesc.classList.remove('hide');
    } else {
      this.spaceDesc.classList.add('hide');
    }
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
    this.spaceShips.forEach((ship) => {
      ship.sprite.update(dt);
    });
  }
  render(): void {
    this.spaceShips.forEach((ship) => {
      ship.sprite.render();
    });
  }
  nameChange(event: any) {
    this.userName = event.target.value;
    this.setColorFromName(this.userName);
  }
  setColorFromName(name: string) {
    this.spaceShips[0].sprite.color = '#' + createColorFromName(name);
  }
  async setUserName(nameEl: HTMLElement) {
    await this.game.nearConnection.ready;
    this.userName = await this.game.nearConnection.getName();
    nameEl.setAttribute('value', this.userName);
    this.setColorFromName(this.userName);
  }
}
