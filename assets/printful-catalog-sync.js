/**
 * Printful Catalog Sync for Piccatso Integration
 * Fetches real product catalog from Printful API and updates local configuration
 */

class PrintfulCatalogSync {
  constructor() {
    this.baseUrl = 'https://api.printful.com';
    this.apiKey = window.PrintfulCredentials?.api_key;
    this.productMapping = new Map();
    this.init();
  }

  init() {
    if (!this.apiKey || this.apiKey === 'YOUR_PRINTFUL_API_KEY_HERE') {
      console.warn('⚠️ Printful API key not configured');
      return;
    }
    
    console.log('🔄 Initializing Printful catalog sync...');
    this.syncProductCatalog();
  }

  /**
   * Get headers for API requests
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Piccatso-Shopify-Integration/1.0'
    };
  }

  /**
   * Sync product catalog from Printful
   */
  async syncProductCatalog() {
    try {
      console.log('📦 Fetching Printful product catalog...');
      
      // Get all products from Printful catalog
      const catalogResponse = await fetch(`${this.baseUrl}/products`, {
        headers: this.getHeaders()
      });

      if (!catalogResponse.ok) {
        throw new Error(`Catalog API error: ${catalogResponse.status} ${catalogResponse.statusText}`);
      }

      const catalogData = await catalogResponse.json();
      console.log('✅ Printful catalog loaded:', catalogData.result?.length, 'products');

      // Filter and map relevant products
      await this.mapRelevantProducts(catalogData.result || []);
      
      // Update the POD interface with real product data
      this.updatePODInterface();
      
    } catch (error) {
      console.error('❌ Failed to sync Printful catalog:', error);
      // Fall back to placeholder data
      this.useLocalProductData();
    }
  }

  /**
   * Map relevant products for art prints
   */
  async mapRelevantProducts(products) {
    const relevantProducts = {
      canvas: [],
      poster: [],
      metal: [],
      framed: []
    };

    // Define product type keywords to look for
    const productKeywords = {
      canvas: ['canvas', 'gallery wrap'],
      poster: ['poster', 'print', 'paper'],
      metal: ['metal', 'aluminum'],
      framed: ['framed', 'frame']
    };

    for (const product of products) {
      const productName = product.name.toLowerCase();
      const productType = product.type.toLowerCase();

      // Categorize products based on keywords
      for (const [category, keywords] of Object.entries(productKeywords)) {
        if (keywords.some(keyword => 
          productName.includes(keyword) || productType.includes(keyword)
        )) {
          // Get detailed product info including variants
          try {
            const productDetails = await this.getProductDetails(product.id);
            if (productDetails) {
              relevantProducts[category].push({
                id: product.id,
                name: product.name,
                type: product.type,
                details: productDetails
              });
            }
          } catch (error) {
            console.warn(`Failed to get details for product ${product.id}:`, error);
          }
          break; // Only categorize in first matching category
        }
      }
    }

    this.productMapping = relevantProducts;
    console.log('🎨 Mapped art print products:', {
      canvas: relevantProducts.canvas.length,
      poster: relevantProducts.poster.length,
      metal: relevantProducts.metal.length,
      framed: relevantProducts.framed.length
    });
  }

  /**
   * Get detailed product information including variants
   */
  async getProductDetails(productId) {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.warn(`Failed to get product details for ${productId}:`, error);
      return null;
    }
  }

  /**
   * Update POD interface with real Printful product data
   */
  updatePODInterface() {
    // Create size configurations based on real Printful data
    const sizeConfigs = this.generateSizeConfigs();
    
    // Update the global size configurations
    if (window.updatePODSizeConfigs) {
      window.updatePODSizeConfigs(sizeConfigs);
      console.log('✅ POD interface updated with real Printful data');
    } else {
      // Store for later use
      window.PrintfulSizeConfigs = sizeConfigs;
      console.log('📝 Printful size configs stored for POD interface');
    }
  }

  /**
   * Generate size configurations from Printful data
   */
  generateSizeConfigs() {
    const configs = {
      canvas: [],
      poster: [],
      metal: [],
      framed: []
    };

    for (const [category, products] of Object.entries(this.productMapping)) {
      for (const product of products) {
        if (product.details?.variants) {
          for (const variant of product.details.variants) {
            // Extract size information
            const size = this.extractSizeInfo(variant);
            if (size) {
              // Calculate customer price with 100% markup
              const baseCost = parseFloat(variant.price) || 0;
              const customerPrice = Math.ceil(baseCost * 2); // 100% markup, rounded up

              configs[category].push({
                id: size.id,
                name: size.name,
                dimensions: size.dimensions,
                price: customerPrice,
                baseCost: baseCost,
                printfulVariantId: variant.id,
                printfulProductId: product.id
              });
            }
          }
        }
      }
    }

    // Remove duplicates and sort by price
    for (const category of Object.keys(configs)) {
      configs[category] = this.removeDuplicatesAndSort(configs[category]);
    }

    return configs;
  }

  /**
   * Extract size information from Printful variant
   */
  extractSizeInfo(variant) {
    const name = variant.name || '';
    const size = variant.size || '';
    
    // Common size mappings
    const sizeMap = {
      '8.3″ × 11.7″': { id: 'a4', name: 'A4', dimensions: '8.3" × 11.7"' },
      '11.7″ × 16.5″': { id: 'a3', name: 'A3', dimensions: '11.7" × 16.5"' },
      '16.5″ × 23.4″': { id: 'a2', name: 'A2', dimensions: '16.5" × 23.4"' },
      '12″ × 16″': { id: '12x16', name: '12" × 16"', dimensions: '12" × 16"' },
      '18″ × 24″': { id: '18x24', name: '18" × 24"', dimensions: '18" × 24"' },
      '24″ × 36″': { id: '24x36', name: '24" × 36"', dimensions: '24" × 36"' }
    };

    // Try to match size from variant info
    for (const [sizeString, sizeInfo] of Object.entries(sizeMap)) {
      if (name.includes(sizeString) || size.includes(sizeString) ||
          name.includes(sizeInfo.dimensions) || size.includes(sizeInfo.dimensions)) {
        return sizeInfo;
      }
    }

    // If no standard size found, try to extract custom size
    const dimensionMatch = (name + ' ' + size).match(/(\d+(?:\.\d+)?)[″"]?\s*[×x]\s*(\d+(?:\.\d+)?)[″"]?/);
    if (dimensionMatch) {
      const width = dimensionMatch[1];
      const height = dimensionMatch[2];
      return {
        id: `${width}x${height}`,
        name: `${width}" × ${height}"`,
        dimensions: `${width}" × ${height}"`
      };
    }

    return null;
  }

  /**
   * Remove duplicates and sort by price
   */
  removeDuplicatesAndSort(items) {
    const unique = items.filter((item, index, self) => 
      index === self.findIndex(i => i.id === item.id)
    );
    
    return unique.sort((a, b) => a.price - b.price);
  }

  /**
   * Use local placeholder data if API fails
   */
  useLocalProductData() {
    console.log('📝 Using local placeholder product data');
    
    // This matches the data structure in pod-interface.liquid
    const localConfigs = {
      canvas: [
        { id: 'a4', name: 'A4', dimensions: '8.3" × 11.7"', price: 43.00, baseCost: 21.50 },
        { id: 'a3', name: 'A3', dimensions: '11.7" × 16.5"', price: 57.00, baseCost: 28.50 },
        { id: 'a2', name: 'A2', dimensions: '16.5" × 23.4"', price: 85.00, baseCost: 42.50 },
        { id: '12x16', name: '12" × 16"', dimensions: '12" × 16"', price: 71.00, baseCost: 35.50 },
        { id: '18x24', name: '18" × 24"', dimensions: '18" × 24"', price: 99.00, baseCost: 49.50 },
        { id: '24x36', name: '24" × 36"', dimensions: '24" × 36"', price: 143.00, baseCost: 71.50 }
      ],
      // ... other product types with placeholder data
    };

    window.PrintfulSizeConfigs = localConfigs;
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      console.log('🔌 Testing Printful API connection...');
      
      const response = await fetch(`${this.baseUrl}/store/products`, {
        headers: this.getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Printful API connection successful');
        console.log('📊 Store has', data.result?.length || 0, 'products');
        return true;
      } else {
        console.error('❌ API connection failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ API connection error:', error);
      return false;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (window.PrintfulCredentials?.isConfigured()) {
    window.PrintfulCatalog = new PrintfulCatalogSync();
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PrintfulCatalogSync;
}
