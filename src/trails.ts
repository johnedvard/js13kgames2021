import { Sprite, Vector } from '../kontra/kontra';
import { emit } from '../kontra/src/events';
import KontraVector from '../kontra/src/vector';
import { GameEvent } from './gameEvent';
import { lineIntersection } from './gameUtils';
import { Player } from './player';
import { PlayerState } from './playerState';

// TODO (johnedvard) don't hardcode players
const players: Player[] = [null, null];
export const playerTrails: Vector[][] = [[], []];
/**
 * Used to add the player's latest position to the trail before checking intersection
 */
export const addPlayer = (player: Player) => {
  players[player.playerId] = player;
};
/**
 * Check if player hits own trail
 */
export const checkLineIntersection = (goPoint: Vector, go: Sprite) => {
  const lastPoint = goPoint;
  const lastPoint2 = KontraVector(go.x, go.y);

  playerTrails.forEach((trails, index) => {
    const points = [...trails];
    if (players[index].sprite !== go) {
      points.push(
        KontraVector(players[index].sprite.x, players[index].sprite.y)
      );
    }
    for (let i = 0; i < points.length - 1; i++) {
      const point = points[i];
      const point2 = points[i + 1];
      if (
        point !== lastPoint &&
        point !== lastPoint2 &&
        point2 !== lastPoint2 &&
        point2 !== lastPoint
      ) {
        const intersection = lineIntersection(
          point,
          point2,
          lastPoint,
          lastPoint2
        );
        if (intersection) {
          emit(GameEvent.hitTrail, { point: intersection, go });
        }
      }
    }
  });
};
