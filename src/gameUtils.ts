import { Vector, Sprite } from 'kontra';
import { Game } from './game';

export const lineIntersection = (
  p1: Vector,
  p2: Vector,
  p3: Vector,
  p4: Vector
): Vector => {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (d == 0) return null; // parallel lines
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  if (u < 0.0 || u > 1.0) return null; // intersection point not between p1 and p2
  if (v < 0.0 || v > 1.0) return null; // intersection point not between p3 and p4
  const intersectionX = p1.x + u * (p2.x - p1.x);
  const intersectionY = p1.y + u * (p2.y - p1.y);
  let intersection: Vector = new Vector(intersectionX, intersectionY);
  return intersection;
};

//Returns bool, whether the projected point is actually inside the (finite) line segment.
export const isPointOnLine = (p1: Vector, p2: Vector, p3: Vector): boolean => {
  if (p1.distance && p2.distance && p3.distance)
    return p1.distance(p3) + p2.distance(p3) === p1.distance(p2);
  return false;
};
export const isOutOfBounds = (game: Game, go: Sprite): boolean => {
  return (
    go.x <= 0 ||
    go.x >= game.canvas.width ||
    go.y <= 0 ||
    go.y >= game.canvas.height
  );
};

export const createColorFromName = (name: string) => {
  let color = '000000';
  for (let i = 0; i < name.length; i++) {
    try {
      const deciNum = parseInt(name[i], 36) || 0;
      const hexNum = parseInt(color[i % 6], 16);
      const hexStr = color[i % 6];
      const newHexStr = ((hexNum + deciNum) % 16).toString(16);
      color = color.replace(hexStr, newHexStr);
    } catch {}
  }
  return color;
};

export const getRandomPos = (widthOrHeight: number) => {
  return 80 + Math.random() * (widthOrHeight - 160);
};

export const getPlayerControls = (playerId: number): string[] => {
  let leftKey = 'left';
  let rightKey = 'right';
  let weaponKey = 'up';
  if (playerId === 1) {
    leftKey = 'q';
    rightKey = 'w';
    weaponKey = 'e';
  }
  if (playerId === 2) {
    leftKey = 'v';
    rightKey = 'b';
    weaponKey = 'n';
  }
  if (playerId === 3) {
    leftKey = 'i';
    rightKey = 'o';
    weaponKey = 'p';
  }
  return [leftKey, rightKey, weaponKey];
};
