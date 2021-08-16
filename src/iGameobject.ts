import { Sprite } from './../kontra';
export interface IGameObject {
  go: Sprite;
  update(dt: number): void;
  render(): void;
}
