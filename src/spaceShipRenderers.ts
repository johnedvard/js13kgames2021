import { Sprite } from '../kontra/kontra';

export const renderDefaultSpaceShip = (sprite: Sprite, isHollow = false) => {
  sprite.context.fillStyle = sprite.color;
  sprite.context.strokeStyle = sprite.color;
  sprite.context.lineWidth = 4;
  sprite.context.beginPath();
  sprite.context.lineCap = 'round';
  sprite.context.moveTo(0, 0); // top left corner
  sprite.context.lineTo(sprite.width, sprite.height / 2); // bottom
  sprite.context.lineTo(0, sprite.height); // top right corner
  sprite.context.lineTo(0, 0); // close path
  if (isHollow) {
    sprite.context.stroke();
  } else {
    sprite.context.fill();
  }
};

export const renderCoolDefaultSpaceShip = (
  sprite: Sprite,
  isHollow = false
) => {
  sprite.context.fillStyle = sprite.color;
  sprite.context.strokeStyle = sprite.color;
  sprite.context.lineWidth = 4;
  sprite.context.beginPath();
  sprite.context.lineCap = 'round';
  sprite.context.moveTo(0, 0);
  sprite.context.lineTo(4, 1);
  sprite.context.lineTo(sprite.width, sprite.height / 2);
  sprite.context.lineTo(0, sprite.height);
  sprite.context.lineTo(5, sprite.height / 2);
  sprite.context.lineTo(0, 0); // close path
  if (isHollow) {
    sprite.context.stroke();
  } else {
    sprite.context.fill();
  }
};

export const renderBoxySpaceShip = (sprite: Sprite) => {
  sprite.context.fillStyle = sprite.color;
  sprite.context.strokeStyle = sprite.color;
  sprite.context.lineWidth = 4;
  sprite.context.beginPath();
  sprite.context.lineCap = 'round';
  sprite.context.moveTo(0, 0);
  sprite.context.lineTo(4, 1);
  sprite.context.lineTo(sprite.width, sprite.height / 2);
  sprite.context.lineTo(0, sprite.height);
  sprite.context.lineTo(5, sprite.height / 2);
  sprite.context.fill();
};

export const spaceShipRenderers: any[] = [
  renderDefaultSpaceShip,
  renderCoolDefaultSpaceShip,
  (sprite: Sprite) => renderDefaultSpaceShip(sprite, true),
  (sprite: Sprite) => renderCoolDefaultSpaceShip(sprite, true),
];
