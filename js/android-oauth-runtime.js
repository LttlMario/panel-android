(() => {
  const capacitor = window.Capacitor;
  if (!capacitor?.isNativePlatform?.()) return;

  // Android folosește copia locală, curată, a aplicației panel-pro.
  document.documentElement.classList.add('panel-ios-device');
  document.documentElement.classList.add('panel-android-device');

  const mobileFooterStyle = document.createElement('style');
  mobileFooterStyle.textContent = `
    html.panel-android-device #panel-global-footer .pgf-android-badge,
    html.panel-android-device #panel-global-footer .pgf-ios-badge {
      display: none !important;
    }
  `;
  document.head.appendChild(mobileFooterStyle);

  // Discord revine pe callback-ul public, iar MainActivity îl rescrie
  // înapoi către login.html local înainte ca WebView-ul să părăsească aplicația.
  window.PANEL_ANDROID_REDIRECT_URI = 'https://lttlmario.github.io/panel-pro/login.html';
})();
