// Shopify Subscription App Configuration
// This configuration works with the Shopify Subscription App widget system

window.PiccatsoSubscriptionConfig = {
  // Subscription Management URL from Shopify Subscription App
  // Replace this with your actual subscription management URL from the app
  subscriptionManagementUrl: 'https://shopify.com/69813403798/account/pages/6971b1a1-27f6-4c27-b8b0-3009fd3b921d',
  
  // Subscription product URLs (for direct product page access)
  subscriptionUrls: {
    premium: '/products/premium-subscription', // Replace with your actual Premium subscription product URL
    pro: '/products/pro-subscription' // Replace with your actual Pro subscription product URL
  },
  
  // Widget Configuration
  widget: {
    enabled: true,
    selector: '.subscriptions_app_embed_block'
  },
  
  // Instructions for setup:
  instructions: {
    subscriptionManagementUrl: [
      "1. Go to your Shopify Subscription App",
      "2. Find the 'Subscription management URL' section",
      "3. Copy the URL provided",
      "4. Replace the subscriptionManagementUrl in this file"
    ],
    productUrls: [
      "1. Go to Shopify Admin → Products",
      "2. Find your subscription products",
      "3. Click on each product",
      "4. Copy the URL from the browser address bar",
      "5. Replace the URLs in subscriptionUrls object"
    ],
    widgetSetup: [
      "1. The subscription widget is automatically added to product pages",
      "2. Make sure your subscription app is properly configured",
      "3. Test the widget on your subscription product pages"
    ]
  }
};
