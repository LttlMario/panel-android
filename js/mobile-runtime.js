(() => {
  const capacitor = window.Capacitor;
  const isNative = Boolean(capacitor?.isNativePlatform?.());
  if (!isNative) return;

  document.documentElement.classList.add('native-app', 'native-android');
  const discordRedirect = 'discord-1531023771211792384:/authorize/callback';
  window.PANEL_MOBILE_REDIRECT_URI = 'https://lttlmario.github.io/panel-pro/login.html';
  window.PANEL_MOBILE_OAUTH_STATE = 'panel_android';

  const plugins = capacitor.Plugins || {};
  const securePreferences = plugins.SecureStorage;
  const app = plugins.App;
  const browser = plugins.Browser;
  const tokenKey = 'discord_access_token';
  const secureKeyPrefix = 'capacitor-storage_';
  const consumedCallbackKey = 'panel_consumed_oauth_callback';
  const pendingOAuthTokenKey = 'panel_pending_discord_oauth_token';
  const currentAppVersion = '1.0.6';
  const updateCheckKey = 'panel_android_update_last_check';
  const updateLaterKey = 'panel_android_update_later';
  let secureReady = false;

  const versionParts = (value) => String(value || '').replace(/^v/i, '').split(/[^0-9]+/).filter(Boolean).slice(0, 3).map(Number);
  const isNewerVersion = (candidate, current) => {
    const next = versionParts(candidate), installed = versionParts(current);
    for (let index = 0; index < 3; index += 1) {
      const difference = (next[index] || 0) - (installed[index] || 0);
      if (difference) return difference > 0;
    }
    return false;
  };

  function showUpdateNotice(release, apk) {
    document.getElementById('panel-android-update')?.remove();
    const overlay = document.createElement('section');
    overlay.id = 'panel-android-update';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `<div class="pau-dialog"><div class="pau-body"><div class="pau-icon">⬆️</div><h2>Actualizare nouă disponibilă</h2><p>Este disponibilă o versiune nouă a aplicației Panel. Poți instala acum sau poți amâna notificarea pentru 24 de ore.</p><div class="pau-version">Instalată: ${currentAppVersion} · Nouă: ${String(release.tag_name).replace(/^v/i, '')}</div></div><div class="pau-actions"><button type="button" class="pau-later">Mai târziu</button><button type="button" class="pau-install">Instalează acum</button></div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.pau-later').addEventListener('click', () => {
      localStorage.setItem(updateLaterKey, JSON.stringify({ tag: release.tag_name, until: Date.now() + 24 * 60 * 60 * 1000 }));
      overlay.remove();
    });
    overlay.querySelector('.pau-install').addEventListener('click', async () => {
      localStorage.setItem(updateLaterKey, JSON.stringify({ tag: release.tag_name, until: Date.now() + 60 * 60 * 1000 }));
      overlay.remove();
      if (browser?.open) await browser.open({ url: apk.browser_download_url });
      else window.location.href = apk.browser_download_url;
    });
  }

  async function checkForAppUpdate(force = false) {
    if (!document.body) return;
    const lastCheck = Number(localStorage.getItem(updateCheckKey) || 0);
    if (!force && Date.now() - lastCheck < 6 * 60 * 60 * 1000) return;
    localStorage.setItem(updateCheckKey, String(Date.now()));
    try {
      const response = await fetch('https://api.github.com/repos/LttlMario/panel-android/releases?per_page=10', { cache: 'no-store' });
      if (!response.ok) return;
      const releases = await response.json();
      const release = releases.find((item) => !item.draft && item.assets?.some((asset) => asset.name.toLowerCase().endsWith('.apk')));
      const apk = release?.assets?.find((asset) => asset.name.toLowerCase().endsWith('.apk'));
      if (!release || !apk || !isNewerVersion(release.tag_name, currentAppVersion)) return;
      let postponed = null;
      try { postponed = JSON.parse(localStorage.getItem(updateLaterKey) || 'null'); } catch (_) {}
      if (postponed?.tag === release.tag_name && Number(postponed.until) > Date.now()) return;
      showUpdateNotice(release, apk);
    } catch (error) {
      console.warn('Actualizările Android nu au putut fi verificate.', error);
    }
  }

  const secureStore = securePreferences ? {
    async getItem(key) {
      if (typeof securePreferences.getItem === 'function') {
        return securePreferences.getItem(key);
      }
      const result = await securePreferences.internalGetItem({
        prefixedKey: `${secureKeyPrefix}${key}`,
        sync: false
      });
      return result?.data ?? null;
    },
    async setItem(key, value) {
      if (typeof securePreferences.setItem === 'function') {
        return securePreferences.setItem(key, value);
      }
      return securePreferences.internalSetItem({
        prefixedKey: `${secureKeyPrefix}${key}`,
        data: String(value),
        sync: false
      });
    },
    async removeItem(key) {
      if (typeof securePreferences.removeItem === 'function') {
        return securePreferences.removeItem(key);
      }
      return securePreferences.internalRemoveItem({
        prefixedKey: `${secureKeyPrefix}${key}`,
        sync: false
      });
    }
  } : null;

  function handleDiscordCallback(url) {
    if (!url || !url.startsWith(discordRedirect)) return false;
    if (sessionStorage.getItem(consumedCallbackKey) === url) return false;
    const hashIndex = url.indexOf('#');
    const queryIndex = url.indexOf('?');
    const oauthPayload = hashIndex >= 0
      ? url.slice(hashIndex + 1)
      : queryIndex >= 0
        ? url.slice(queryIndex + 1)
        : '';
    const params = new URLSearchParams(oauthPayload);
    const accessToken = params.get('access_token');
    if (!accessToken) return false;
    sessionStorage.setItem(consumedCallbackKey, url);
    sessionStorage.setItem(pendingOAuthTokenKey, accessToken);
    browser?.close?.().catch(() => {});
    // Tokenul rămâne doar în memoria sesiunii, nu în URL. Parametrul forțează
    // reîncărcarea paginii chiar dacă WebView-ul se află deja pe login.html.
    window.location.replace('login.html?oauth_return=1');
    return true;
  }

  app?.addListener?.('appUrlOpen', ({ url }) => handleDiscordCallback(url));
  app?.getLaunchUrl?.().then(result => handleDiscordCallback(result?.url)).catch(() => {});

  async function restoreSecureToken() {
    if (!secureStore) return;
    try {
      const value = await secureStore.getItem(tokenKey);
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
    if (!secureStore || event?.key !== tokenKey) return;
    if (event.newValue) {
      secureStore.setItem(tokenKey, event.newValue).catch(console.warn);
    } else if (secureReady) {
      secureStore.removeItem(tokenKey).catch(console.warn);
    }
  }

  window.addEventListener('storage', persistTokenIfChanged);

  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  const originalClear = Storage.prototype.clear;
  Storage.prototype.setItem = function (key, value) {
    originalSetItem.call(this, key, value);
    if (this === localStorage && key === tokenKey && secureStore) {
      secureStore.setItem(key, String(value)).catch(console.warn);
    }
  };
  Storage.prototype.removeItem = function (key) {
    originalRemoveItem.call(this, key);
    if (this === localStorage && key === tokenKey && secureStore && secureReady) {
      secureStore.removeItem(key).catch(console.warn);
    }
  };
  Storage.prototype.clear = function () {
    const isAppStorage = this === localStorage;
    originalClear.call(this);
    if (isAppStorage && secureStore && secureReady) {
      secureStore.removeItem(tokenKey).catch(console.warn);
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
  app?.addListener?.('appStateChange', ({ isActive }) => { if (isActive) checkForAppUpdate(); });

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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => checkForAppUpdate(true), { once: true });
  else checkForAppUpdate(true);
})();
