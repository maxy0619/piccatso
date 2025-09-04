# 🗺️ Piccatso Website Navigation & Page Structure

## 📊 **Complete Page Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                🏠 HOMEPAGE (/)                                 │
│                              templates/index.json                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🎯 Hero Section: "Turn your photo into gallery-worthy art"            │   │
│  │  📱 Piccatso App Block: AI Art Generation Tool                        │   │
│  │  📋 How It Works: Upload → Preview → Print                            │   │
│  │  🖼️ Quality Section: Museum-quality prints                            │   │
│  │  ❓ FAQ Section: Common questions                                      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              🧭 HEADER NAVIGATION                              │
│                            sections/header.liquid                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  🎨 Gallery → /pages/gallery                                           │   │
│  │  🔐 Sign In → /pages/auth (if not logged in)                          │   │
│  │  👤 [User Name] → Account Dropdown (if logged in)                     │   │
│  │     ├── 📊 Dashboard → /account                                       │   │
│  │     ├── 🎨 My Artwork → /account#artwork                              │   │
│  │     ├── 🛒 Shopping Cart → /account#cart                              │   │
│  │     ├── 📦 Order History → /account#orders                            │   │
│  │     ├── ⚙️ Settings → /account#settings                               │   │
│  │     ├── ⭐ Upgrade Plan → /pages/subscription (if free tier)          │   │
│  │     └── 🚪 Sign Out → /pages/auth?logout=true                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│    🎨 GALLERY PAGE      │ │   🔐 AUTHENTICATION     │ │   👤 ACCOUNT DASHBOARD  │
│  /pages/gallery         │ │   /pages/auth           │ │   /account              │
│  page.gallery.json      │ │   page.auth.json        │ │   customers/account.json│
│                         │ │                         │ │                         │
│  ┌─────────────────┐   │ │  ┌─────────────────┐   │ │  ┌─────────────────┐   │
│  │ AI Art Gallery  │   │ │  │ Sign In Form    │   │ │  │ User Profile    │   │
│  │ - Browse styles │   │ │  │ Sign Up Form    │   │ │  │ Subscription    │   │
│  │ - View examples │   │ │  │ Google Sign-In  │   │ │  │ Artwork Mgmt    │   │
│  │ - Get inspired  │   │ │  │ Password Reset  │   │ │  │ Shopping Cart   │   │
│  └─────────────────┘   │ │  └─────────────────┘   │ │  │ Order History   │   │
└─────────────────────────┘ └─────────────────────────┘ │  │ Settings        │   │
                                                         │  └─────────────────┘   │
                                                         └─────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│   ⭐ SUBSCRIPTION        │ │   🛍️ PRODUCT PAGE       │ │   🛒 CART PAGE          │
│   /pages/subscription   │ │   /products/ai-art-print│ │   /cart                 │
│   page.subscription.json│ │   product.json          │ │   cart.json             │
│                         │ │                         │ │                         │
│  ┌─────────────────┐   │ │  ┌─────────────────┐   │ │  ┌─────────────────┐   │
│  │ Tier Plans:     │   │ │  │ Piccatso App    │   │ │  │ Cart Items      │   │
│  │ - Free (10 gen) │   │ │  │ Block           │   │ │  │ Checkout        │   │
│  │ - Premium (50)  │   │ │  │ Product Options │   │ │  │ Shipping        │   │
│  │ - Pro (200)     │   │ │  │ Add to Cart     │   │ │  │ Payment         │   │
│  └─────────────────┘   │ │  └─────────────────┘   │ │  └─────────────────┘   │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│   🧪 PRINTFUL PREVIEW   │ │   📝 CREATE PAGE         │ │   🔍 SEARCH PAGE        │
│   /pages/printful-      │ │   /pages/create          │ │   /search               │
│   preview               │ │   page.create.json       │ │   search.json           │
│   page.printful-        │ │                         │ │                         │
│   preview.json          │ │  ┌─────────────────┐   │ │  ┌─────────────────┐   │
│                         │ │  │ Piccatso App    │   │ │  │ Search Results  │   │
│  ┌─────────────────┐   │ │  │ Block Only      │   │ │  │ Product Filter  │   │
│  │ POD Testing     │   │ │  │ Focused Flow    │   │ │  │ Sort Options    │   │
│  │ Mockup Preview  │   │ │  │ Step-by-step    │   │ │  │ Pagination      │   │
│  │ Pricing Test    │   │ │  └─────────────────┘   │ │  └─────────────────┘   │
│  └─────────────────┘   │ │                         │ │                         │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│   📞 CONTACT PAGE       │ │   🔧 TEST NAVIGATION    │ │   🚫 404 ERROR PAGE     │
│   /pages/contact        │ │   /pages/test-navigation│ │   /404                  │
│   page.contact.json     │ │   page.test-navigation  │ │   404.json              │
│                         │ │   .json                 │ │                         │
│  ┌─────────────────┐   │ │  ┌─────────────────┐   │ │  ┌─────────────────┐   │
│  │ Contact Form    │   │ │  │ Debug Tools     │   │ │  │ Error Message   │   │
│  │ Support Info    │   │ │  │ Link Testing    │   │ │  │ Back to Home    │   │
│  │ Business Hours  │   │ │  │ Template Check  │   │ │  │ Search          │   │
│  └─────────────────┘   │ │  └─────────────────┘   │ │  └─────────────────┘   │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

## 🔗 **Navigation Flow Summary**

### **Primary Navigation Paths:**
1. **Homepage** → **Create** (via Piccatso app block)
2. **Homepage** → **Gallery** (via header link)
3. **Homepage** → **Sign In** (via header button)
4. **Sign In** → **Account Dashboard** (after authentication)
5. **Account** → **Subscription** (upgrade flow)
6. **Product** → **Cart** → **Checkout** (purchase flow)

### **Authentication Flow:**
```
Not Logged In: Header shows "🔐 Sign In" → /pages/auth
Logged In: Header shows "👤 [Name] [Tier]" → Account Dropdown
```

### **Account Dashboard Tabs:**
- **Overview**: User profile, subscription status
- **Artwork**: AI-generated art management
- **Shopping Cart**: Current cart items
- **Orders**: Order history
- **Settings**: Password, preferences

## 📁 **Template Files Structure**

### **Main Templates:**
- `templates/index.json` - Homepage
- `templates/product.json` - Product pages
- `templates/cart.json` - Shopping cart
- `templates/search.json` - Search results
- `templates/404.json` - Error page

### **Custom Page Templates:**
- `templates/page.auth.json` - Authentication
- `templates/page.gallery.json` - AI Art Gallery
- `templates/page.account.json` - Account Dashboard
- `templates/page.subscription.json` - Subscription Plans
- `templates/page.create.json` - Create Page
- `templates/page.printful-preview.json` - POD Testing
- `templates/page.contact.json` - Contact
- `templates/page.test-navigation.json` - Debug Tools

### **Customer Account Templates:**
- `templates/customers/account.json` - Main account page
- `templates/customers/login.json` - Login form
- `templates/customers/register.json` - Registration form
- `templates/customers/order.json` - Order details
- `templates/customers/addresses.json` - Address management

## 🎯 **Key Navigation Features**

### **Dynamic Header:**
- Shows different content based on login status
- Account dropdown with tier display
- Responsive navigation

### **Authentication Integration:**
- Shopify native customer accounts
- Google Sign-In support
- Session management
- Cross-user data protection

### **Account Management:**
- Comprehensive dashboard
- Subscription tier management
- Artwork storage and management
- Order history integration

### **Print-on-Demand:**
- Printful integration testing
- Mockup preview system
- Dynamic pricing
- Order fulfillment

## 🔧 **Debug & Testing Pages**

- **Test Navigation**: `/pages/test-navigation` - Debug all page links
- **Printful Preview**: `/pages/printful-preview` - Test POD integration
- **Account Debug**: Built-in debug tools in account dashboard

## 📱 **Mobile Responsiveness**

All pages are optimized for mobile with:
- Responsive navigation
- Touch-friendly interfaces
- Mobile-optimized forms
- Adaptive layouts

## 🚀 **Performance Considerations**

- Lazy loading for gallery images
- Optimized asset delivery
- Efficient authentication checks
- Minimal JavaScript overhead
