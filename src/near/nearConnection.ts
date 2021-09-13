import { connect, Contract, keyStores, WalletConnection } from 'near-api-js';
import getConfig from './config';

export class NearConnection {
  walletConnection: WalletConnection;
  contract: Contract;
  accountId: string;
  private userName: string;
  ready: Promise<void>;
  nearConfig = getConfig('development');
  resolveContract: (value: void | PromiseLike<void>) => void;
  constructor() {
    this.ready = new Promise((resolve, reject) => {
      this.resolveContract = resolve;
    });
  }

  // Initialize contract & set global variables
  async initContract() {
    // Initialize connection to the NEAR testnet
    const keyStore = new keyStores.BrowserLocalStorageKeyStore();
    const near = await connect({ ...this.nearConfig, keyStore });

    // Initializing Wallet based Account. It can work with NEAR testnet wallet that
    // is hosted at https://wallet.testnet.near.org
    this.walletConnection = new WalletConnection(near, null);

    // Getting the Account ID. If still unauthorized, it's just empty string
    this.accountId = this.walletConnection.getAccountId();

    // Initializing our contract APIs by contract name and configuration
    this.contract = await new Contract(
      this.walletConnection.account(),
      this.nearConfig.contractName,
      {
        // View methods are read only. They don't modify the state, but usually return some value.
        viewMethods: ['getScores', 'getScore', 'getName'],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: ['setGreeting', 'setScore', 'setName'],
      }
    );
    this.resolveContract();

    return this.walletConnection;
  }

  logout() {
    this.walletConnection.signOut();
    // reload page
  }
  login() {
    // Allow the current app to make calls to the specified contract on the
    // user's behalf.
    // This works by creating a new access key for the user's account and storing
    // the private key in localStorage.
    this.walletConnection.requestSignIn(this.nearConfig.contractName);
  }

  setScore(levelName: string, score: string, name: string): Promise<any> {
    const json = JSON.stringify({ score, name });
    return (<any>this.contract).setScore({
      levelName,
      json,
    });
  }

  getScores(levelName: string) {
    const scoreBoard = (<any>this.contract).getScores({ levelName });
    return scoreBoard;
  }

  getScore(levelName: string): Promise<any> {
    const accountId = this.accountId;
    return (<any>this.contract).getScore({ levelName, accountId });
  }

  setName(name: string): Promise<void> {
    if (
      name &&
      name != this.userName &&
      this.walletConnection &&
      this.walletConnection.isSignedIn()
    ) {
      this.userName = name;
      return (<any>this.contract).setName({ name });
    }
    return Promise.resolve();
  }

  async getName(): Promise<any> {
    if (this.userName) {
      return Promise.resolve(this.userName);
    }
    const accountId = this.accountId;
    return new Promise((resolve, reject) => {
      (<any>this.contract)
        .getName({ accountId })
        .then((res: string) => {
          if (res && res.match(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g)) {
            this.userName = 'Invalid username';
          } else {
            this.userName = res;
          }
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
}
