// Subscription Product URLs Configuration
// Replace these with your actual subscription product URLs from Shopify Admin

window.PiccatsoSubscriptionConfig = {
  subscriptionUrls: {
    premium: '/products/premium-subscription', // Replace with your actual Premium subscription product URL
    pro: '/products/pro-subscription' // Replace with your actual Pro subscription product URL
  },
  
  // Alternative: If you want to use product IDs instead of URLs
  subscriptionProducts: {
    premium: {
      productId: 'YOUR_PREMIUM_PRODUCT_ID', // Replace with your actual product ID
      variantId: 'YOUR_PREMIUM_VARIANT_ID'  // Replace with your actual variant ID
    },
    pro: {
      productId: 'YOUR_PRO_PRODUCT_ID',     // Replace with your actual product ID
      variantId: 'YOUR_PRO_VARIANT_ID'      // Replace with your actual variant ID
    }
  },
  
  // Instructions for finding your product URLs/IDs:
  instructions: {
    findingUrls: [
      "1. Go to Shopify Admin → Products",
      "2. Find your subscription products",
      "3. Click on each product",
      "4. Copy the URL from the browser address bar",
      "5. Replace the URLs in this file"
    ],
    findingIds: [
      "1. Go to Shopify Admin → Products", 
      "2. Find your subscription products",
      "3. Click on each product",
      "4. Look at the URL: /admin/products/PRODUCT_ID",
      "5. For variants, go to the Variants section and copy the variant ID"
    ]
  }
};
