import { NearConnection } from './nearConnection';

export const loginout = (
  loginoutEl: HTMLElement,
  nearConnection: NearConnection
): void => {
  if (!nearConnection) return;
  if (nearConnection.walletConnection.isSignedIn()) {
    nearConnection.logout();
    loginoutEl.innerHTML = 'Login to NEAR wallet';
  } else {
    nearConnection.login();
    loginoutEl.innerHTML = 'Logout from NEAR wallet';
  }
};

export const initLoginLogout = (nearConnection: NearConnection) => {
  const loginoutEl: HTMLElement = document.getElementById('loginout');
  if (
    nearConnection &&
    nearConnection.walletConnection &&
    nearConnection.walletConnection.isSignedIn()
  ) {
    loginoutEl.innerHTML = 'Logout from NEAR wallet';
    nearConnection.getName().then((res) => {
      loginoutEl.innerHTML = `Logout from NEAR wallet`;
    });
  } else {
    loginoutEl.innerHTML = 'Login to NEAR wallet';
  }
  loginoutEl.addEventListener('click', () =>
    loginout(loginoutEl, nearConnection)
  );
};
