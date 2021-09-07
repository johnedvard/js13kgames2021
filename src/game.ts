import { init } from './../kontra/src/core';
import { bindKeys, initKeys } from './../kontra/src/keyboard';
import { initPointer } from './../kontra/src/pointer';
import GameLoop from './../kontra/src/gameLoop';
import { IGameObject } from './iGameobject';
import { NearConnection } from './near/nearConnection';
import { initLoginLogout } from './near/nearLogin';
import { Player } from './player';
import { Menu } from './menu';
import { emit, on } from '../kontra/src/events';
import { GameEvent } from './gameEvent';
import { createColorFromName } from './gameUtils';
import { PlayerState } from './playerState';
import { DeadFeedback } from './deadFeedback';

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
  player2Name = 'e500ff';
  player3Name = '814007';
  player4Name = '1d34fa';
  extraPlayerNames = [this.player2Name, this.player3Name, this.player4Name];
  maxPlayers = 4;
  players: Player[] = [];
  isGameOver = false;
  isGameStarted = false;
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
    initPointer();
    this.menu = new Menu(this, this.scale);
    this.initLoop();
    this.handleGameInput();
    this.gos.push(new DeadFeedback(this));
    on(GameEvent.startGame, (props: any) => this.onStartGame(props));
    on(GameEvent.newGame, (props: any) => this.onNewGame(props));
  }
  handleGameInput() {
    bindKeys(
      'space',
      (e) => {
        console.log('space bounded');
        if (this.isGameOver) {
          console.log('emit new game ');
          emit(GameEvent.newGame, {});
        } else if (this.isGameStarted && !this.isGameOver) {
          if (
            this.players.filter((p) => p.playerState === PlayerState.idle)
              .length === this.players.length
          ) {
            console.log('start trace');
            emit(GameEvent.startTrace);
          }
        }
      },
      { handler: 'keyup' }
    );
  }
  initLoop() {
    this.gos.push(this.menu);

    const loop: any = new GameLoop({
      update: (dt: number) => {
        this.gos.forEach((go) => go.update(dt));
        this.checkGameOver();
      },
      render: () => {
        this.gos.forEach((go) => go.render());
      },
    });
    loop.start();
  }
  checkGameOver() {
    const deadPlayers = this.players.filter(
      (p) => p.playerState === PlayerState.dead
    );
    if (this.isGameStarted && deadPlayers.length >= this.players.length - 1) {
      this.isGameOver = true;
      emit(GameEvent.gameOver, {
        winner: this.players.find((p) => p.playerState !== PlayerState.dead),
      });
    }
  }
  initNear() {
    const nearConnection = new NearConnection();
    this.nearConnection = nearConnection;
    nearConnection.initContract().then((res) => {
      initLoginLogout(nearConnection);
    });
  }
  async onStartGame(props: { spaceShipRenderIndices: number[] }) {
    this.isGameStarted = true;
    if (this.gos.includes(this.menu)) {
      this.gos.splice(this.gos.indexOf(this.menu), 1);
      const userName = await this.nearConnection.getName();
      [...Array(this.maxPlayers).keys()].forEach((id) => {
        const player = new Player(this, this.scale, {
          color:
            id > 0
              ? '#' + createColorFromName(this.extraPlayerNames[id - 1])
              : '#' + createColorFromName(userName),
          isAi: false,
          spaceShipRenderIndex: props.spaceShipRenderIndices[id],
          playerId: id,
        });
        this.players.push(player);
        this.gos.push(player);
      });
    } else {
    }
  }
  onNewGame(props: any) {
    this.isGameOver = false;
    this.players.forEach((p) => {
      p.resetPlayer();
    });
  }
}
