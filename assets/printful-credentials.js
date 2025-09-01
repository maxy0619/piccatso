/**
 * Printful API Credentials Configuration
 * 
 * IMPORTANT: This file contains sensitive credentials.
 * - Do NOT commit this file to GitHub with real credentials
 * - Use environment variables or Shopify app settings in production
 * - Keep test_mode: true until ready for live orders
 */

window.PrintfulCredentials = {
  // ===========================================
  // INSERT YOUR PRINTFUL CREDENTIALS HERE:
  // ===========================================
  
  api_key: "YOUR_PRINTFUL_API_KEY_HERE", // Get from: https://www.printful.com/dashboard/store → API
  
  store_id: "YOUR_STORE_ID_HERE", // Optional: Get from Printful dashboard if using store integration
  
  // ===========================================
  // WEBHOOK SETTINGS (I'll help you set these up)
  // ===========================================
  
  webhook_url: "https://your-store.myshopify.com/webhooks/printful", // We'll configure this together
  
  webhook_secret: "YOUR_WEBHOOK_SECRET", // Generated when setting up webhooks
  
  // ===========================================
  // SAFETY SETTINGS
  // ===========================================
  
  test_mode: true, // KEEP THIS TRUE until we test everything!
  
  // ===========================================
  // PRINTFUL SPECIFIC SETTINGS
  // ===========================================
  
  endpoints: {
    base_url: "https://api.printful.com",
    store_products: "/store/products",
    mockup_generator: "/mockup-generator/create-task",
    orders: "/orders",
    webhooks: "/webhooks"
  },
  
  // Default settings
  default_currency: "USD",
  markup_percentage: 100, // 100% markup as requested
  
  // Printful store integration (if you connected your Shopify store to Printful)
  shopify_integration: {
    enabled: false, // Set to true if using Printful's Shopify app
    sync_products: false // Set to true to sync products automatically
  }
};

// ===========================================
// VALIDATION (Don't modify this part)
// ===========================================

// Check if credentials are configured
window.PrintfulCredentials.isConfigured = function() {
  return this.api_key !== "YOUR_PRINTFUL_API_KEY_HERE" && 
         this.api_key.length > 10;
};

// Get headers for API requests
window.PrintfulCredentials.getHeaders = function() {
  return {
    'Authorization': `Bearer ${this.api_key}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Piccatso-Shopify-Integration/1.0'
  };
};

// Log configuration status (for debugging)
console.log('Printful Integration Status:', {
  configured: window.PrintfulCredentials.isConfigured(),
  test_mode: window.PrintfulCredentials.test_mode,
  markup: window.PrintfulCredentials.markup_percentage + '%'
});
