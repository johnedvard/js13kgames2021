import Sprite from './../kontra/src/sprite';
import { IGameObject } from './iGameobject';

export class Trail implements IGameObject {
  go: any;
  color = '#33de34';
  constructor() {
    this.go = Sprite({
      color: this.color,
      width: 1,
      height: 1,
    });
  }
  update(dt: number): void {}
  render(): void {}
}
