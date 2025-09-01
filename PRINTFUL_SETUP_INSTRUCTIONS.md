# 🎯 Printful Integration Setup Instructions

## ✅ **System Configured For:**
- **Service**: Printful (Premium quality, excellent Shopify integration)
- **Markup**: 100% (Double your costs for healthy profit margins)
- **Safety**: Test mode enabled (No actual orders until you're ready)

## 💰 **Your New Profit Margins (100% Markup)**

| Product | Size | Printful Cost | Your Price | **Your Profit** |
|---------|------|---------------|------------|-----------------|
| Canvas | A4 (8.3"×11.7") | $21.50 | $43.00 | **$21.50** |
| Canvas | 18"×24" | $49.50 | $99.00 | **$49.50** |
| Canvas | 24"×36" | $71.50 | $143.00 | **$71.50** |
| Poster | A4 | $14.50 | $29.00 | **$14.50** |
| Metal | 18"×24" | $85.50 | $171.00 | **$85.50** |
| Framed | 24"×36" | $143.00 | $286.00 | **$143.00** |

*These margins give you plenty of room for taxes, fees, and profit!*

## 🔑 **Step 1: Get Your Printful API Key**

1. **Go to Printful Dashboard**: https://www.printful.com/dashboard
2. **Navigate to**: Settings → API
3. **Create new API key** or copy existing one
4. **Copy the API key** - you'll need this in Step 2

## 📝 **Step 2: Insert Your Credentials**

**Open this file in your code editor:**
```
assets/printful-credentials.js
```

**Find this line:**
```javascript
api_key: "YOUR_PRINTFUL_API_KEY_HERE",
```

**Replace with your actual API key:**
```javascript
api_key: "pk_live_your_actual_api_key_here",
```

**Example:**
```javascript
api_key: "pk_live_abcd1234efgh5678ijkl9012mnop3456",
```

## ⚠️ **IMPORTANT SAFETY SETTINGS**

**Keep this setting as `true` until we finish testing:**
```javascript
test_mode: true, // KEEP THIS TRUE until we test everything!
```

When `test_mode` is true:
- ✅ No actual orders are sent to Printful
- ✅ No charges occur
- ✅ You can test the full interface safely
- ✅ Mockups and pricing work normally

## 🔒 **Security Note**

**DO NOT commit your real API key to GitHub!**

The credentials file is set up to be safe for development, but:
- Use placeholder values when committing to GitHub
- Only put real credentials when deploying to your live store
- Consider using Shopify's environment variables in production

## 🚀 **Step 3: Deploy & Test**

Once you've added your API key:

```bash
.\quick-deploy.bat
```

This will:
1. Deploy your updated credentials
2. Upload to Shopify
3. Ready for testing!

## 🧪 **Step 4: Test the Integration**

### **Safe Testing Process:**
1. **Visit your product page**
2. **Upload a photo** to Piccatso
3. **Generate AI art** in your preferred style
4. **Look for POD interface** - should appear automatically
5. **Select product type** (Canvas, Poster, Metal, Framed)
6. **Choose size** - pricing should show with 100% markup
7. **View mockups** - should generate environment previews
8. **Add to cart** - should work with all specifications saved

### **What to Verify:**
- ✅ POD interface appears after Piccatso style selection
- ✅ All 4 product types show (Canvas, Poster, Metal, Framed)
- ✅ Pricing shows 100% markup (double the base cost)
- ✅ Mockups generate for different room environments
- ✅ Add to cart works with all product specifications
- ✅ No actual orders are sent (test_mode: true)

## 🔧 **Advanced Configuration (Optional)**

### **If you have Printful's Shopify App:**
```javascript
shopify_integration: {
  enabled: true, // Change to true
  sync_products: true // Change to true for automatic sync
}
```

### **Custom Webhook URL:**
```javascript
webhook_url: "https://your-actual-store.myshopify.com/webhooks/printful",
```

## 🎯 **Next Steps After Testing**

Once testing is complete and everything works:

### **Step 1: Enable Live Mode**
```javascript
test_mode: false, // Change to false for live orders
```

### **Step 2: Set Up Webhooks**
I'll help you configure:
- Order webhooks (Shopify → Printful)
- Status webhooks (Printful → Shopify)
- Tracking webhooks (automatic customer updates)

### **Step 3: Configure Product Catalog**
We'll set up the actual Printful product IDs and variant IDs for:
- Canvas prints (6 sizes)
- Poster prints (6 sizes) 
- Metal prints (6 sizes)
- Framed prints (6 sizes)

## 📊 **Expected Customer Flow**

1. **Customer uploads photo** → Piccatso generates AI art styles
2. **Customer selects style** → POD interface appears automatically
3. **Customer chooses format** → Canvas/Poster/Metal/Framed options
4. **Customer selects size** → 6 size options with clear pricing
5. **Customer views mockups** → Sees art in living room, bedroom, office, gallery
6. **Customer adds to cart** → All specifications saved for fulfillment
7. **Customer checks out** → Standard Shopify checkout process
8. **Order auto-fulfills** → Sent to Printful automatically
9. **Customer gets tracking** → Automatic updates via webhooks

## 🆘 **Troubleshooting**

### **POD Interface Doesn't Appear:**
- Check browser console for errors
- Verify API key is correctly formatted
- Ensure credentials file is loading

### **Pricing Looks Wrong:**
- Verify 100% markup is applied (price = cost × 2)
- Check base costs in the configuration

### **Mockups Don't Generate:**
- Verify API key has mockup permissions
- Check image URL is accessible
- Test with different image formats

## 📞 **Ready for Next Steps?**

Once you've:
1. ✅ Added your Printful API key
2. ✅ Deployed the changes  
3. ✅ Tested the interface
4. ✅ Verified pricing and mockups work

Let me know and I'll help you:
- Set up the webhook automation
- Configure the actual product catalog
- Enable live order processing
- Set up tracking notifications

**The foundation is ready - just need your API key to activate it!**
