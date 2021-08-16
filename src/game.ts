import { init } from './../kontra/src/core';
import { initKeys } from './../kontra/src/keyboard';
import GameLoop from './../kontra/src/gameLoop';
import { IGameObject } from './iGameobject';
import { NearConnection } from './near/nearConnection';
import { initLoginLogout } from './near/nearLogin';
import { Player } from './player';

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  x = 10;
  gos: IGameObject[] = [];
  player: Player;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    const scale = 2;
    canvas.width = 400 * scale;
    canvas.height = 400 * scale;
    init(canvas);
    initKeys();
    this.initNear();
    this.player = new Player(this, scale);
    this.gos.push(this.player);

    const loop: any = new GameLoop({
      update: (dt: number) => {
        this.gos.forEach((go) => go.update(dt));
      },
      render: () => {
        this.gos.forEach((go) => go.render());
      },
    });
    loop.start(); // start the game
  }

  initNear() {
    const nearConnection = new NearConnection();
    nearConnection.initContract().then((res) => {
      initLoginLogout(nearConnection);
    });
  }
}
