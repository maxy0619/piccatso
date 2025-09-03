# 🎨 Piccatso Subscription Tiers & Features

## Overview
This document outlines the subscription model for Piccatso AI Art Platform. Edit any section below to customize the tiers, pricing, and features according to your business strategy.


---

## 🆓 FREE TIER
**Price:** $0/month  
**Target Audience:** First-time users, casual creators

### AI Generation Limits
- **Monthly Generations:** 10 per month per IP address (account-based if logged in)
- **Available Styles:** All styles available
- **Resolution:** Standard (512 x 512px preview)
- **Download Quality:** Watermarked images only
- **Processing Priority:** Standard queue

### Features Included
- ✅ Basic print-on-demand ordering
- ✅ Community gallery access
- ✅ Basic art styles and filters
- ❌ No art history saved
- ❌ No favorites collection
- ❌ No commercial usage rights
- ❌ No advanced editing tools

### Limitations
- Art creations are deleted after 24 hours
- Cannot save work for later
- Watermarked downloads only (to encourage print purchases)
- No customer support (community forum only)

---

## ⭐ PREMIUM TIER
**Price:** $9.99/month  
**Target Audience:** Personal users, hobbyists, social media creators, Home decor specialist, Anime Specialist

### AI Generation Limits
- **Monthly Generations:** 100 per month (account-based)
- **Available Styles:** All art styles and filters
- **Resolution:** High (1024x1024px)
- **Download Quality:** Watermarked downloads only
- **Processing Priority:** Priority queue (2x faster)

### Features Included
- ✅ Art history saved (last 50 creations)
- ✅ Favorites collection (unlimited)
- ✅ Advanced editing tools
- ✅ Multiple export formats (JPG, PNG)
- ✅ Personal usage rights
- ✅ Shopping cart saves art selections
- ✅ Email support (48hr response)

### Shopping & Account Benefits
- Save artwork permanently
- Quick reorder previous prints
- Access to premium print materials
- Monthly usage reports

---

## 🎨 PRO TIER
**Price:** $39.99/month  
**Target Audience:** Professional artists, content creators, small businesses

### AI Generation Limits
- **Monthly Generations:** 1000 per month (account-based)
- **Available Styles:** All styles + advanced controls
- **Resolution:** Ultra HD (2048x2048px)
- **Download Quality:** Clean downloads (no watermark)
- **Processing Priority:** Express queue (3x faster) - throttles to normal speed after 500 generations if no print purchases made

### Features Included
- ✅ Unlimited art history
- ✅ Custom style training (upload reference images)
- ✅ Commercial usage rights
- ✅ Advanced export options (PNG, SVG, PDF)
- ✅ Batch operations (edit multiple arts)
- ✅ Priority customer support (24hr response)
- ✅ **10% discount on all prints**

### Advanced Features
- Custom AI model training
- Advanced prompt engineering tools
- Bulk download and organization
- Integration with design software
- Commercial license certificate

---

## 💰 PRICING STRATEGY

### Monthly Pricing
- **Free:** $0/month
- **Premium:** $9.99/month
- **Pro:** $39.99/month  

### Annual Pricing (10% discount)
- **Premium:** $107.90/year (save $11.98)
- **Pro:** $431.90/year (save $47.98)


---

## 🛒 SHOPPING CART & ACCOUNT FEATURES

### Account Dashboard Components
```
📊 My Dashboard
├── 🎨 My Artwork
│   ├── Recent Creations (last 30 days)
│   ├── Favorites Collection
│   ├── Art History (tier-dependent)
│   ├── Download Manager
│   └── Usage Statistics
├── 🛒 Shopping Cart
│   ├── Current Cart Items
│   ├── Saved for Later
│   ├── Recently Viewed Prints
│   ├── Quick Reorder
│   └── Order History
├── 👤 Account Settings
│   ├── Subscription Management
│   ├── Billing & Payment Methods
│   ├── Usage Statistics & Limits
│   ├── Account Preferences
│   └── Notification Preferences
└── 📦 Orders & Tracking
    ├── Current Orders
    ├── Order History
    ├── Print Tracking
    └── Return/Exchange Requests
```

### Smart Cart Features by Tier

#### Free Tier Cart
- Basic cart functionality
- Session-based (lost on logout)
- No save for later
- Standard checkout

#### Premium Tier Cart
- Persistent cart across sessions
- Save for later functionality
- Art-to-print suggestions
- Order history access

#### Pro Tier Cart
- Everything in Premium
- 10% automatic discount on prints
- Priority order processing
- Clean downloads (no watermark)


---

## 🎯 CONVERSION STRATEGY

### Free to Premium Triggers
- Reach monthly generation limit (10 per month)
- Try to save artwork permanently
- Want to remove watermarks
- Want higher resolution (1024x1024px)
- Need art history and favorites

### Premium to Pro Triggers
- Need more than 100 generations per month
- Want clean downloads (no watermark)
- Need commercial usage rights
- Require custom style training
- Want ultra HD resolution (2048x2048px)
- Need 10% print discount for business use


---

## 📊 USAGE TRACKING & LIMITS

### What to Track
- Monthly generations used per IP address and account
- Download count and watermark status
- Print orders placed (for throttling logic)
- Storage space used per tier
- Processing speed adjustments
- Conversion triggers and upgrade prompts

### Limit Enforcement
- **Soft Limits:** Warning at 80% usage
- **Hard Limits:** Block new generations when exceeded
- **Grace Period:** 3 days over limit before blocking
- **Speed Throttling:** Pro users throttled after 500 generations without print purchases
- **Upgrade Prompts:** Show upgrade options when limits approached or throttling occurs

---

## 🔧 TECHNICAL IMPLEMENTATION NOTES

### Subscription Management
- Use Shopify's subscription API
- Integrate with existing customer accounts
- Handle upgrades/downgrades mid-cycle
- Prorate billing changes

### Art Storage
- Free: 24-hour temporary storage
- Premium: Last 50 creations (1 month retention)
- Pro: Unlimited retention

### Print Integration
- Apply tier discounts automatically (10% for Pro)
- Track print orders per subscription (for throttling logic)
- Watermark enforcement (Free/Premium only)
- Clean download access (Pro tier only)

---

*Last Updated: January 9, 2025*
*Status: Finalized - Ready for Implementation*
