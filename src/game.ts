import { init } from './../kontra/src/core';
import { initKeys } from './../kontra/src/keyboard';
import GameLoop from './../kontra/src/gameLoop';
import { IGameObject } from './iGameobject';
import { NearConnection } from './near/nearConnection';
import { initLoginLogout } from './near/nearLogin';
import { Player } from './player';
import { Menu } from './menu';
import { on } from '../kontra/src/events';
import { GameEvent } from './gameEvent';
import { createColorFromName } from './gameUtils';

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  x = 10;
  gos: IGameObject[] = [];
  player: Player;
  menu: Menu;
  scale: number;
  canvasWidth = 800;
  canvasHeight = 600;
  nearConnection: NearConnection;
  constructor(canvas: HTMLCanvasElement) {
    this.initNear();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scale = 2;
    canvas.width = this.canvasWidth * this.scale;
    canvas.height = this.canvasHeight * this.scale;
    init(canvas);
    initKeys();
    this.menu = new Menu(this, this.scale);
    this.initLoop();
    on(GameEvent.startGame, this.onStartGame);
  }
  initLoop() {
    this.gos.push(this.menu);

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
    this.nearConnection = nearConnection;
    nearConnection.initContract().then((res) => {
      initLoginLogout(nearConnection);
    });
  }
  onStartGame = async (props: { spaceShipRenderIndex: number }) => {
    if (this.gos.includes(this.menu)) {
      this.gos.splice(this.gos.indexOf(this.menu), 1);
      const userName = await this.nearConnection.getName();
      this.player = new Player(this, this.scale, {
        color: '#' + createColorFromName(userName),
        isAi: false,
        spaceShipRenderIndex: props.spaceShipRenderIndex,
      });
      this.gos.push(this.player);
    } else {
    }
  };
}
