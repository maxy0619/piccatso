/**
 * Piccatso Subscription Management System
 * Handles tier tracking, usage limits, and feature access
 */

class PiccatsoSubscriptionManager {
  constructor() {
    this.tiers = {
      free: {
        name: 'Free',
        price: 0,
        generationsLimit: 10,
        resolution: '512x512',
        watermark: true,
        artHistory: false,
        processingSpeed: 1,
        features: ['basic_pod', 'community_gallery']
      },
      premium: {
        name: 'Premium',
        price: 9.99,
        generationsLimit: 100,
        resolution: '1024x1024',
        watermark: true,
        artHistory: 50,
        processingSpeed: 2,
        features: ['basic_pod', 'community_gallery', 'art_history', 'favorites', 'advanced_editing', 'jpg_png_export']
      },
      pro: {
        name: 'Pro',
        price: 39.99,
        generationsLimit: 1000,
        resolution: '2048x2048',
        watermark: false,
        artHistory: -1, // unlimited
        processingSpeed: 3,
        printDiscount: 10,
        features: ['basic_pod', 'community_gallery', 'art_history', 'favorites', 'advanced_editing', 'clean_downloads', 'commercial_rights', 'custom_training', 'bulk_operations', 'advanced_export']
      },
      factory: {
        name: 'Factory',
        price: 0,
        generationsLimit: -1, // unlimited
        resolution: '4096x4096', // ultra high resolution
        watermark: false,
        artHistory: -1, // unlimited
        processingSpeed: 10, // maximum speed
        printDiscount: 50, // maximum discount
        isFactory: true,
        features: [
          'basic_pod', 'community_gallery', 'art_history', 'favorites', 'advanced_editing', 
          'clean_downloads', 'commercial_rights', 'custom_training', 'bulk_operations', 
          'advanced_export', 'admin_panel', 'testing_mode', 'all_features', 'unlimited_access',
          'api_access', 'debug_mode', 'analytics_access', 'user_management'
        ]
      }
    };
    
    this.currentUser = this.loadUserData();
    this.initializeTracking();
  }

  /**
   * Load user data from Shopify customer and localStorage
   */
  loadUserData() {
    const defaultUser = {
      id: null,
      email: '',
      tier: 'free',
      generationsUsed: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      artworks: [],
      printOrders: [],
      processingSpeedThrottled: false,
      isLoggedIn: false
    };

    // Check if user is logged in via Shopify
    if (typeof window.customer !== 'undefined' && window.customer) {
      defaultUser.isLoggedIn = true;
      defaultUser.id = window.customer.id;
      defaultUser.email = window.customer.email;
      
      // Get tier from customer tags
      if (window.customer.tags) {
        if (window.customer.tags.includes('premium')) defaultUser.tier = 'premium';
        if (window.customer.tags.includes('pro')) defaultUser.tier = 'pro';
      }
    }

    // Load additional data from localStorage
    const storedData = localStorage.getItem('piccatso_user_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        return { ...defaultUser, ...parsed };
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }

    return defaultUser;
  }

  /**
   * Save user data to localStorage
   */
  saveUserData() {
    try {
      localStorage.setItem('piccatso_user_data', JSON.stringify(this.currentUser));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  /**
   * Initialize usage tracking
   */
  initializeTracking() {
    // Check if we need to reset monthly usage
    const today = new Date().toISOString().split('T')[0];
    const lastReset = new Date(this.currentUser.lastResetDate);
    const currentDate = new Date(today);
    
    // Reset if it's a new month
    if (lastReset.getMonth() !== currentDate.getMonth() || 
        lastReset.getFullYear() !== currentDate.getFullYear()) {
      this.resetMonthlyUsage();
    }

    // Set up IP-based tracking for non-logged-in users
    if (!this.currentUser.isLoggedIn) {
      this.setupIPTracking();
    }
  }

  /**
   * Reset monthly usage counters
   */
  resetMonthlyUsage() {
    this.currentUser.generationsUsed = 0;
    this.currentUser.lastResetDate = new Date().toISOString().split('T')[0];
    this.currentUser.processingSpeedThrottled = false;
    this.saveUserData();
    
    console.log('Monthly usage reset for user:', this.currentUser.email || 'Anonymous');
  }

  /**
   * Setup IP-based tracking for anonymous users
   */
  setupIPTracking() {
    const ipKey = 'piccatso_ip_usage';
    const ipData = localStorage.getItem(ipKey);
    
    if (ipData) {
      try {
        const parsed = JSON.parse(ipData);
        // Use IP-based limits for anonymous users
        this.currentUser.generationsUsed = parsed.generationsUsed || 0;
        this.currentUser.lastResetDate = parsed.lastResetDate || this.currentUser.lastResetDate;
      } catch (error) {
        console.error('Error parsing IP usage data:', error);
      }
    }
  }

  /**
   * Check if user can generate more images
   */
  canGenerate() {
    const tier = this.tiers[this.currentUser.tier];
    const hasGenerationsLeft = this.currentUser.generationsUsed < tier.generationsLimit;
    
    return {
      allowed: hasGenerationsLeft,
      remaining: tier.generationsLimit - this.currentUser.generationsUsed,
      limit: tier.generationsLimit,
      tier: this.currentUser.tier
    };
  }

  /**
   * Record a new generation
   */
  recordGeneration() {
    const canGen = this.canGenerate();
    
    if (!canGen.allowed) {
      throw new Error(`Generation limit exceeded. Upgrade to increase your limit.`);
    }

    this.currentUser.generationsUsed += 1;
    
    // Check for Pro tier throttling
    if (this.currentUser.tier === 'pro' && 
        this.currentUser.generationsUsed >= 500 && 
        this.currentUser.printOrders.length === 0) {
      this.currentUser.processingSpeedThrottled = true;
    }

    this.saveUserData();
    
    // Update IP tracking for anonymous users
    if (!this.currentUser.isLoggedIn) {
      this.updateIPTracking();
    }

    return {
      used: this.currentUser.generationsUsed,
      remaining: canGen.limit - this.currentUser.generationsUsed,
      throttled: this.currentUser.processingSpeedThrottled
    };
  }

  /**
   * Update IP-based tracking
   */
  updateIPTracking() {
    const ipKey = 'piccatso_ip_usage';
    const ipData = {
      generationsUsed: this.currentUser.generationsUsed,
      lastResetDate: this.currentUser.lastResetDate
    };
    
    try {
      localStorage.setItem(ipKey, JSON.stringify(ipData));
    } catch (error) {
      console.error('Error updating IP tracking:', error);
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  hasFeature(featureName) {
    const tier = this.tiers[this.currentUser.tier];
    return tier.features.includes(featureName);
  }

  /**
   * Check if downloads should be watermarked
   */
  shouldWatermark() {
    const tier = this.tiers[this.currentUser.tier];
    return tier.watermark;
  }

  /**
   * Get processing speed multiplier
   */
  getProcessingSpeed() {
    const tier = this.tiers[this.currentUser.tier];
    
    // Apply throttling for Pro users without print purchases
    if (this.currentUser.tier === 'pro' && this.currentUser.processingSpeedThrottled) {
      return 1; // Normal speed instead of 3x
    }
    
    return tier.processingSpeed;
  }

  /**
   * Get print discount percentage
   */
  getPrintDiscount() {
    const tier = this.tiers[this.currentUser.tier];
    return tier.printDiscount || 0;
  }

  /**
   * Record a print order (removes throttling for Pro users)
   */
  recordPrintOrder(orderData) {
    this.currentUser.printOrders.push({
      id: orderData.id || Date.now(),
      date: new Date().toISOString(),
      total: orderData.total || 0,
      items: orderData.items || []
    });

    // Remove throttling for Pro users who make print purchases
    if (this.currentUser.tier === 'pro') {
      this.currentUser.processingSpeedThrottled = false;
    }

    this.saveUserData();
  }

  /**
   * Add artwork to user's collection
   */
  addArtwork(artworkData) {
    if (!this.hasFeature('art_history')) {
      console.warn('Art history not available for current tier');
      return false;
    }

    const artwork = {
      id: artworkData.id || Date.now(),
      title: artworkData.title || 'Untitled Artwork',
      image: artworkData.image,
      prompt: artworkData.prompt || '',
      style: artworkData.style || '',
      resolution: artworkData.resolution || '512x512',
      createdAt: new Date().toISOString(),
      favorite: false
    };

    this.currentUser.artworks.unshift(artwork);

    // Limit artwork storage based on tier
    const tier = this.tiers[this.currentUser.tier];
    if (tier.artHistory > 0 && this.currentUser.artworks.length > tier.artHistory) {
      this.currentUser.artworks = this.currentUser.artworks.slice(0, tier.artHistory);
    }

    this.saveUserData();
    return artwork;
  }

  /**
   * Get user's artwork collection
   */
  getArtworks(filter = 'all') {
    if (!this.hasFeature('art_history')) {
      return [];
    }

    let artworks = this.currentUser.artworks;

    switch (filter) {
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        artworks = artworks.filter(a => new Date(a.createdAt) > thirtyDaysAgo);
        break;
      case 'favorites':
        artworks = artworks.filter(a => a.favorite);
        break;
      case 'prints':
        // Artworks that have been ordered as prints
        artworks = artworks.filter(a => a.printOrdered);
        break;
    }

    return artworks;
  }

  /**
   * Toggle artwork favorite status
   */
  toggleFavorite(artworkId) {
    if (!this.hasFeature('favorites')) {
      return false;
    }

    const artwork = this.currentUser.artworks.find(a => a.id == artworkId);
    if (artwork) {
      artwork.favorite = !artwork.favorite;
      this.saveUserData();
      return artwork.favorite;
    }
    return false;
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    const tier = this.tiers[this.currentUser.tier];
    
    return {
      tier: this.currentUser.tier,
      tierName: tier.name,
      generationsUsed: this.currentUser.generationsUsed,
      generationsLimit: tier.generationsLimit,
      usagePercentage: Math.round((this.currentUser.generationsUsed / tier.generationsLimit) * 100),
      artworksCount: this.currentUser.artworks.length,
      artworksLimit: tier.artHistory,
      printsOrdered: this.currentUser.printOrders.length,
      processingSpeed: this.getProcessingSpeed(),
      isThrottled: this.currentUser.processingSpeedThrottled,
      features: tier.features,
      printDiscount: this.getPrintDiscount()
    };
  }

  /**
   * Get upgrade recommendations
   */
  getUpgradeRecommendations() {
    const currentTier = this.currentUser.tier;
    const stats = this.getUsageStats();
    const recommendations = [];

    if (currentTier === 'free') {
      if (stats.usagePercentage > 80) {
        recommendations.push({
          reason: 'generation_limit',
          message: 'You\'re running low on generations this month',
          suggestedTier: 'premium',
          benefit: '100 generations per month + art history'
        });
      }

      if (this.currentUser.artworks.length > 0) {
        recommendations.push({
          reason: 'art_history',
          message: 'Save your artwork permanently',
          suggestedTier: 'premium',
          benefit: 'Keep your last 50 creations'
        });
      }
    }

    if (currentTier === 'premium') {
      if (stats.usagePercentage > 80) {
        recommendations.push({
          reason: 'generation_limit',
          message: 'Need more generations?',
          suggestedTier: 'pro',
          benefit: '1000 generations + clean downloads'
        });
      }
    }

    return recommendations;
  }

  /**
   * Simulate tier upgrade (for testing)
   */
  simulateUpgrade(newTier) {
    if (this.tiers[newTier]) {
      this.currentUser.tier = newTier;
      this.saveUserData();
      console.log(`Upgraded to ${newTier} tier`);
      return true;
    }
    return false;
  }

  /**
   * Clean up expired data
   */
  cleanup() {
    const now = new Date();
    
    // For free tier, remove artworks older than 24 hours
    if (this.currentUser.tier === 'free') {
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      this.currentUser.artworks = this.currentUser.artworks.filter(
        artwork => new Date(artwork.createdAt) > twentyFourHoursAgo
      );
    }

    this.saveUserData();
  }

  /**
   * Initialize Factory account with full access
   * @param {string} email - Factory account email
   * @param {string} tier - User tier (should be 'factory')
   */
  initializeUser(email, tier = 'free') {
    this.currentUser = {
      ...this.currentUser,
      email: email,
      tier: tier,
      isLoggedIn: true,
      id: tier === 'factory' ? 'factory_001' : this.currentUser.id || `user_${Date.now()}`
    };

    if (tier === 'factory') {
      this.currentUser.isFactory = true;
      this.currentUser.factoryMode = true;
      this.currentUser.permissions = {
        fullAccess: true,
        adminPanel: true,
        testingMode: true,
        unlimitedGenerations: true,
        allFeatures: true,
        debugMode: true,
        userManagement: true
      };
    }

    this.saveUserData();
    this.updateUI();
  }

  /**
   * Set Factory mode on/off
   * @param {boolean} enabled - Whether to enable factory mode
   */
  setFactoryMode(enabled = true) {
    if (this.currentUser.tier !== 'factory') {
      console.warn('Factory mode can only be enabled for Factory tier users');
      return false;
    }

    this.currentUser.factoryMode = enabled;
    this.saveUserData();
    
    // Update UI to show factory mode
    if (enabled) {
      this.showFactoryModeIndicator();
    } else {
      this.hideFactoryModeIndicator();
    }

    return true;
  }

  /**
   * Show factory mode indicator in UI
   */
  showFactoryModeIndicator() {
    // Add factory mode banner
    const existingBanner = document.getElementById('factory-mode-banner');
    if (existingBanner) return;

    const banner = document.createElement('div');
    banner.id = 'factory-mode-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        text-align: center;
        padding: 0.5rem;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      ">
        🏭 FACTORY MODE ACTIVE - Full System Access | User: Factory | All Features Unlocked
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Adjust body padding to account for banner
    document.body.style.paddingTop = '40px';
  }

  /**
   * Hide factory mode indicator
   */
  hideFactoryModeIndicator() {
    const banner = document.getElementById('factory-mode-banner');
    if (banner) {
      banner.remove();
      document.body.style.paddingTop = '';
    }
  }

  /**
   * Check if user has factory access
   * @returns {boolean}
   */
  isFactoryUser() {
    return this.currentUser.tier === 'factory' && this.currentUser.isFactory === true;
  }

  /**
   * Get factory account credentials (for testing purposes)
   * @returns {object|null}
   */
  getFactoryCredentials() {
    if (!this.isFactoryUser()) return null;
    
    return {
      username: 'Factory',
      email: 'factory@piccatso.internal',
      tier: 'factory',
      features: this.tiers.factory.features,
      permissions: this.currentUser.permissions || {}
    };
  }

  /**
   * Update UI based on current user tier and factory mode
   */
  updateUI() {
    // Update tier display
    const tierElements = document.querySelectorAll('[data-user-tier]');
    tierElements.forEach(el => {
      el.textContent = this.tiers[this.currentUser.tier].name;
      if (this.currentUser.tier === 'factory') {
        el.style.color = '#ef4444';
        el.style.fontWeight = 'bold';
      }
    });

    // Show factory mode if active
    if (this.currentUser.factoryMode) {
      this.showFactoryModeIndicator();
    }

    // Update navigation for factory users
    if (this.isFactoryUser()) {
      this.updateFactoryNavigation();
    }
  }

  /**
   * Update navigation for factory users
   */
  updateFactoryNavigation() {
    // Add admin panel link to navigation if it doesn't exist
    const authContainer = document.getElementById('auth-nav-container');
    if (authContainer && !document.getElementById('admin-panel-link')) {
      const adminLink = document.createElement('a');
      adminLink.id = 'admin-panel-link';
      adminLink.href = '/pages/printful-preview'; // Use existing testing page as admin panel
      adminLink.className = 'button button--secondary';
      adminLink.style.cssText = 'margin-right:1rem; font-size:1.2rem; padding:0.6rem 1rem; background: linear-gradient(135deg, #ef4444, #dc2626) !important; color: white !important;';
      adminLink.textContent = '🏭 Admin Panel';
      
      authContainer.parentNode.insertBefore(adminLink, authContainer);
    }
  }
}

// Initialize global subscription manager
window.PiccatsoSubscription = new PiccatsoSubscriptionManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PiccatsoSubscriptionManager;
}

console.log('✅ Piccatso Subscription Manager loaded');
console.log('Current user stats:', window.PiccatsoSubscription.getUsageStats());
