(function () {
  const fallbackConfig = {
    apiUrl: 'https://hbx-1.onrender.com',
    adminEntryRoute: '/admin-entry',
    adminPagePath: '/admin.html',
    accessDeniedPath: '/acesso-negado.html',
    sessionStorageKey: 'hbx_website_admin_session'
  };

  const localConfig = window.__HBX_CONFIG__;
  const mergedConfig = {
    ...fallbackConfig,
    ...(localConfig && typeof localConfig === 'object' ? localConfig : {})
  };

  mergedConfig.apiUrl = String(mergedConfig.apiUrl || '').replace(/\/+$/, '');
  mergedConfig.exchangeUrl = mergedConfig.apiUrl
    ? `${mergedConfig.apiUrl}/website/admin/exchange`
    : '';
  mergedConfig.verifyUrl = mergedConfig.apiUrl
    ? `${mergedConfig.apiUrl}/website/admin/verify`
    : '';

  window.HBX_WEBSITE_CONFIG = mergedConfig;
})();