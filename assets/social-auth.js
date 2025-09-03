// Real OAuth flows with PKCE helpers and redirect builders

(function () {
  function base64UrlEncode(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async function sha256(input) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(digest);
  }

  function randomString(length = 64) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => ('0' + b.toString(16)).slice(-2)).join('');
  }

  async function buildPkce() {
    const verifier = randomString(64);
    const challenge = await sha256(verifier);
    sessionStorage.setItem('pkce_verifier', verifier);
    return { verifier, challenge };
  }

  function getConfig(provider) {
    const cfg = window.SOCIAL_AUTH_CONFIG;
    if (!cfg || !cfg.providers || !cfg.providers[provider]) {
      throw new Error('Social auth provider not configured: ' + provider);
    }
    return cfg.providers[provider];
  }

  function ensureConfigured(provider) {
    if (!window.isProviderConfigured || !window.isProviderConfigured(provider)) {
      throw new Error(provider + ' is not configured.');
    }
  }

  async function loginWithGoogle() {
    ensureConfigured('google');
    const { challenge } = await buildPkce();
    const { clientId, redirectUri, scope } = getConfig('google');
    const state = randomString(24);
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      include_granted_scopes: 'true',
      access_type: 'offline',
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString();
  }

  async function loginWithMicrosoft() {
    ensureConfigured('microsoft');
    const { challenge } = await buildPkce();
    const { clientId, redirectUri, scope, tenant } = getConfig('microsoft');
    const state = randomString(24);
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: scope,
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });
    window.location.href = `https://login.microsoftonline.com/${tenant || 'common'}/oauth2/v2.0/authorize?` + params.toString();
  }

  async function loginWithApple() {
    ensureConfigured('apple');
    const { challenge } = await buildPkce();
    const { clientId, redirectUri, scope } = getConfig('apple');
    const state = randomString(24);
    sessionStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      response_mode: 'query',
      scope: scope,
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });
    // Apple endpoint
    window.location.href = 'https://appleid.apple.com/auth/authorize?' + params.toString();
  }

  function showOrHideProviderButtons() {
    ['google', 'apple', 'microsoft'].forEach((p) => {
      const btn = document.querySelector(`[data-social-button="${p}"]`);
      if (!btn) return;
      try {
        btn.style.display = window.isProviderConfigured(p) ? 'flex' : 'none';
      } catch (_) {
        btn.style.display = 'none';
      }
    });
  }

  // Expose
  window.RealSocialAuth = {
    loginWithGoogle,
    loginWithApple,
    loginWithMicrosoft,
    showOrHideProviderButtons
  };

  document.addEventListener('DOMContentLoaded', showOrHideProviderButtons);
})();


