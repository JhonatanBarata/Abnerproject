(function () {
  const PLACEHOLDER_API_URL = 'COLOCAR_AQUI_URL_DO_BACKEND_HBX';

  function getConfig() {
    return window.HBX_WEBSITE_CONFIG || {};
  }

  function getStorage() {
    try {
      return window.sessionStorage;
    } catch (error) {
      console.error('Sessao do navegador indisponivel:', error);
      return null;
    }
  }

  function setAuthState(state) {
    document.documentElement.setAttribute('data-admin-auth', state);
  }

  function ensureApiUrlConfigured() {
    const config = getConfig();
    if (!config.apiUrl || config.apiUrl === PLACEHOLDER_API_URL) {
      throw new Error('HBX_API_URL nao configurado. Ajuste hbx-config.js ou hbx-config.local.js.');
    }
  }

  function getSessionToken() {
    const config = getConfig();
    const storage = getStorage();
    return storage ? storage.getItem(config.sessionStorageKey) : '';
  }

  function saveSession(sessionToken) {
    const config = getConfig();
    const storage = getStorage();
    if (!storage) {
      throw new Error('SessionStorage indisponivel.');
    }

    storage.setItem(config.sessionStorageKey, sessionToken);
  }

  function clearSession() {
    const config = getConfig();
    const storage = getStorage();
    if (storage) {
      storage.removeItem(config.sessionStorageKey);
    }
  }

  async function postJson(url, payload) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      cache: 'no-store',
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.message || `Falha HTTP ${response.status}`);
    }

    if (data && (data.ok === false || data.valid === false)) {
      throw new Error(data.error || data.message || 'Sessao HBX recusada.');
    }

    return data;
  }

  function buildPath(targetPath) {
    return new URL(targetPath, window.location.origin).toString();
  }

  function redirectToDenied(reason) {
    const config = getConfig();
    const targetUrl = new URL(config.accessDeniedPath || '/acesso-negado.html', window.location.origin);

    if (reason) {
      targetUrl.searchParams.set('reason', reason);
    }

    clearSession();
    window.location.replace(targetUrl.toString());
  }

  function redirectToPublicHome() {
    window.location.replace(buildPath('/index.html'));
  }

  async function exchangeEntryToken(entryToken) {
    ensureApiUrlConfigured();

    if (!entryToken) {
      throw new Error('Parametro hbx_entry ausente.');
    }

    const config = getConfig();
    const data = await postJson(config.exchangeUrl, { entryToken });
    const sessionToken = data.sessionToken || data.data?.sessionToken;

    if (!sessionToken) {
      throw new Error('HBX nao retornou sessionToken.');
    }

    saveSession(sessionToken);
    return data;
  }

  async function verifySessionToken(sessionToken) {
    ensureApiUrlConfigured();

    if (!sessionToken) {
      throw new Error('Sessao HBX ausente.');
    }

    const config = getConfig();
    const data = await postJson(config.verifyUrl, { sessionToken });
    const refreshedSessionToken = data.sessionToken || data.data?.sessionToken;

    if (refreshedSessionToken && refreshedSessionToken !== sessionToken) {
      saveSession(refreshedSessionToken);
    }

    return data;
  }

  async function processEntryPage() {
    setAuthState('pending');

    try {
      const config = getConfig();
      const entryToken = new URLSearchParams(window.location.search).get('hbx_entry');
      await exchangeEntryToken(entryToken);
      window.location.replace(buildPath(config.adminPagePath || '/admin.html'));
    } catch (error) {
      console.error('Falha ao trocar token HBX:', error);
      redirectToDenied(error.message);
    }
  }

  async function guardAdminPage() {
    setAuthState('pending');

    try {
      const sessionToken = getSessionToken();
      const data = await verifySessionToken(sessionToken);
      window.__HBX_ADMIN_VERIFIED__ = true;
      setAuthState('verified');
      window.dispatchEvent(new CustomEvent('hbx-admin-auth-ready', { detail: data }));
      return data;
    } catch (error) {
      console.error('Falha ao validar sessao HBX:', error);
      setAuthState('denied');
      redirectToDenied(error.message);
      throw error;
    }
  }

  window.HBXAdminAuth = {
    clearSession,
    exchangeEntryToken,
    getConfig,
    getSessionToken,
    guardAdminPage,
    processEntryPage,
    redirectToDenied,
    redirectToPublicHome,
    saveSession,
    verifySessionToken
  };
})();