/**
 * Piccatso Artwork Management System
 * Handles artwork storage, retrieval, and tier-based access control
 */

class PiccatsoArtworkManager {
  constructor(subscriptionManager) {
    this.subscriptionManager = subscriptionManager;
    this.artworkStorage = [];
    this.maxStorage = {
      free: 0, // No storage for free tier
      premium: 50, // Last 50 creations
      pro: -1 // Unlimited
    };
  }

  async init() {
    await this.loadStoredArtwork();
    this.updateUI();
  }

  async loadStoredArtwork() {
    try {
      // Load artwork from customer metafields
      const response = await fetch('/account/metafields', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.artworkStorage = this.parseArtworkMetafields(data.metafields || {});
      }
    } catch (error) {
      console.error('Error loading artwork:', error);
    }
  }

  parseArtworkMetafields(metafields) {
    const artwork = [];
    for (const [key, metafield] of Object.entries(metafields)) {
      if (key.startsWith('artwork.art_')) {
        try {
          const artData = JSON.parse(metafield.value);
          artwork.push(artData);
        } catch (error) {
          console.error('Error parsing artwork data:', error);
        }
      }
    }
    return artwork.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async saveArtwork(artData) {
    const currentTier = this.subscriptionManager?.currentTier || 'free';
    const maxStorage = this.maxStorage[currentTier];

    // Check storage limits
    if (maxStorage !== -1 && this.artworkStorage.length >= maxStorage) {
      if (currentTier === 'free') {
        throw new Error('Artwork storage not available on Free tier. Upgrade to save your creations!');
      } else {
        // Remove oldest artwork for premium tier
        await this.removeOldestArtwork();
      }
    }

    const artwork = {
      id: `art_${Date.now()}`,
      url: artData.url,
      style: artData.style,
      prompt: artData.prompt,
      timestamp: new Date().toISOString(),
      tier: currentTier,
      metadata: artData.metadata || {}
    };

    try {
      // Save to Shopify metafields
      const response = await fetch('/account/metafields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          metafield: {
            namespace: 'artwork',
            key: artwork.id,
            value: JSON.stringify(artwork),
            type: 'json'
          }
        })
      });

      if (response.ok) {
        this.artworkStorage.unshift(artwork);
        this.updateUI();
        return artwork;
      } else {
        throw new Error('Failed to save artwork');
      }
    } catch (error) {
      console.error('Error saving artwork:', error);
      throw error;
    }
  }

  async removeOldestArtwork() {
    if (this.artworkStorage.length > 0) {
      const oldest = this.artworkStorage.pop();
      await this.deleteArtwork(oldest.id);
    }
  }

  async deleteArtwork(artworkId) {
    try {
      const response = await fetch('/account/metafields', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          namespace: 'artwork',
          key: artworkId
        })
      });

      if (response.ok) {
        this.artworkStorage = this.artworkStorage.filter(art => art.id !== artworkId);
        this.updateUI();
        return true;
      }
    } catch (error) {
      console.error('Error deleting artwork:', error);
    }
    return false;
  }

  getArtworkByTier() {
    const currentTier = this.subscriptionManager?.currentTier || 'free';
    const maxStorage = this.maxStorage[currentTier];

    if (maxStorage === -1) {
      return this.artworkStorage; // Unlimited for Pro
    } else if (maxStorage === 0) {
      return []; // No storage for Free
    } else {
      return this.artworkStorage.slice(0, maxStorage); // Limited for Premium
    }
  }

  updateUI() {
    this.updateArtworkGrid();
    this.updateStorageStats();
  }

  updateArtworkGrid() {
    const grid = document.getElementById('artwork-grid');
    if (!grid) return;

    const availableArtwork = this.getArtworkByTier();
    const currentTier = this.subscriptionManager?.currentTier || 'free';

    if (availableArtwork.length === 0) {
      grid.innerHTML = this.getEmptyStateHTML(currentTier);
      return;
    }

    grid.innerHTML = availableArtwork.map(artwork => this.createArtworkCard(artwork)).join('');
  }

  getEmptyStateHTML(tier) {
    if (tier === 'free') {
      return `
        <div class="empty-state">
          <div class="empty-icon">🎨</div>
          <h3>No Saved Artwork</h3>
          <p>Free tier doesn't include artwork storage. Upgrade to save your creations!</p>
          <button onclick="showUpgradeOptions()" class="upgrade-button">
            Upgrade to Save Artwork
          </button>
        </div>
      `;
    } else {
      return `
        <div class="empty-state">
          <div class="empty-icon">🎨</div>
          <h3>No Artwork Yet</h3>
          <p>Start creating amazing art to see it here!</p>
          <a href="/" class="create-button">Start Creating</a>
        </div>
      `;
    }
  }

  createArtworkCard(artwork) {
    const canDownload = this.subscriptionManager?.hasFeature('watermarkedDownloads') || false;
    const isWatermarked = this.subscriptionManager?.currentTier !== 'pro';
    
    return `
      <div class="artwork-card" data-artwork-id="${artwork.id}">
        <div class="artwork-image">
          <img src="${artwork.url}" alt="${artwork.style}" loading="lazy">
          <div class="artwork-overlay">
            <button class="download-btn" onclick="downloadArtwork('${artwork.id}')" ${!canDownload ? 'disabled' : ''}>
              ${isWatermarked ? '📷 Download (Watermarked)' : '⬇️ Download'}
            </button>
            <button class="delete-btn" onclick="deleteArtwork('${artwork.id}')">🗑️</button>
          </div>
        </div>
        <div class="artwork-info">
          <h4>${artwork.style}</h4>
          <p class="artwork-date">${new Date(artwork.timestamp).toLocaleDateString()}</p>
          <p class="artwork-prompt">${artwork.prompt || 'No prompt available'}</p>
        </div>
      </div>
    `;
  }

  updateStorageStats() {
    const currentTier = this.subscriptionManager?.currentTier || 'free';
    const maxStorage = this.maxStorage[currentTier];
    const usedStorage = this.artworkStorage.length;

    const storageElements = document.querySelectorAll('.storage-stats');
    storageElements.forEach(element => {
      if (maxStorage === -1) {
        element.innerHTML = `
          <div class="storage-info">
            <span class="storage-used">${usedStorage} artworks saved</span>
            <span class="storage-limit">Unlimited storage</span>
          </div>
        `;
      } else if (maxStorage === 0) {
        element.innerHTML = `
          <div class="storage-info">
            <span class="storage-used">No storage available</span>
            <span class="storage-limit">Upgrade to save artwork</span>
          </div>
        `;
      } else {
        const percentage = Math.round((usedStorage / maxStorage) * 100);
        element.innerHTML = `
          <div class="storage-info">
            <span class="storage-used">${usedStorage} / ${maxStorage} artworks</span>
            <div class="storage-progress">
              <div class="storage-progress-bar" style="width: ${percentage}%"></div>
            </div>
          </div>
        `;
      }
    });
  }

  // Integration with Printful for print orders
  async createPrintOrder(artworkId, printOptions) {
    const artwork = this.artworkStorage.find(art => art.id === artworkId);
    if (!artwork) {
      throw new Error('Artwork not found');
    }

    // Apply Pro tier discount if applicable
    const discount = this.subscriptionManager?.getPrintDiscount() || 0;
    const discountedPrice = this.subscriptionManager?.applyPrintDiscount(printOptions.price) || printOptions.price;

    const orderData = {
      artwork: artwork,
      printOptions: {
        ...printOptions,
        price: discountedPrice,
        discount: discount
      },
      customer: {
        id: window.Shopify?.customer?.id,
        email: window.Shopify?.customer?.email
      }
    };

    // This would integrate with your existing Printful system
    return await this.submitPrintOrder(orderData);
  }

  async submitPrintOrder(orderData) {
    try {
      // Use your existing Printful integration
      if (window.PicatsoPODIntegration) {
        const podIntegration = new window.PicatsoPODIntegration({
          apiKey: window.PrintfulCredentials?.api_key,
          baseUrl: window.PrintfulCredentials?.endpoints?.base_url,
          markupPercentage: window.PrintfulCredentials?.markup_percentage || 100
        });

        return await podIntegration.createShopifyIntegratedOrder(orderData);
      } else {
        throw new Error('Printful integration not available');
      }
    } catch (error) {
      console.error('Error creating print order:', error);
      throw error;
    }
  }
}

// Global functions for artwork management
window.downloadArtwork = async function(artworkId) {
  if (window.artworkManager) {
    const artwork = window.artworkManager.artworkStorage.find(art => art.id === artworkId);
    if (artwork) {
      // Create download link
      const link = document.createElement('a');
      link.href = artwork.url;
      link.download = `piccatso-${artwork.style}-${artwork.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

window.deleteArtwork = async function(artworkId) {
  if (window.artworkManager && confirm('Are you sure you want to delete this artwork?')) {
    await window.artworkManager.deleteArtwork(artworkId);
  }
};

// Initialize artwork manager when page loads
document.addEventListener('DOMContentLoaded', function() {
  if (window.subscriptionManager) {
    window.artworkManager = new PiccatsoArtworkManager(window.subscriptionManager);
    window.artworkManager.init();
  }
});

// Export for use in other modules
window.PiccatsoArtworkManager = PiccatsoArtworkManager;
