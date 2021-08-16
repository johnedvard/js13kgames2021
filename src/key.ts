var _pressed: any = {};
var key: any = {};

key.LEFT = 37;
key.UP = 38;
key.RIGHT = 39;
key.DOWN = 40;

key.isDown = function (keyCode: number) {
  return _pressed[keyCode];
};

key.onKeydown = function (event: any) {
  _pressed[event.keyCode] = true;
};

key.onKeyup = function (event: any) {
  _pressed[event.keyCode] = null;
};

window.addEventListener(
  'keyup',
  function (e) {
    key.onKeyup(e);
  },
  false
);
window.addEventListener(
  'keydown',
  function (e) {
    key.onKeydown(e);
  },
  false
);

export { key };
