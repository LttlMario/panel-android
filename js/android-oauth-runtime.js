(() => {
  const capacitor = window.Capacitor;
  if (!capacitor?.isNativePlatform?.()) return;

  // Android folosește același shell mobil ca panel-ios.
  document.documentElement.classList.add('panel-ios-device');
  document.documentElement.classList.add('panel-android-device');

  const app = capacitor.Plugins?.App;
  const callbackScheme = 'discord-1531023771211792384:/authorize/callback';
  const publicRedirect = 'https://lttlmario.github.io/panel-pro/login.html';
  const pendingTokenKey = 'panel_pending_discord_oauth_token';

  window.PANEL_ANDROID_REDIRECT_URI = publicRedirect;
  window.PANEL_ANDROID_OAUTH_STATE = 'panel_android';

  window.openPanelDiscordOAuth = async (url) => {
    // OAuth rămâne în WebView-ul aplicației; nu deschidem Custom Tab/browser extern.
    window.location.assign(url);
  };

  const handleCallback = async (url) => {
    if (!url || !url.startsWith(callbackScheme)) return false;
    const marker = url.includes('#') ? '#' : '?';
    const payload = url.includes(marker) ? url.slice(url.indexOf(marker) + 1) : '';
    const token = new URLSearchParams(payload).get('access_token');
    if (!token) return false;
    sessionStorage.setItem(pendingTokenKey, token);
    window.location.replace('login.html?oauth_return=1');
    return true;
  };

  app?.addListener?.('appUrlOpen', ({ url }) => handleCallback(url));
  app?.getLaunchUrl?.().then((result) => handleCallback(result?.url)).catch(() => {});
})();
