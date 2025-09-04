/**
 * Piccatso Subscription Management System
 * Handles tier management, usage tracking, and feature enforcement using Shopify customer metafields
 */

class PiccatsoSubscriptionManager {
  constructor() {
    this.customer = window.Shopify?.customer || null;
    this.currentTier = 'free';
    this.usageData = {
      monthlyGenerations: 0,
      storageUsed: 0,
      lastResetDate: new Date().toISOString().slice(0, 7) // YYYY-MM format
    };
    
    this.tierLimits = {
      free: {
        monthlyGenerations: 10,
        storageLimit: 0, // No storage for free tier
        features: {
          watermarkedDownloads: true,
          artHistory: false,
          favorites: false,
          commercialRights: false,
          printDiscount: 0
        }
      },
      premium: {
        monthlyGenerations: 100,
        storageLimit: 50, // Last 50 creations
        features: {
          watermarkedDownloads: true,
          artHistory: true,
          favorites: true,
          commercialRights: false,
          printDiscount: 0
        }
      },
      pro: {
        monthlyGenerations: 1000,
        storageLimit: -1, // Unlimited
        features: {
          watermarkedDownloads: false,
          artHistory: true,
          favorites: true,
          commercialRights: true,
          printDiscount: 10
        }
      }
    };
    
    this.init();
  }

  async init() {
    if (this.customer) {
      await this.loadCustomerData();
      this.updateUI();
    }
  }

  async loadCustomerData() {
    try {
      // First, check if we have Shopify customer data
      if (this.customer && this.customer.id) {
        console.log('Loading customer data for:', this.customer.email);
        
        // Load subscription tier from customer tags (fallback to metafields)
        if (this.customer.tags) {
          if (this.customer.tags.includes('pro')) {
            this.currentTier = 'pro';
          } else if (this.customer.tags.includes('premium')) {
            this.currentTier = 'premium';
          } else if (this.customer.tags.includes('factory')) {
            this.currentTier = 'factory';
          } else {
            this.currentTier = 'free';
          }
        }
        
        // Load usage data from localStorage (simulated for now)
        const storedUsage = localStorage.getItem(`piccatso_usage_${this.customer.id}`);
        if (storedUsage) {
          this.usageData = JSON.parse(storedUsage);
        }
        
        // Store customer data in localStorage for dashboard compatibility
        const userData = {
          id: this.customer.id,
          email: this.customer.email,
          name: `${this.customer.first_name} ${this.customer.last_name}`.trim(),
          tier: this.currentTier,
          isLoggedIn: true,
          provider: 'shopify',
          isFactory: this.currentTier === 'factory'
        };
        localStorage.setItem('piccatso_user', JSON.stringify(userData));
        
        // Check if we need to reset monthly usage
        this.checkMonthlyReset();
        
      } else {
        console.log('No Shopify customer data available, using defaults');
        this.currentTier = 'free';
      }
      
    } catch (error) {
      console.error('Error loading customer data:', error);
      this.currentTier = 'free';
    }
  }

  async getCustomerMetafield(namespace, key = 'default') {
    try {
      const response = await fetch('/account/metafields', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.metafields?.[`${namespace}.${key}`];
      }
    } catch (error) {
      console.error('Error fetching metafield:', error);
    }
    return null;
  }

  async setCustomerMetafield(namespace, key, value) {
    try {
      const response = await fetch('/account/metafields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          metafield: {
            namespace: namespace,
            key: key,
            value: value,
            type: 'single_line_text_field'
          }
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error setting metafield:', error);
      return false;
    }
  }

  checkMonthlyReset() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (this.usageData.lastResetDate !== currentMonth) {
      this.usageData.monthlyGenerations = 0;
      this.usageData.lastResetDate = currentMonth;
      this.saveUsageData();
    }
  }

  async saveUsageData() {
    await this.setCustomerMetafield('usage_data', 'default', JSON.stringify(this.usageData));
  }

  async upgradeTier(newTier) {
    if (!this.tierLimits[newTier]) {
      return false;
    }
    
    try {
      console.log(`Upgrading customer to ${newTier} tier`);
      
      // Update local data
      this.currentTier = newTier;
      this.usageData.monthlyGenerations = 0; // Reset usage on upgrade
      
      // Store updated data
      if (this.customer && this.customer.id) {
        localStorage.setItem(`piccatso_usage_${this.customer.id}`, JSON.stringify(this.usageData));
        
        // Update localStorage for dashboard compatibility
        const userData = JSON.parse(localStorage.getItem('piccatso_user') || '{}');
        userData.tier = newTier;
        localStorage.setItem('piccatso_user', JSON.stringify(userData));
      }
      
      this.updateUI();
      
      // Show success message
      this.showNotification(`Successfully upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} Tier!`, 'success');
      
      // Refresh the page to update all components
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return true;
    } catch (error) {
      console.error('Error upgrading tier:', error);
      this.showNotification('Failed to upgrade plan. Please try again.', 'error');
      return false;
    }
  }

  canGenerateArt() {
    const limit = this.tierLimits[this.currentTier].monthlyGenerations;
    return this.usageData.monthlyGenerations < limit;
  }

  async recordArtGeneration() {
    if (this.canGenerateArt()) {
      this.usageData.monthlyGenerations++;
      await this.saveUsageData();
      this.updateUI();
      return true;
    }
    return false;
  }

  getUsagePercentage() {
    const limit = this.tierLimits[this.currentTier].monthlyGenerations;
    return Math.round((this.usageData.monthlyGenerations / limit) * 100);
  }

  getRemainingGenerations() {
    const limit = this.tierLimits[this.currentTier].monthlyGenerations;
    return Math.max(0, limit - this.usageData.monthlyGenerations);
  }

  hasFeature(feature) {
    return this.tierLimits[this.currentTier].features[feature] || false;
  }

  getPrintDiscount() {
    return this.tierLimits[this.currentTier].features.printDiscount;
  }

  updateUI() {
    // Update tier display
    const tierElements = document.querySelectorAll('.current-tier');
    tierElements.forEach(el => {
      el.textContent = this.currentTier.charAt(0).toUpperCase() + this.currentTier.slice(1);
      el.className = `current-tier tier-${this.currentTier}`;
    });

    // Update usage progress
    const progressBars = document.querySelectorAll('.usage-progress');
    progressBars.forEach(bar => {
      const percentage = this.getUsagePercentage();
      bar.style.width = `${percentage}%`;
      bar.className = `usage-progress ${percentage > 80 ? 'warning' : ''}`;
    });

    // Update usage text
    const usageTexts = document.querySelectorAll('.usage-text');
    usageTexts.forEach(text => {
      text.textContent = `${this.usageData.monthlyGenerations} / ${this.tierLimits[this.currentTier].monthlyGenerations} used`;
    });

    // Update remaining generations
    const remainingElements = document.querySelectorAll('#remaining-generations');
    remainingElements.forEach(el => {
      el.textContent = this.getRemainingGenerations();
    });

    // Show/hide Pro benefits
    const proBenefits = document.getElementById('pro-benefits');
    if (proBenefits) {
      proBenefits.style.display = this.currentTier === 'pro' ? 'block' : 'none';
    }

    // Update feature availability
    this.updateFeatureAvailability();
  }

  updateFeatureAvailability() {
    const features = this.tierLimits[this.currentTier].features;
    
    // Update download options
    const downloadOptions = document.querySelectorAll('.download-option');
    downloadOptions.forEach(option => {
      const isWatermarked = option.classList.contains('watermarked');
      if (isWatermarked && !features.watermarkedDownloads) {
        option.style.display = 'none';
      } else if (!isWatermarked && features.watermarkedDownloads) {
        option.style.display = 'none';
      }
    });

    // Update upgrade prompts
    this.showUpgradePrompts();
  }

  showUpgradePrompts() {
    const usagePercentage = this.getUsagePercentage();
    
    if (usagePercentage > 80) {
      this.showUpgradeModal('You\'re approaching your monthly limit!');
    }
  }

  showUpgradeModal(message) {
    // Create upgrade modal if it doesn't exist
    let modal = document.getElementById('upgrade-modal');
    if (!modal) {
      modal = this.createUpgradeModal();
      document.body.appendChild(modal);
    }
    
    modal.querySelector('.modal-message').textContent = message;
    modal.style.display = 'flex';
  }

  createUpgradeModal() {
    const modal = document.createElement('div');
    modal.id = 'upgrade-modal';
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Upgrade Your Plan</h3>
        <p class="modal-message"></p>
        <div class="upgrade-options">
          <div class="upgrade-option premium">
            <h4>Premium - $9.99/month</h4>
            <ul>
              <li>100 generations/month</li>
              <li>Art history & favorites</li>
              <li>High resolution downloads</li>
            </ul>
            <button onclick="subscriptionManager.upgradeTier('premium')">Upgrade to Premium</button>
          </div>
          <div class="upgrade-option pro">
            <h4>Pro - $39.99/month</h4>
            <ul>
              <li>1000 generations/month</li>
              <li>Clean downloads (no watermark)</li>
              <li>Commercial rights</li>
              <li>10% print discount</li>
            </ul>
            <button onclick="subscriptionManager.upgradeTier('pro')">Upgrade to Pro</button>
          </div>
        </div>
        <button class="close-modal" onclick="this.closest('.upgrade-modal').style.display='none'">Close</button>
      </div>
    `;
    
    return modal;
  }

  // Integration with existing Printful system
  applyPrintDiscount(originalPrice) {
    const discount = this.getPrintDiscount();
    if (discount > 0) {
      return originalPrice * (1 - discount / 100);
    }
    return originalPrice;
  }

  // Art storage management
  canStoreArt() {
    const limit = this.tierLimits[this.currentTier].storageLimit;
    if (limit === -1) return true; // Unlimited
    return this.usageData.storageUsed < limit;
  }

  async storeArt(artData) {
    if (this.canStoreArt()) {
      // Store art in Shopify file storage
      const stored = await this.saveArtToShopify(artData);
      if (stored) {
        this.usageData.storageUsed++;
        await this.saveUsageData();
      }
      return stored;
    }
    return false;
  }

  async saveArtToShopify(artData) {
    try {
      // This would integrate with Shopify's file upload API
      // For now, we'll store metadata and reference to the art
      const artMetadata = {
        id: Date.now(),
        url: artData.url,
        style: artData.style,
        timestamp: new Date().toISOString(),
        tier: this.currentTier
      };
      
      // Store in customer metafields
      await this.setCustomerMetafield('artwork', `art_${artMetadata.id}`, JSON.stringify(artMetadata));
      return true;
    } catch (error) {
      console.error('Error saving art to Shopify:', error);
      return false;
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-weight: 600;
      max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

// Initialize subscription manager when page loads
document.addEventListener('DOMContentLoaded', function() {
  window.subscriptionManager = new PiccatsoSubscriptionManager();
});

// Export for use in other modules
window.PiccatsoSubscriptionManager = PiccatsoSubscriptionManager;