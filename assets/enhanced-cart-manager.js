/**
 * Enhanced Shopping Cart Manager for Piccatso
 * Integrates artwork history with print-on-demand shopping
 */

class PiccatsoCartManager {
  constructor() {
    this.subscription = window.PiccatsoSubscription;
    this.cartItems = [];
    this.savedItems = [];
    this.recentlyViewed = [];
    
    this.initializeCart();
  }

  /**
   * Initialize cart system
   */
  async initializeCart() {
    await this.loadCartFromShopify();
    this.loadSavedItems();
    this.setupCartIntegration();
  }

  /**
   * Load current cart from Shopify
   */
  async loadCartFromShopify() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      this.cartItems = cart.items.map(item => ({
        id: item.id,
        variant_id: item.variant_id,
        product_id: item.product_id,
        title: item.product_title,
        variant_title: item.variant_title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        properties: item.properties || {},
        artwork_id: item.properties['Artwork ID'] || null,
        print_type: item.properties['Print Type'] || 'canvas',
        print_size: item.properties['Print Size'] || '12x16',
        design_url: item.properties['Design URL'] || item.properties['design_url'] || null
      }));

      this.updateCartUI();
    } catch (error) {
      console.error('Error loading cart from Shopify:', error);
    }
  }

  /**
   * Load saved items from localStorage
   */
  loadSavedItems() {
    const saved = localStorage.getItem('piccatso_saved_cart_items');
    if (saved) {
      try {
        this.savedItems = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading saved items:', error);
        this.savedItems = [];
      }
    }
  }

  /**
   * Save items to localStorage
   */
  saveSavedItems() {
    try {
      localStorage.setItem('piccatso_saved_cart_items', JSON.stringify(this.savedItems));
    } catch (error) {
      console.error('Error saving items:', error);
    }
  }

  /**
   * Add artwork to cart as print
   */
  async addArtworkToCart(artworkData, printOptions) {
    const { type, size, price } = printOptions;
    
    // Apply tier-based discount
    const discount = this.subscription.getPrintDiscount();
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

    const cartData = {
      id: Date.now(), // Temporary ID
      artwork_id: artworkData.id,
      title: `${artworkData.title} - ${type.charAt(0).toUpperCase() + type.slice(1)} Print`,
      image: artworkData.image,
      print_type: type,
      print_size: size,
      price: Math.round(finalPrice * 100), // Convert to cents
      quantity: 1,
      design_url: artworkData.image,
      properties: {
        'Artwork ID': artworkData.id,
        'Artwork Title': artworkData.title,
        'Print Type': type,
        'Print Size': size,
        'Design URL': artworkData.image,
        'Original Price': price,
        'Discount Applied': discount > 0 ? `${discount}%` : 'None',
        'Customer Tier': this.subscription.currentUser.tier
      }
    };

    // Add to Shopify cart
    try {
      const shopifyData = {
        items: [{
          id: this.getShopifyVariantId(type, size),
          quantity: 1,
          properties: cartData.properties
        }]
      };

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopifyData)
      });

      if (response.ok) {
        // Reload cart to get updated data
        await this.loadCartFromShopify();
        
        // Record print order for subscription tracking
        this.subscription.recordPrintOrder({
          id: Date.now(),
          total: finalPrice,
          items: [cartData]
        });

        this.showCartNotification(`Added ${cartData.title} to cart!`);
        return true;
      } else {
        throw new Error('Failed to add to Shopify cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showCartNotification('Error adding to cart. Please try again.', 'error');
      return false;
    }
  }

  /**
   * Save item for later
   */
  saveForLater(itemId) {
    const item = this.cartItems.find(i => i.id === itemId);
    if (!item) return false;

    // Check if user can save items
    if (this.subscription.currentUser.tier === 'free') {
      this.showUpgradePrompt('save_items', 'Saving items requires a Premium subscription');
      return false;
    }

    // Remove from cart
    this.removeFromCart(itemId);
    
    // Add to saved items
    this.savedItems.push({
      ...item,
      saved_at: new Date().toISOString()
    });

    this.saveSavedItems();
    this.updateCartUI();
    this.showCartNotification('Item saved for later!');
    return true;
  }

  /**
   * Move saved item back to cart
   */
  async moveToCart(savedItemIndex) {
    const item = this.savedItems[savedItemIndex];
    if (!item) return false;

    // Re-add to Shopify cart
    const success = await this.addArtworkToCart(
      {
        id: item.artwork_id,
        title: item.properties['Artwork Title'],
        image: item.design_url
      },
      {
        type: item.print_type,
        size: item.print_size,
        price: parseFloat(item.properties['Original Price'])
      }
    );

    if (success) {
      // Remove from saved items
      this.savedItems.splice(savedItemIndex, 1);
      this.saveSavedItems();
      this.updateCartUI();
    }

    return success;
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          quantity: 0
        })
      });

      if (response.ok) {
        await this.loadCartFromShopify();
        this.showCartNotification('Item removed from cart');
        return true;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
    return false;
  }

  /**
   * Quick reorder from previous purchase
   */
  async quickReorder(orderData) {
    const promises = orderData.items.map(item => 
      this.addArtworkToCart(
        {
          id: item.artwork_id,
          title: item.properties['Artwork Title'],
          image: item.design_url
        },
        {
          type: item.print_type,
          size: item.print_size,
          price: parseFloat(item.properties['Original Price'])
        }
      )
    );

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r).length;
    
    if (successCount > 0) {
      this.showCartNotification(`Added ${successCount} items to cart!`);
    }

    return successCount;
  }

  /**
   * Get cart summary with tier-specific features
   */
  getCartSummary() {
    const subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = this.subscription.getPrintDiscount();
    const discountAmount = discount > 0 ? subtotal * (discount / 100) : 0;
    const total = subtotal - discountAmount;

    return {
      itemCount: this.cartItems.length,
      subtotal: subtotal / 100,
      discount: discount,
      discountAmount: discountAmount / 100,
      total: total / 100,
      savedItemsCount: this.savedItems.length,
      canSaveItems: this.subscription.currentUser.tier !== 'free',
      tierBenefits: this.getTierBenefits()
    };
  }

  /**
   * Get tier-specific cart benefits
   */
  getTierBenefits() {
    const tier = this.subscription.currentUser.tier;
    const benefits = [];

    switch (tier) {
      case 'free':
        benefits.push('Basic cart functionality');
        break;
      case 'premium':
        benefits.push('Save items for later');
        benefits.push('Persistent cart across sessions');
        benefits.push('Art-to-print suggestions');
        break;
      case 'pro':
        benefits.push('Everything in Premium');
        benefits.push('10% automatic discount');
        benefits.push('Priority order processing');
        benefits.push('Clean downloads');
        break;
    }

    return benefits;
  }

  /**
   * Get art-to-print suggestions
   */
  getArtToPrintSuggestions() {
    if (!this.subscription.hasFeature('art_history')) {
      return [];
    }

    const artworks = this.subscription.getArtworks('recent');
    const suggestions = [];

    artworks.forEach(artwork => {
      // Check if this artwork is not already in cart
      const inCart = this.cartItems.some(item => item.artwork_id == artwork.id);
      if (!inCart) {
        suggestions.push({
          artwork,
          suggestedProducts: [
            { type: 'canvas', size: '12x16', price: 39.98 },
            { type: 'poster', size: '12x16', price: 29.98 },
            { type: 'metal', size: '12x16', price: 59.96 }
          ]
        });
      }
    });

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  }

  /**
   * Add recently viewed artwork
   */
  addRecentlyViewed(artworkData) {
    // Remove if already exists
    this.recentlyViewed = this.recentlyViewed.filter(a => a.id !== artworkData.id);
    
    // Add to beginning
    this.recentlyViewed.unshift({
      ...artworkData,
      viewed_at: new Date().toISOString()
    });

    // Limit to 10 items
    this.recentlyViewed = this.recentlyViewed.slice(0, 10);

    // Save to localStorage
    try {
      localStorage.setItem('piccatso_recently_viewed', JSON.stringify(this.recentlyViewed));
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  }

  /**
   * Get Shopify variant ID for print type and size
   */
  getShopifyVariantId(type, size) {
    // This would map to actual Shopify product variant IDs
    // For now, return a placeholder
    const variantMap = {
      'canvas_12x16': 40110175633555,
      'canvas_16x20': 40110175666323,
      'canvas_18x24': 40110175699091,
      'poster_12x16': 40110175731859,
      'poster_16x20': 40110175764627,
      'poster_18x24': 40110175797395,
      'metal_12x16': 40110175830163,
      'metal_16x20': 40110175862931,
      'metal_18x24': 40110175895699,
      'framed_12x16': 40110175928467,
      'framed_16x20': 40110175961235,
      'framed_18x24': 40110175994003
    };

    const key = `${type}_${size.replace('x', 'x')}`;
    return variantMap[key] || 40110175633555; // Default to canvas 12x16
  }

  /**
   * Setup cart integration with existing systems
   */
  setupCartIntegration() {
    // Listen for cart updates
    document.addEventListener('cart:updated', () => {
      this.loadCartFromShopify();
    });

    // Setup cart drawer enhancement
    this.enhanceCartDrawer();
  }

  /**
   * Enhance existing cart drawer with tier-specific features
   */
  enhanceCartDrawer() {
    const cartDrawer = document.querySelector('#cart-drawer');
    if (!cartDrawer) return;

    // Add tier benefits section
    const tierSection = document.createElement('div');
    tierSection.className = 'cart-tier-benefits';
    tierSection.innerHTML = this.generateTierBenefitsHTML();

    // Add art suggestions section for Premium+ users
    if (this.subscription.currentUser.tier !== 'free') {
      const suggestionsSection = document.createElement('div');
      suggestionsSection.className = 'cart-art-suggestions';
      suggestionsSection.innerHTML = this.generateArtSuggestionsHTML();
      cartDrawer.appendChild(suggestionsSection);
    }

    cartDrawer.appendChild(tierSection);
  }

  /**
   * Generate tier benefits HTML
   */
  generateTierBenefitsHTML() {
    const summary = this.getCartSummary();
    
    return `
      <div style="padding: 1rem; background: #f8fafc; border-radius: 0.5rem; margin: 1rem 0;">
        <h4 style="margin: 0 0 0.5rem 0; color: #8B5CF6;">
          ${this.subscription.tiers[this.subscription.currentUser.tier].name} Benefits
        </h4>
        <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.9rem;">
          ${summary.tierBenefits.map(benefit => `<li>${benefit}</li>`).join('')}
        </ul>
        ${summary.discount > 0 ? `
          <div style="color: #10b981; font-weight: 600; margin-top: 0.5rem;">
            💰 ${summary.discount}% discount applied automatically!
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate art suggestions HTML
   */
  generateArtSuggestionsHTML() {
    const suggestions = this.getArtToPrintSuggestions();
    
    if (suggestions.length === 0) return '';

    return `
      <div style="padding: 1rem; border-top: 1px solid #e2e8f0; margin-top: 1rem;">
        <h4 style="margin: 0 0 1rem 0;">🎨 Your Art Ready to Print</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
          ${suggestions.slice(0, 3).map(suggestion => `
            <div style="text-align: center; cursor: pointer;" onclick="window.PiccatsoCart.quickAddArtwork('${suggestion.artwork.id}')">
              <img src="${suggestion.artwork.image}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 0.5rem; margin-bottom: 0.5rem;">
              <div style="font-size: 0.8rem; font-weight: 600;">${suggestion.artwork.title}</div>
              <div style="font-size: 0.7rem; color: #10b981;">From $${suggestion.suggestedProducts[0].price}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Quick add artwork with default options
   */
  async quickAddArtwork(artworkId) {
    const artwork = this.subscription.currentUser.artworks.find(a => a.id == artworkId);
    if (!artwork) return false;

    return await this.addArtworkToCart(artwork, {
      type: 'canvas',
      size: '12x16',
      price: 39.98
    });
  }

  /**
   * Update cart UI elements
   */
  updateCartUI() {
    // Update cart count in header
    const cartCountElements = document.querySelectorAll('.cart-count, [data-cart-count]');
    cartCountElements.forEach(element => {
      element.textContent = this.cartItems.length;
    });

    // Update dashboard cart section
    this.updateDashboardCart();

    // Dispatch custom event for other components
    document.dispatchEvent(new CustomEvent('piccatso:cart-updated', {
      detail: { cartItems: this.cartItems, summary: this.getCartSummary() }
    }));
  }

  /**
   * Update dashboard cart display
   */
  updateDashboardCart() {
    const cartContainer = document.getElementById('current-cart-items');
    const savedContainer = document.getElementById('saved-items');
    
    if (cartContainer) {
      if (this.cartItems.length === 0) {
        cartContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🛒</div>
            <p>Your cart is empty.<br>Add some prints to get started!</p>
          </div>
        `;
      } else {
        cartContainer.innerHTML = this.cartItems.map(item => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
              <div class="cart-item-title">${item.title}</div>
              <div class="cart-item-price">$${(item.price / 100).toFixed(2)}</div>
              ${this.subscription.currentUser.tier !== 'free' ? `
                <button onclick="window.PiccatsoCart.saveForLater('${item.id}')" style="font-size: 0.8rem; color: #8B5CF6; background: none; border: none; cursor: pointer;">
                  Save for Later
                </button>
              ` : ''}
            </div>
          </div>
        `).join('');
      }
    }

    if (savedContainer) {
      if (this.savedItems.length === 0) {
        savedContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">💾</div>
            <p>No items saved for later.</p>
          </div>
        `;
      } else {
        savedContainer.innerHTML = this.savedItems.map((item, index) => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-details">
              <div class="cart-item-title">${item.title}</div>
              <div class="cart-item-price">$${(item.price / 100).toFixed(2)}</div>
              <button onclick="window.PiccatsoCart.moveToCart(${index})" style="font-size: 0.8rem; color: #10b981; background: none; border: none; cursor: pointer;">
                Move to Cart
              </button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  /**
   * Show cart notification
   */
  showCartNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 3000);
  }

  /**
   * Show upgrade prompt
   */
  showUpgradePrompt(feature, message) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    modal.innerHTML = `
      <div style="background: white; border-radius: 1rem; padding: 2rem; max-width: 400px; text-align: center;">
        <h3 style="margin: 0 0 1rem 0; color: #8B5CF6;">Upgrade Required</h3>
        <p style="margin: 0 0 2rem 0;">${message}</p>
        <div style="display: flex; gap: 1rem;">
          <button onclick="this.closest('.upgrade-modal').remove()" style="flex: 1; padding: 1rem; background: #f1f5f9; border: none; border-radius: 0.5rem; cursor: pointer;">
            Maybe Later
          </button>
          <button onclick="window.PiccatsoSubscription.simulateUpgrade('premium'); this.closest('.upgrade-modal').remove();" style="flex: 1; padding: 1rem; background: #8B5CF6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
            Upgrade Now
          </button>
        </div>
      </div>
    `;
    
    modal.className = 'upgrade-modal';
    document.body.appendChild(modal);
  }
}

// Initialize global cart manager
window.PiccatsoCart = new PiccatsoCartManager();

console.log('✅ Piccatso Cart Manager loaded');
