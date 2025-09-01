# 🎨 Piccatso Print-on-Demand Integration Setup Guide

## 🎯 Overview

This guide will help you set up the complete print-on-demand integration for your Piccatso AI art store. The system automatically generates mockups, calculates pricing with 40%+ markup, and handles order fulfillment.

## 📋 What You've Got

### ✅ **Completed Components**
- **POD Integration JavaScript** (`pod-integration.js`) - Core API integration
- **Modern UI Interface** (`pod-interface.liquid` + `pod-ui.css`) - Customer-facing interface
- **Webhook Handler** (`pod-webhook-handler.js`) - Order processing automation
- **Configuration System** (`pod-settings.json`) - Centralized settings
- **Product Page Integration** - Seamlessly integrated with existing Piccatso workflow

### 🔧 **Key Features Built**
1. **Multi-Product Support**: Canvas, Poster, Metal, Framed prints
2. **6 Size Options**: A4, A3, A2, 12"×16", 18"×24", 24"×36"
3. **Environment Mockups**: Living room, bedroom, office, gallery
4. **Automatic Pricing**: 40%+ markup over base costs
5. **Real-time Integration**: Connects with Piccatso AI generation
6. **Order Automation**: Webhook-based fulfillment

## 🚀 **Setup Steps**

### **Step 1: Choose Your POD Service**

**Recommended: Printful** (Best for quality + Shopify integration)

**Alternative Options:**
- **Printify** (Multiple suppliers, competitive pricing)
- **Gooten** (Premium quality, global fulfillment)

### **Step 2: Get Your API Credentials**

I need the following from you:

#### **For Printful:**
- **API Key** (from Printful Dashboard → Settings → API)
- **Store ID** (if using Printful's Shopify integration)

#### **For Printify:**
- **API Token** (from Printify → My Account → API Tokens)
- **Shop ID** (from your connected Shopify store)

#### **For Gooten:**
- **API Key** (from Gooten Dashboard → API Settings)

### **Step 3: Configure Webhook URLs**

You'll need to set up webhooks for:
1. **Shopify → POD Service** (order creation)
2. **POD Service → Your Store** (fulfillment updates)

**Webhook URLs needed:**
- `https://your-store.myshopify.com/webhooks/orders/paid`
- `https://your-store.myshopify.com/webhooks/pod/status`

## ⚙️ **Configuration Required**

### **1. Update API Settings**

Edit `config/pod-settings.json`:

```json
{
  "pod_integration": {
    "service": "printful", // or "printify", "gooten"
    "api_settings": {
      "api_key": "YOUR_ACTUAL_API_KEY_HERE",
      "webhook_url": "https://your-store.myshopify.com/webhooks/pod",
      "test_mode": false // Set to false for production
    }
  }
}
```

### **2. Update Product/Variant IDs**

You'll need to get the actual product and variant IDs from your chosen POD service:

**For Printful:**
1. Go to Printful Dashboard → Products
2. Find your desired products (Canvas, Poster, etc.)
3. Note down the Product IDs and Variant IDs for each size
4. Update the IDs in `pod-integration.js` and `pod-settings.json`

### **3. Verify Pricing**

Update the base costs in `pod-settings.json` with actual costs from your POD service:

```json
"variants": {
  "a4": { "variant_id": 5678, "base_cost": 21.50 },
  "a3": { "variant_id": 5679, "base_cost": 28.50 }
}
```

The system automatically adds 40% markup to these base costs.

## 🔗 **Integration Points**

### **Current Workflow:**
1. Customer uploads photo → Piccatso generates art styles
2. Customer selects style → **NEW: POD interface appears**
3. Customer chooses print options → Sees mockups & pricing
4. Customer adds to cart → Order includes POD specifications
5. Order is placed → **NEW: Automatically sent to POD service**
6. POD fulfills order → **NEW: Customer gets tracking info**

### **Integration with Existing Piccatso:**
- The POD interface appears after Piccatso style selection
- Uses the generated AI art image URL for mockups
- Preserves all existing Piccatso metadata
- Integrates with your existing cart/checkout flow

## 📱 **User Experience Flow**

### **Customer Journey:**
1. **Upload Photo** → Piccatso AI generates styles
2. **Select Style** → POD interface slides into view
3. **Choose Product Type** → Canvas, Poster, Metal, or Framed
4. **Select Size** → 6 size options with pricing
5. **View Mockups** → See art in different room environments
6. **Add to Cart** → All specifications saved
7. **Checkout** → Standard Shopify checkout
8. **Automatic Fulfillment** → POD service prints & ships

## 💰 **Pricing Strategy**

### **Markup Calculation:**
- **Base Cost** (from POD service): $21.50
- **Markup** (40%): $8.60
- **Customer Price**: $30.10 (rounded up to $30.99)

### **Example Pricing:**
| Product | Size | Base Cost | Customer Price | Profit |
|---------|------|-----------|----------------|--------|
| Canvas | A4 | $21.50 | $30.99 | $9.49 |
| Canvas | A3 | $28.50 | $40.99 | $12.49 |
| Poster | A4 | $14.25 | $20.99 | $6.74 |
| Metal | A4 | $35.70 | $50.99 | $15.29 |

## 🛠 **Technical Implementation**

### **Files Added/Modified:**
- ✅ `assets/pod-integration.js` - Core POD API integration
- ✅ `assets/pod-ui.css` - UI styling for POD interface
- ✅ `assets/pod-webhook-handler.js` - Order processing automation
- ✅ `snippets/pod-interface.liquid` - Customer interface
- ✅ `sections/main-product.liquid` - Integration with product page
- ✅ `config/pod-settings.json` - Configuration settings

### **Dependencies:**
- Existing Piccatso app integration
- Shopify cart system
- Your chosen POD service API

## 🚦 **Testing Checklist**

### **Before Going Live:**
- [ ] Test API connection to POD service
- [ ] Verify product/variant IDs are correct
- [ ] Test mockup generation with sample images
- [ ] Verify pricing calculations (40%+ markup)
- [ ] Test complete order flow in test mode
- [ ] Verify webhook endpoints are working
- [ ] Test order fulfillment with POD service

### **End-to-End Test:**
1. Upload test image to Piccatso
2. Generate AI art style
3. Select POD options (type, size)
4. Verify mockups appear correctly
5. Check pricing is accurate
6. Add to cart and place test order
7. Verify order appears in POD service dashboard
8. Confirm fulfillment tracking works

## 🔐 **Security & Compliance**

### **API Key Security:**
- Store API keys securely (not in client-side code)
- Use environment variables or Shopify app settings
- Enable webhook signature verification

### **Image Handling:**
- Ensure customer images are processed securely
- Comply with privacy regulations (GDPR, CCPA)
- Implement proper image storage and cleanup

## 📊 **Analytics & Monitoring**

### **Key Metrics to Track:**
- POD conversion rate (style selection → POD order)
- Average order value with POD items
- POD fulfillment success rate
- Customer satisfaction with print quality
- Profit margins by product type

### **Error Monitoring:**
- API connection failures
- Mockup generation errors
- Order processing failures
- Webhook delivery issues

## 🚀 **Deployment**

Ready to deploy? Run:

```bash
.\quick-deploy.bat
```

This will:
1. Commit all POD integration files
2. Push to GitHub
3. Create deployment ZIP for Shopify

## 🆘 **Support & Troubleshooting**

### **Common Issues:**
1. **Mockups not generating** → Check API key and product IDs
2. **Pricing incorrect** → Verify base costs in config
3. **Orders not forwarding** → Check webhook URLs
4. **Images not displaying** → Verify image URL accessibility

### **Need Help?**
- Check POD service documentation
- Test API endpoints manually
- Review webhook logs
- Contact POD service support

## 🎉 **Next Steps**

Once you provide the API credentials, I can:
1. Update the configuration with real values
2. Test the integration with your POD service
3. Help you set up webhooks
4. Walk through the complete testing process
5. Deploy the live integration

**Ready to proceed? Please provide:**
1. Your preferred POD service (Printful recommended)
2. API credentials for that service
3. Any specific product requirements or customizations
