# 🎯 Subscription System Setup Guide

## 📋 **What I've Implemented**

### **1. Enhanced Subscription Management Modal**
- ✅ **Comprehensive subscription popup** with current plan display
- ✅ **Upgrade/Downgrade options** with clear visual indicators
- ✅ **Action descriptions** explaining what will happen
- ✅ **Shopify checkout integration** for upgrades
- ✅ **Billing period logic** for downgrades

### **2. Shopify Native Integration**
- ✅ **Cart API integration** using `/cart/add.js`
- ✅ **Checkout redirect** to Shopify's standard checkout
- ✅ **Line item properties** for subscription tracking
- ✅ **Customer ID tracking** for post-purchase processing

### **3. Subscription Product Configuration**
- ✅ **Product ID configuration** in `config/subscription-products.json`
- ✅ **Easy product ID updates** without code changes
- ✅ **Feature descriptions** for each tier

## 🔧 **Setup Steps Required**

### **Step 1: Update Product IDs**
1. **Open** `config/subscription-products.json`
2. **Replace** the placeholder IDs with your actual Shopify product IDs:
   ```json
   "premium": {
     "product_id": "YOUR_ACTUAL_PREMIUM_PRODUCT_ID",
     "variant_id": "YOUR_ACTUAL_PREMIUM_VARIANT_ID"
   }
   ```

### **Step 2: Get Your Product IDs**
1. **Go to** Shopify Admin → Products
2. **Find** your subscription products
3. **Click** on each product
4. **Copy** the Product ID from the URL (e.g., `1234567890`)
5. **Go to** the Variants section
6. **Copy** the Variant ID for the subscription variant

### **Step 3: Update the Dashboard Code**
1. **Open** `snippets/account-dashboard.liquid`
2. **Find** the `subscriptionProducts` object (around line 2329)
3. **Replace** the placeholder IDs with your actual IDs:
   ```javascript
   const subscriptionProducts = {
     premium: {
       productId: 'YOUR_ACTUAL_PREMIUM_PRODUCT_ID',
       variantId: 'YOUR_ACTUAL_PREMIUM_VARIANT_ID'
     },
     pro: {
       productId: 'YOUR_ACTUAL_PRO_PRODUCT_ID', 
       variantId: 'YOUR_ACTUAL_PRO_VARIANT_ID'
     }
   };
   ```

## 🎯 **How It Works**

### **Upgrade Flow:**
1. **User clicks** "Manage Subscription" in account dashboard
2. **Selects** a higher tier plan
3. **Clicks** "Upgrade Now"
4. **System adds** subscription product to cart with properties
5. **Redirects** to Shopify checkout
6. **After payment** → Customer gets new tier immediately

### **Downgrade Flow:**
1. **User selects** Free tier (downgrade)
2. **System schedules** downgrade for next billing period
3. **Current subscription** remains active until billing date
4. **After billing date** → Customer moves to Free tier

### **Post-Purchase Processing:**
1. **Shopify webhook** triggers on successful payment
2. **System updates** customer metafields with new tier
3. **Email notification** sent to customer
4. **Customer redirected** back to account dashboard

## 📧 **Email Notifications Setup**

### **Required Webhooks:**
1. **Order paid** webhook → Update customer tier
2. **Subscription created** webhook → Send welcome email
3. **Subscription updated** webhook → Send change notification

### **Webhook Endpoints:**
```
POST /webhooks/order-paid
POST /webhooks/subscription-created  
POST /webhooks/subscription-updated
```

## 🔍 **Testing the System**

### **Test Upgrade Flow:**
1. **Login** as a Free tier customer
2. **Go to** account dashboard
3. **Click** "Manage Subscription"
4. **Select** Premium or Pro tier
5. **Click** "Upgrade Now"
6. **Verify** redirect to checkout
7. **Complete** test payment
8. **Check** customer tier updated

### **Test Downgrade Flow:**
1. **Login** as Premium/Pro customer
2. **Go to** account dashboard
3. **Click** "Manage Subscription"
4. **Select** Free tier
5. **Click** "Schedule Downgrade"
6. **Verify** downgrade scheduled message

## 🛠 **Admin Management**

### **Customer Metafields:**
The system uses these customer metafields:
- `subscription_tier` - Current tier (free, premium, pro)
- `subscription_status` - Active, cancelled, pending
- `subscription_start_date` - When subscription began
- `subscription_next_billing` - Next billing date
- `subscription_scheduled_changes` - Pending tier changes

### **Admin Actions:**
- **Change customer tier** via Shopify Admin
- **View subscription history** in customer profile
- **Manage billing** through subscription app
- **Send notifications** manually if needed

## 🚨 **Important Notes**

### **Product ID Format:**
- **Use numeric IDs** (e.g., `1234567890`)
- **NOT GID format** (e.g., `gid://shopify/Product/1234567890`)

### **Variant ID Format:**
- **Use numeric IDs** (e.g., `9876543210`)
- **NOT GID format** (e.g., `gid://shopify/ProductVariant/9876543210`)

### **Subscription App Integration:**
- **Ensure** your Shopify subscription app is properly configured
- **Test** the subscription creation flow
- **Verify** webhook endpoints are working

## 🔄 **Next Steps**

1. **Update product IDs** in the configuration
2. **Test the upgrade flow** with a test customer
3. **Set up webhooks** for post-purchase processing
4. **Configure email notifications**
5. **Test the complete flow** end-to-end

## 📞 **Support**

If you need help with:
- **Finding product IDs** in Shopify Admin
- **Setting up webhooks**
- **Configuring email notifications**
- **Testing the subscription flow**

Just let me know and I'll help you through each step!
