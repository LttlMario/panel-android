(() => {
  const capacitor = window.Capacitor;
  if (!capacitor?.isNativePlatform?.()) return;

  // Android folosește aceeași aplicație web locală ca iOS.
  document.documentElement.classList.add('panel-ios-device');
  document.documentElement.classList.add('panel-android-device');
  sessionStorage.removeItem('panel_pending_discord_oauth_token');

  // Discord revine pe callback-ul public, iar MainActivity îl rescrie
  // înapoi către login.html local înainte ca WebView-ul să părăsească aplicația.
  window.PANEL_ANDROID_REDIRECT_URI = 'https://lttlmario.github.io/panel-pro/login.html';
})();
