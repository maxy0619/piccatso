// Social Auth configuration
// IMPORTANT: Replace the placeholders with your real OAuth app credentials and callback URLs.
// We do NOT simulate accounts; these are real OAuth redirects to your provider(s).

window.SOCIAL_AUTH_CONFIG = {
  // Global toggle - DISABLED: Using Shopify native customer accounts only
  enabled: false,

  // All social authentication is disabled - using Shopify's built-in system
  backendCallbackBaseUrl: "",

  // Page to return users to on success
  postLoginRedirect: "/pages/account",

  // Providers - All disabled
  providers: {
    google: {
      enabled: false,
      clientId: "",
      redirectUri: "",
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
      scope: "openid email profile offline_access",
      tenant: "common"
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


