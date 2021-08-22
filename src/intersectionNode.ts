export class IntersectionNode {
  static ID = 0;
  children: IntersectionNode[] = [];
  parent: IntersectionNode;
  trail: any[]; //Vector trail
  name: number;
  constructor(
    private _startPoint?: any,
    private _endPoint?: any,
    parent?: IntersectionNode,
    trail?: any[]
  ) {
    this.parent = parent;
    this.name = ++IntersectionNode.ID;
    this.trail = trail;
  }

  get startPoint() {
    return this._startPoint;
  }
  get endPoint() {
    return this._endPoint;
  }
}
