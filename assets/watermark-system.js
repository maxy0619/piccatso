/**
 * Piccatso Watermark System
 * Applies watermarks based on subscription tier
 */

class PiccatsoWatermarkSystem {
  constructor() {
    this.subscription = window.PiccatsoSubscription;
    this.watermarkCanvas = null;
    this.watermarkContext = null;
    
    this.initializeWatermarkSystem();
  }

  /**
   * Initialize watermark system
   */
  initializeWatermarkSystem() {
    this.createWatermarkCanvas();
    this.setupDownloadInterception();
  }

  /**
   * Create watermark canvas for processing
   */
  createWatermarkCanvas() {
    this.watermarkCanvas = document.createElement('canvas');
    this.watermarkContext = this.watermarkCanvas.getContext('2d');
    
    // Hide the canvas
    this.watermarkCanvas.style.display = 'none';
    document.body.appendChild(this.watermarkCanvas);
  }

  /**
   * Setup download interception
   */
  setupDownloadInterception() {
    // Intercept all download attempts
    document.addEventListener('click', (event) => {
      const target = event.target;
      
      // Check if it's a download link or button
      if (target.matches('[data-download], .download-btn, [href*="download"]') ||
          target.closest('[data-download], .download-btn, [href*="download"]')) {
        
        event.preventDefault();
        this.handleDownloadRequest(target);
      }
    });

    // Override right-click save for images
    document.addEventListener('contextmenu', (event) => {
      const target = event.target;
      if (target.tagName === 'IMG' && target.classList.contains('generated-art')) {
        event.preventDefault();
        this.handleDownloadRequest(target);
      }
    });
  }

  /**
   * Handle download request
   */
  async handleDownloadRequest(element) {
    const imageUrl = this.extractImageUrl(element);
    const artworkId = element.dataset.artworkId || Date.now();
    
    if (!imageUrl) {
      this.showError('No image found to download');
      return;
    }

    // Check if user should get watermarked version
    const shouldWatermark = this.subscription.shouldWatermark();
    
    if (shouldWatermark) {
      await this.downloadWithWatermark(imageUrl, artworkId);
    } else {
      await this.downloadClean(imageUrl, artworkId);
    }
  }

  /**
   * Extract image URL from element
   */
  extractImageUrl(element) {
    // Try different methods to get image URL
    if (element.tagName === 'IMG') {
      return element.src;
    }
    
    if (element.dataset.imageUrl) {
      return element.dataset.imageUrl;
    }
    
    if (element.href && element.href.includes('image')) {
      return element.href;
    }
    
    // Look for image in nearby elements
    const img = element.querySelector('img') || element.closest('.artwork-item')?.querySelector('img');
    if (img) {
      return img.src;
    }
    
    return null;
  }

  /**
   * Download image with watermark
   */
  async downloadWithWatermark(imageUrl, artworkId) {
    try {
      this.showDownloadProgress('Preparing watermarked download...');
      
      const watermarkedBlob = await this.applyWatermark(imageUrl);
      const filename = `piccatso_artwork_${artworkId}_watermarked.png`;
      
      this.downloadBlob(watermarkedBlob, filename);
      this.hideDownloadProgress();
      
      // Show upgrade prompt for free users
      if (this.subscription.currentUser.tier === 'free') {
        setTimeout(() => {
          this.showUpgradePromptForCleanDownloads();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error creating watermarked download:', error);
      this.showError('Failed to prepare download. Please try again.');
      this.hideDownloadProgress();
    }
  }

  /**
   * Download clean image (Pro tier only)
   */
  async downloadClean(imageUrl, artworkId) {
    try {
      this.showDownloadProgress('Preparing clean download...');
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const filename = `piccatso_artwork_${artworkId}_clean.png`;
      
      this.downloadBlob(blob, filename);
      this.hideDownloadProgress();
      
    } catch (error) {
      console.error('Error downloading clean image:', error);
      this.showError('Failed to download image. Please try again.');
      this.hideDownloadProgress();
    }
  }

  /**
   * Apply watermark to image
   */
  async applyWatermark(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Set canvas size to match image
          this.watermarkCanvas.width = img.width;
          this.watermarkCanvas.height = img.height;
          
          // Clear canvas
          this.watermarkContext.clearRect(0, 0, img.width, img.height);
          
          // Draw original image
          this.watermarkContext.drawImage(img, 0, 0);
          
          // Apply watermark
          this.addWatermarkToCanvas(img.width, img.height);
          
          // Convert to blob
          this.watermarkCanvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create watermarked image'));
            }
          }, 'image/png', 0.9);
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * Add watermark to canvas
   */
  addWatermarkToCanvas(width, height) {
    const ctx = this.watermarkContext;
    
    // Save current state
    ctx.save();
    
    // Add semi-transparent overlay
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Reset alpha for text
    ctx.globalAlpha = 0.6;
    
    // Configure text style
    const fontSize = Math.max(width, height) * 0.08;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = fontSize * 0.05;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add main watermark
    const mainText = 'PICCATSO.AI';
    ctx.strokeText(mainText, width / 2, height / 2);
    ctx.fillText(mainText, width / 2, height / 2);
    
    // Add tier-specific text
    const tierText = this.getTierWatermarkText();
    const smallFontSize = fontSize * 0.4;
    ctx.font = `${smallFontSize}px Arial, sans-serif`;
    ctx.strokeText(tierText, width / 2, height / 2 + fontSize);
    ctx.fillText(tierText, width / 2, height / 2 + fontSize);
    
    // Add corner watermarks
    this.addCornerWatermarks(width, height, fontSize * 0.3);
    
    // Restore state
    ctx.restore();
  }

  /**
   * Get tier-specific watermark text
   */
  getTierWatermarkText() {
    const tier = this.subscription.currentUser.tier;
    
    switch (tier) {
      case 'free':
        return 'Upgrade to Premium to remove watermark';
      case 'premium':
        return 'Upgrade to Pro for clean downloads';
      default:
        return 'AI Generated Art';
    }
  }

  /**
   * Add corner watermarks
   */
  addCornerWatermarks(width, height, fontSize) {
    const ctx = this.watermarkContext;
    const padding = fontSize;
    
    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.globalAlpha = 0.3;
    
    // Top-left corner
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('PICCATSO', padding, padding);
    
    // Top-right corner
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('AI ART', width - padding, padding);
    
    // Bottom-left corner
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('DEMO', padding, height - padding);
    
    // Bottom-right corner
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('PICCATSO.AI', width - padding, height - padding);
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Show download progress
   */
  showDownloadProgress(message) {
    // Remove existing progress if any
    this.hideDownloadProgress();
    
    const progress = document.createElement('div');
    progress.id = 'download-progress';
    progress.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #8B5CF6;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 1rem;
    `;
    
    progress.innerHTML = `
      <div style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <span>${message}</span>
    `;
    
    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(progress);
  }

  /**
   * Hide download progress
   */
  hideDownloadProgress() {
    const progress = document.getElementById('download-progress');
    if (progress) {
      progress.remove();
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const error = document.createElement('div');
    error.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 1rem 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      z-index: 10000;
    `;
    error.textContent = message;
    
    document.body.appendChild(error);
    
    setTimeout(() => error.remove(), 3000);
  }

  /**
   * Show upgrade prompt for clean downloads
   */
  showUpgradePromptForCleanDownloads() {
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
      <div style="background: white; border-radius: 1rem; padding: 3rem; max-width: 500px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎨</div>
        <h3 style="margin: 0 0 1rem 0; color: #8B5CF6;">Want Clean Downloads?</h3>
        <p style="margin: 0 0 2rem 0; color: #64748b;">
          Upgrade to Pro tier to get watermark-free downloads and commercial usage rights!
        </p>
        
        <div style="background: #f8fafc; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 2rem;">
          <h4 style="margin: 0 0 1rem 0;">🎨 Pro Tier Benefits:</h4>
          <ul style="text-align: left; margin: 0; padding-left: 1.5rem;">
            <li>✅ Clean downloads (no watermark)</li>
            <li>✅ 1000 generations per month</li>
            <li>✅ Ultra HD resolution (2048x2048px)</li>
            <li>✅ Commercial usage rights</li>
            <li>✅ 10% discount on prints</li>
            <li>✅ Custom style training</li>
          </ul>
        </div>
        
        <div style="display: flex; gap: 1rem;">
          <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="flex: 1; padding: 1rem; background: #f1f5f9; border: none; border-radius: 0.5rem; cursor: pointer;">
            Maybe Later
          </button>
          <button onclick="window.location.href='/pages/account'; this.closest('div[style*=\"position: fixed\"]').remove();" style="flex: 1; padding: 1rem; background: #8B5CF6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
            Upgrade to Pro - $39.99/mo
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Create download button with tier-appropriate functionality
   */
  createDownloadButton(imageUrl, artworkId, options = {}) {
    const button = document.createElement('button');
    const shouldWatermark = this.subscription.shouldWatermark();
    
    button.className = 'download-btn';
    button.dataset.imageUrl = imageUrl;
    button.dataset.artworkId = artworkId;
    
    if (shouldWatermark) {
      button.innerHTML = `
        <span>📥 Download</span>
        <small style="display: block; font-size: 0.8em; opacity: 0.8;">
          ${this.subscription.currentUser.tier === 'free' ? 'Watermarked' : 'Watermarked - Upgrade for clean'}
        </small>
      `;
      button.title = 'Download watermarked version';
    } else {
      button.innerHTML = `
        <span>📥 Download HD</span>
        <small style="display: block; font-size: 0.8em; opacity: 0.8;">Clean version</small>
      `;
      button.title = 'Download clean HD version';
    }
    
    button.style.cssText = `
      background: ${shouldWatermark ? '#f59e0b' : '#10b981'};
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      ${options.style || ''}
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = 'none';
    });
    
    return button;
  }
}

// Initialize global watermark system
window.PiccatsoWatermark = new PiccatsoWatermarkSystem();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PiccatsoWatermarkSystem;
}

console.log('✅ Piccatso Watermark System loaded');
