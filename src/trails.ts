import { Sprite, Vector } from 'kontra';
import { emit } from 'kontra';
import { GameEvent } from './gameEvent';
import { lineIntersection } from './gameUtils';
import { Player } from './player';

// TODO (johnedvard) don't hardcode players
const players: Player[] = [null, null, null, null];
export const playerTrails: Vector[][][] = [[[]], [[]], [[]], [[]]]; // playerIds with a list of line segments.
/**
 * Used to add the player's latest position to the trail before checking intersection
 */
export const addPlayer = (player: Player) => {
  players[player.playerId] = player;
};
/**
 * Check if player hits any trail
 */
export const checkLineIntersection = (goPoint: Vector, go: Sprite) => {
  if (!goPoint || !go) return;
  const lastPoint = goPoint;
  const lastPoint2 = new Vector(go.x, go.y);

  playerTrails.forEach((trails, playerId) => {
    trails.forEach((lineSegment, segmentIndex) => {
      const points = [...lineSegment];
      if (
        players[playerId].sprite !== go &&
        segmentIndex === trails.length - 1
      ) {
        // Add player pos if last line segment
        points.push(
          new Vector(players[playerId].sprite.x, players[playerId].sprite.y)
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
            emit(GameEvent.hitTrail, {
              point: intersection,
              go,
              playerId: playerId,
              trailIndex: i,
              segmentIndex,
            });
          }
        }
      }
    });
  });
};
