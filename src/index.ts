import { emit } from '../kontra/src/events';
import { Game } from './game';
import { MonetizeEvent } from './monetizeEvent';

const monetizeExample = () => {
  if (document && (<any>document).monetization) {
    (<any>document).monetization.addEventListener(
      'monetizationprogress',
      (evt: any) => emit(MonetizeEvent.progress, evt)
    );
  } else {
    window.addEventListener('monetizationprogress', (evt: any) =>
      emit(MonetizeEvent.progress, evt)
    );
  }
};

function init() {
  const gameEl: HTMLCanvasElement = <HTMLCanvasElement>(
    document.getElementById('game')
  );

  monetizeExample();
  new Game(gameEl);
}
init();
