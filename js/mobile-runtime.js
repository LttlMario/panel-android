(() => {
  const capacitor = window.Capacitor;
  const isNative = Boolean(capacitor?.isNativePlatform?.());
  if (!isNative) return;

  document.documentElement.classList.add('native-app', 'native-android');
  window.PANEL_MOBILE_REDIRECT_URI = 'https://panel.local/login.html';

  const plugins = capacitor.Plugins || {};
  const securePreferences = plugins.SecureStorage;
  const app = plugins.App;
  const tokenKey = 'discord_access_token';
  let secureReady = false;

  async function restoreSecureToken() {
    if (!securePreferences) return;
    try {
      const value = await securePreferences.getItem(tokenKey);
      if (value && !localStorage.getItem(tokenKey)) {
        localStorage.setItem(tokenKey, value);
      }
      secureReady = true;
      window.dispatchEvent(new CustomEvent('panel:secure-storage-ready'));
    } catch (error) {
      console.warn('Tokenul securizat nu a putut fi restaurat.', error);
    }
  }

  function persistTokenIfChanged(event) {
    if (!securePreferences || event?.key !== tokenKey) return;
    if (event.newValue) {
      securePreferences.setItem(tokenKey, event.newValue).catch(console.warn);
    } else if (secureReady) {
      securePreferences.removeItem(tokenKey).catch(console.warn);
    }
  }

  window.addEventListener('storage', persistTokenIfChanged);

  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  const originalClear = Storage.prototype.clear;
  Storage.prototype.setItem = function (key, value) {
    originalSetItem.call(this, key, value);
    if (this === localStorage && key === tokenKey && securePreferences) {
      securePreferences.setItem(key, String(value)).catch(console.warn);
    }
  };
  Storage.prototype.removeItem = function (key) {
    originalRemoveItem.call(this, key);
    if (this === localStorage && key === tokenKey && securePreferences && secureReady) {
      securePreferences.removeItem(key).catch(console.warn);
    }
  };
  Storage.prototype.clear = function () {
    const isAppStorage = this === localStorage;
    originalClear.call(this);
    if (isAppStorage && securePreferences && secureReady) {
      securePreferences.removeItem(tokenKey).catch(console.warn);
    }
  };

  app?.addListener?.('backButton', ({ canGoBack }) => {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('-translate-x-full')) {
      window.closeMobileMenu?.();
      return;
    }
    if (canGoBack && history.length > 1) history.back();
    else app.exitApp();
  });

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href) && !href.startsWith(location.origin)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  }, true);

  restoreSecureToken();
})();
