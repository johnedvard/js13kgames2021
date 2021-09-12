import { Sprite } from '../kontra/kontra';

let spriteShipImg: HTMLImageElement;

const renderXmark = (sprite: Sprite, isSubscriber = false) => {
  if (isSubscriber) return;
  sprite.context.strokeStyle = '#000000aa';
  const padding = 10;
  sprite.context.moveTo(-padding, -padding);
  sprite.context.lineTo(sprite.width + padding, sprite.height + padding);
  sprite.context.moveTo(-padding, sprite.height + padding);
  sprite.context.lineTo(sprite.width + padding, padding);
  sprite.context.stroke();
};
export const renderDefaultSpaceShip = (
  sprite: Sprite,
  isSubscriber = false,
  isHollow = false
) => {
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
    renderXmark(sprite, isSubscriber);
  } else {
    sprite.context.fill();
  }
};

export const renderSpriteShip = (sprite: Sprite, isSubscriber = false) => {
  if (spriteShipImg) {
    sprite.context.drawImage(
      spriteShipImg,
      0,
      -sprite.anchor.x * sprite.height,
      sprite.width,
      sprite.height
    );
    renderXmark(sprite, isSubscriber);
    sprite.image = spriteShipImg;
    return;
  }
  let image = new Image();
  image.src = 'assets/spaceship.png';
  image.onload = function () {
    sprite.image = image;
    spriteShipImg = image;
  };
};

export const renderCoolDefaultSpaceShip = (
  sprite: Sprite,
  isSubscriber = false,
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
  renderXmark(sprite, isSubscriber);
};

export const spaceShipRenderers: any[] = [
  renderDefaultSpaceShip,
  renderCoolDefaultSpaceShip,
  (sprite: Sprite, isSubscriber: boolean) =>
    renderDefaultSpaceShip(sprite, isSubscriber, true),
  (sprite: Sprite, isSubscriber: boolean) =>
    renderCoolDefaultSpaceShip(sprite, isSubscriber, true),
  (sprite: Sprite, isSubscriber: boolean) =>
    renderSpriteShip(sprite, isSubscriber),
];
