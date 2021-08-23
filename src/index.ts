import { Game } from './game';

const monetizeExample = (bodyEl: HTMLElement) => {
  let totalSupport = 0;
  const monetizationProgressEl = document.createElement('div');
  monetizationProgressEl.setAttribute('id', 'monetizationProgress');
  bodyEl.appendChild(monetizationProgressEl);

  const monetizationprogress = (res: any) => {
    if (res) {
      const detail: { amount: string; assetCode: string; assetScale: number } =
        res.detail;
      totalSupport =
        totalSupport +
        Number.parseInt(detail.amount) / Math.pow(10, detail.assetScale);
      monetizationProgressEl.innerHTML = `Thanks for being a Coil subscriber!<br/>You support me with 
      ${totalSupport.toPrecision(10)} ${detail.assetCode} this session`;
    }
  };

  // Add monetization listener
  if (document && (<any>document).monetization) {
    (<any>document).monetization.addEventListener(
      'monetizationprogress',
      monetizationprogress
    );
  } else {
    window.addEventListener('monetizationprogress', monetizationprogress);
  }
};

function init() {
  const bodyEl: HTMLElement = document.getElementsByTagName('body')[0];
  const gameEl: HTMLCanvasElement = <HTMLCanvasElement>(
    document.getElementById('game')
  );

  monetizeExample(bodyEl);
  new Game(gameEl);
}
init();
