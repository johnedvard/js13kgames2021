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
import { playSong, toggleSond } from './sound';

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
  extraPlayerNames = ['e500ff', '814007', '1d34fa'];
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
    window.addEventListener(
      'drand',
      (e: any) => {
        this.setNewPlayerNames(e.detail);
      },
      false
    );
  }
  setNewPlayerNames(colorNames: string[]) {
    colorNames.forEach((cn, index) => {
      this.extraPlayerNames[index] = cn;
    });
  }
  handleGameInput() {
    bindKeys(
      'space',
      (e) => {
        if (this.isGameOver) {
          emit(GameEvent.newGame, {});
        } else if (this.isGameStarted && !this.isGameOver) {
          if (
            this.players.filter((p) => p.playerState === PlayerState.idle)
              .length === this.players.length
          ) {
            emit(GameEvent.startTrace);
          }
        }
      },
      { handler: 'keyup' }
    );
    bindKeys(
      'm',
      (e) => {
        toggleSond();
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
  onStartGame(props: { spaceShipRenderIndices: number[]; userName: string }) {
    this.isGameStarted = true;
    if (this.gos.includes(this.menu)) {
      this.gos.splice(this.gos.indexOf(this.menu), 1);
    }
    [...Array(this.maxPlayers).keys()].forEach((id) => {
      const player = new Player(this, this.scale, {
        color:
          id > 0
            ? '#' + createColorFromName(this.extraPlayerNames[id - 1])
            : '#' + createColorFromName('No_Name'),
        isAi: false,
        spaceShipRenderIndex: props.spaceShipRenderIndices[id],
        playerId: id,
      });
      this.players.push(player);
      this.gos.push(player);
    });
    this.nearConnection
      .getName()
      .then((name) => {
        this.setPlayerColor(name);
      })
      .catch(() => {
        this.setPlayerColor('No_Name');
      });
    playSong();
  }
  setPlayerColor(name: string) {
    if (this.players && this.players[0]) {
      this.players[0].setColor('#' + createColorFromName(name));
    }
  }
  onNewGame(props: any) {
    this.isGameOver = false;
    this.players.forEach((p) => {
      p.resetPlayer();
    });
  }
}
