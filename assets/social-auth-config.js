// Social Auth configuration
// IMPORTANT: Replace the placeholders with your real OAuth app credentials and callback URLs.
// We do NOT simulate accounts; these are real OAuth redirects to your provider(s).

window.SOCIAL_AUTH_CONFIG = {
  // Global toggle
  enabled: true,

  // Where your server handles the OAuth callback and exchanges code -> tokens.
  // This should be an HTTPS endpoint you control (could be a serverless function).
  // Example: https://api.yourdomain.com/auth/callback
  backendCallbackBaseUrl: "",

  // Page to return users to on success (after your backend finishes the exchange and sets a session)
  postLoginRedirect: "/pages/account",

  // Providers
  providers: {
    google: {
      enabled: false,
      clientId: "",
      // This must be whitelisted in the Google Cloud Console
      redirectUri: "",
      // Space-separated scopes
      scope: "openid email profile",
    },
    apple: {
      enabled: false,
      clientId: "",
      redirectUri: "",
      scope: "name email",
    },
    microsoft: {
      enabled: false,
      clientId: "",
      redirectUri: "",
      // Use v2 endpoint scopes
      scope: "openid email profile offline_access",
      tenant: "common" // or your tenant ID
    }
  }
};

// Helper
window.isProviderConfigured = function(provider) {
  try {
    const p = window.SOCIAL_AUTH_CONFIG?.providers?.[provider];
    return (
      !!window.SOCIAL_AUTH_CONFIG?.enabled &&
      !!p?.enabled &&
      typeof p.clientId === "string" && p.clientId.length > 0 &&
      typeof p.redirectUri === "string" && p.redirectUri.length > 0
    );
  } catch (_) {
    return false;
  }
};


