import { Game } from './game';
import KontraSprite from './../kontra/src/sprite';
import { IGameObject } from './iGameobject';
import { Sprite } from '../kontra/kontra';
import { emit } from '../kontra/src/events';
import { createColorFromName } from './gameUtils';
import { GameEvent } from './gameEvent';

export class Menu implements IGameObject {
  go: Sprite;
  menuEl: HTMLElement;
  constructor(private game: Game, scale = 1) {
    const menuPlayer: any = KontraSprite({
      x: this.game.canvas.width / 2, // starting x,y position of the sprite
      y: 300,
      color: 'black', // fill color of the sprite rectangle
      width: 15 * scale, // width and height of the sprite rectangle
      height: 10 * scale,
      dx: 0,
      anchor: { x: 0.1, y: 0.5 },
      rotation: Math.PI * 4,
      render: function () {
        // render triangle
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.lineCap = 'round';
        this.context.moveTo(0, 0); // top left corner
        this.context.lineTo(this.width, this.height / 2); // bottom
        this.context.lineTo(0, this.height); // top right corner
        this.context.fill();
      },
      update: function (dt: number) {},
    });
    this.go = menuPlayer;
    this.menuEl = document.getElementById('menu');

    const nameEl = document.getElementById('name');
    nameEl.addEventListener('keyup', (ev) => this.nameChange(ev));
    const startgameEl = document.getElementById('startgame');
    startgameEl.addEventListener('click', (ev) => {
      emit(GameEvent.startGame, {});
      this.menuEl.classList.add('out');
    });
  }
  update(dt: number): void {
    this.go.update(dt);
  }
  render(): void {
    this.go.render();
  }
  nameChange(event: any) {
    console.log(event);
    this.go.color = '#' + createColorFromName(event.target.value);
  }
}
