/**
 * Print-on-Demand Integration Module for Piccatso
 * Handles mockup generation, pricing, and order fulfillment
 */

class PicatsoPODIntegration {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.markupPercentage = config.markupPercentage || 40;
    this.podService = config.service || 'printful'; // printful, printify, gooten
  }

  /**
   * Generate product mockups for different sizes and environments
   */
  async generateMockups(imageUrl, productType = 'canvas') {
    const sizes = [
      { id: 'a4', name: 'A4 (8.3" x 11.7")', width: 210, height: 297 },
      { id: 'a3', name: 'A3 (11.7" x 16.5")', width: 297, height: 420 },
      { id: 'a2', name: 'A2 (16.5" x 23.4")', width: 420, height: 594 },
      { id: '12x16', name: '12" x 16"', width: 304, height: 406 },
      { id: '18x24', name: '18" x 24"', width: 457, height: 610 },
      { id: '24x36', name: '24" x 36"', width: 610, height: 914 }
    ];

    const environments = [
      { id: 'living_room', name: 'Living Room', template: 'living-room-template' },
      { id: 'bedroom', name: 'Bedroom', template: 'bedroom-template' },
      { id: 'office', name: 'Office', template: 'office-template' },
      { id: 'gallery', name: 'Gallery Wall', template: 'gallery-template' }
    ];

    const mockups = [];

    for (const size of sizes) {
      for (const environment of environments) {
        try {
          const mockup = await this.createMockup({
            imageUrl,
            size,
            environment,
            productType
          });
          mockups.push(mockup);
        } catch (error) {
          console.error(`Failed to create mockup for ${size.id} in ${environment.id}:`, error);
        }
      }
    }

    return mockups;
  }

  /**
   * Create individual mockup using POD service API
   */
  async createMockup({ imageUrl, size, environment, productType }) {
    const endpoint = this.getAPIEndpoint('mockups');
    
    const requestData = {
      product_id: this.getProductId(productType, size.id),
      variant_ids: [this.getVariantId(productType, size.id)],
      files: [{
        placement: 'default',
        image_url: imageUrl,
        position: { area_width: size.width, area_height: size.height }
      }],
      options: [{
        id: 'template',
        value: environment.template
      }]
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`Mockup generation failed: ${response.statusText}`);
    }

    const mockupData = await response.json();
    
    return {
      id: mockupData.result.task_key,
      size: size,
      environment: environment,
      mockup_url: mockupData.result.mockups[0]?.mockup_url,
      product_type: productType
    };
  }

  /**
   * Get real-time pricing from POD service
   */
  async getPricing(productType, sizeId, quantity = 1) {
    const productId = this.getProductId(productType, sizeId);
    const variantId = this.getVariantId(productType, sizeId);
    
    const endpoint = this.getAPIEndpoint('products', productId);
    
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Pricing fetch failed: ${response.statusText}`);
    }

    const productData = await response.json();
    const variant = productData.result.variants.find(v => v.id === variantId);
    
    if (!variant) {
      throw new Error(`Variant ${variantId} not found`);
    }

    const baseCost = parseFloat(variant.price);
    const customerPrice = this.calculateCustomerPrice(baseCost);

    return {
      base_cost: baseCost,
      customer_price: customerPrice,
      profit_margin: customerPrice - baseCost,
      markup_percentage: this.markupPercentage,
      currency: variant.currency || 'USD'
    };
  }

  /**
   * Calculate customer price with markup
   */
  calculateCustomerPrice(baseCost) {
    const markup = baseCost * (this.markupPercentage / 100);
    return Math.ceil((baseCost + markup) * 100) / 100; // Round up to nearest cent
  }

  /**
   * Create order with POD service
   */
  async createOrder(orderData) {
    const endpoint = this.getAPIEndpoint('orders');
    
    const podOrderData = {
      external_id: orderData.shopify_order_id,
      recipient: {
        name: orderData.shipping_address.name,
        company: orderData.shipping_address.company,
        address1: orderData.shipping_address.address1,
        address2: orderData.shipping_address.address2,
        city: orderData.shipping_address.city,
        state_code: orderData.shipping_address.province_code,
        country_code: orderData.shipping_address.country_code,
        zip: orderData.shipping_address.zip,
        phone: orderData.shipping_address.phone,
        email: orderData.customer.email
      },
      items: orderData.line_items.map(item => ({
        external_id: item.id,
        variant_id: this.getVariantId(item.properties['Product Type'], item.properties['Size']),
        quantity: item.quantity,
        files: [{
          type: 'default',
          url: item.properties['Piccatso Render URL']
        }]
      }))
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(podOrderData)
    });

    if (!response.ok) {
      throw new Error(`Order creation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get API endpoint for different services
   */
  getAPIEndpoint(resource, id = '') {
    const endpoints = {
      printful: {
        base: 'https://api.printful.com',
        mockups: '/mockup-generator/create-task/1',
        products: `/store/products${id ? `/${id}` : ''}`,
        orders: '/orders'
      },
      printify: {
        base: 'https://api.printify.com/v1',
        mockups: '/mockups.json',
        products: `/catalog/products${id ? `/${id}` : ''}`,
        orders: '/orders.json'
      }
    };

    const serviceEndpoints = endpoints[this.podService];
    return `${serviceEndpoints.base}${serviceEndpoints[resource]}`;
  }

  /**
   * Map product types and sizes to POD service IDs
   */
  getProductId(productType, sizeId) {
    // Printful product IDs (example - needs to be updated with actual IDs)
    const productMap = {
      canvas: {
        'a4': 162,
        'a3': 163,
        'a2': 164,
        '12x16': 165,
        '18x24': 166,
        '24x36': 167
      },
      poster: {
        'a4': 1,
        'a3': 2,
        'a2': 3,
        '12x16': 4,
        '18x24': 5,
        '24x36': 6
      }
    };

    return productMap[productType]?.[sizeId] || productMap.canvas.a4;
  }

  /**
   * Map product variants to POD service variant IDs
   */
  getVariantId(productType, sizeId) {
    // Printful variant IDs (example - needs to be updated with actual IDs)
    const variantMap = {
      canvas: {
        'a4': 5678,
        'a3': 5679,
        'a2': 5680,
        '12x16': 5681,
        '18x24': 5682,
        '24x36': 5683
      },
      poster: {
        'a4': 1234,
        'a3': 1235,
        'a2': 1236,
        '12x16': 1237,
        '18x24': 1238,
        '24x36': 1239
      }
    };

    return variantMap[productType]?.[sizeId] || variantMap.canvas.a4;
  }
}

// Initialize POD integration when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // This will be configured with actual credentials
  window.PicatsoPOD = new PicatsoPODIntegration({
    service: 'printful', // Will be configurable
    apiKey: 'YOUR_API_KEY', // Will be set from Shopify settings
    markupPercentage: 40
  });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PicatsoPODIntegration;
}
