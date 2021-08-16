import { Vector } from '../kontra/';

export const lineIntersection = (
  p1: Vector,
  p2: Vector,
  p3: Vector,
  p4: Vector
) => {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (d == 0) return {}; // parallel lines
  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
  if (u < 0.0 || u > 1.0) return {}; // intersection point not between p1 and p2
  if (v < 0.0 || v > 1.0) return {}; // intersection point not between p3 and p4
  let intersection: any = {};
  intersection.x = p1.x + u * (p2.x - p1.x);
  intersection.y = p1.y + u * (p2.y - p1.y);

  return intersection;
};
