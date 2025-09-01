/**
 * Piccatso POD Webhook Handler
 * Processes Shopify orders and sends them to print-on-demand service
 */

class PicatsoPODWebhookHandler {
  constructor() {
    this.webhookEndpoint = '/webhooks/orders/paid';
    this.init();
  }

  init() {
    // This would typically run on a server, not client-side
    // Included here for completeness of the integration
    console.log('POD Webhook Handler initialized');
  }

  /**
   * Process incoming Shopify order webhook
   */
  async processOrderWebhook(orderData) {
    try {
      console.log('Processing order:', orderData.order_number);
      
      // Check if order contains Piccatso items
      const piccatsoItems = this.identifyPiccatsoItems(orderData.line_items);
      
      if (piccatsoItems.length === 0) {
        console.log('No Piccatso items found in order');
        return;
      }

      // Process each Piccatso item
      for (const item of piccatsoItems) {
        await this.processPiccatsoItem(orderData, item);
      }

      console.log('Order processing completed');
    } catch (error) {
      console.error('Error processing order webhook:', error);
      // In production, this would send error notifications
    }
  }

  /**
   * Identify items that need POD fulfillment
   */
  identifyPiccatsoItems(lineItems) {
    return lineItems.filter(item => {
      // Check if item has Piccatso properties
      const properties = item.properties || [];
      return properties.some(prop => 
        prop.name === 'Piccatso Render URL' || 
        prop.name === 'Product Type'
      );
    });
  }

  /**
   * Process individual Piccatso item for POD fulfillment
   */
  async processPiccatsoItem(orderData, item) {
    try {
      // Extract POD-specific data from line item properties
      const podData = this.extractPODData(item);
      
      if (!podData.renderUrl || !podData.productType || !podData.size) {
        throw new Error('Missing required POD data');
      }

      // Create POD order
      const podOrder = await this.createPODOrder(orderData, item, podData);
      
      // Update Shopify order with POD tracking info
      await this.updateShopifyOrder(orderData.id, item.id, podOrder);
      
      console.log(`POD order created for item ${item.id}:`, podOrder.id);
      
    } catch (error) {
      console.error(`Error processing item ${item.id}:`, error);
      throw error;
    }
  }

  /**
   * Extract POD-specific data from line item properties
   */
  extractPODData(item) {
    const properties = item.properties || [];
    const podData = {};

    properties.forEach(prop => {
      switch (prop.name) {
        case 'Piccatso Render URL':
          podData.renderUrl = prop.value;
          break;
        case 'Product Type':
          podData.productType = prop.value;
          break;
        case 'Size':
          podData.size = prop.value;
          break;
        case 'Piccatso Style':
          podData.styleName = prop.value;
          break;
        case 'Piccatso Render ID':
          podData.renderId = prop.value;
          break;
      }
    });

    return podData;
  }

  /**
   * Create order with POD service
   */
  async createPODOrder(orderData, item, podData) {
    // Load POD configuration
    const podConfig = await this.loadPODConfig();
    
    // Initialize POD integration
    const podIntegration = new PicatsoPODIntegration({
      service: podConfig.service,
      apiKey: podConfig.api_settings.api_key,
      markupPercentage: podConfig.pricing.markup_percentage
    });

    // Prepare order data for POD service
    const podOrderData = {
      shopify_order_id: orderData.id,
      external_id: `piccatso-${orderData.order_number}-${item.id}`,
      recipient: {
        name: `${orderData.shipping_address.first_name} ${orderData.shipping_address.last_name}`,
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
      line_items: [{
        id: item.id,
        quantity: item.quantity,
        properties: {
          'Product Type': podData.productType,
          'Size': podData.size,
          'Piccatso Render URL': podData.renderUrl,
          'Piccatso Style': podData.styleName,
          'Piccatso Render ID': podData.renderId
        }
      }]
    };

    // Create the POD order
    return await podIntegration.createOrder(podOrderData);
  }

  /**
   * Update Shopify order with POD tracking information
   */
  async updateShopifyOrder(orderId, lineItemId, podOrder) {
    try {
      // In a real implementation, this would use Shopify Admin API
      // to add order notes or metafields with POD tracking info
      
      const trackingData = {
        pod_order_id: podOrder.result?.id || podOrder.id,
        pod_service: 'printful', // or whatever service was used
        status: 'submitted_to_pod',
        estimated_fulfillment: this.calculateEstimatedFulfillment(),
        created_at: new Date().toISOString()
      };

      // Store tracking data (implementation depends on your backend)
      await this.storePODTrackingData(orderId, lineItemId, trackingData);
      
      console.log('Shopify order updated with POD tracking:', trackingData);
      
    } catch (error) {
      console.error('Failed to update Shopify order:', error);
      // Don't throw - POD order was successful, tracking update is secondary
    }
  }

  /**
   * Calculate estimated fulfillment date
   */
  calculateEstimatedFulfillment() {
    const now = new Date();
    const productionDays = 2; // From POD settings
    const shippingDays = 5;   // From POD settings
    
    const totalDays = productionDays + shippingDays;
    const estimatedDate = new Date(now.getTime() + (totalDays * 24 * 60 * 60 * 1000));
    
    return estimatedDate.toISOString();
  }

  /**
   * Store POD tracking data for later reference
   */
  async storePODTrackingData(orderId, lineItemId, trackingData) {
    // In a real implementation, this would store in a database
    // For now, we'll use localStorage as a placeholder
    const storageKey = `pod_tracking_${orderId}_${lineItemId}`;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(trackingData));
    }
    
    console.log('POD tracking data stored:', storageKey, trackingData);
  }

  /**
   * Load POD configuration
   */
  async loadPODConfig() {
    try {
      // In production, this would load from your app's settings
      // For now, return default configuration
      return {
        service: 'printful',
        api_settings: {
          api_key: process.env.PRINTFUL_API_KEY || 'your-api-key-here',
          test_mode: true
        },
        pricing: {
          markup_percentage: 40,
          currency: 'USD'
        }
      };
    } catch (error) {
      console.error('Failed to load POD config:', error);
      throw new Error('POD configuration not available');
    }
  }

  /**
   * Handle POD service webhooks (order status updates)
   */
  async handlePODWebhook(webhookData) {
    try {
      console.log('Processing POD webhook:', webhookData.type);
      
      switch (webhookData.type) {
        case 'order_fulfilled':
          await this.handleOrderFulfilled(webhookData);
          break;
        case 'order_shipped':
          await this.handleOrderShipped(webhookData);
          break;
        case 'order_failed':
          await this.handleOrderFailed(webhookData);
          break;
        default:
          console.log('Unhandled POD webhook type:', webhookData.type);
      }
    } catch (error) {
      console.error('Error handling POD webhook:', error);
    }
  }

  /**
   * Handle order fulfilled webhook from POD service
   */
  async handleOrderFulfilled(webhookData) {
    const externalId = webhookData.order?.external_id;
    if (!externalId) return;

    // Extract Shopify order info from external ID
    const [, orderNumber, lineItemId] = externalId.split('-');
    
    // Update order status in Shopify
    // This would typically create a fulfillment in Shopify
    console.log(`Order ${orderNumber} item ${lineItemId} fulfilled by POD`);
  }

  /**
   * Handle order shipped webhook from POD service
   */
  async handleOrderShipped(webhookData) {
    const trackingNumber = webhookData.shipment?.tracking_number;
    const trackingUrl = webhookData.shipment?.tracking_url;
    
    if (trackingNumber) {
      // Update Shopify order with tracking information
      console.log(`Order shipped with tracking: ${trackingNumber}`);
      // Implementation would update Shopify fulfillment with tracking
    }
  }

  /**
   * Handle order failed webhook from POD service
   */
  async handleOrderFailed(webhookData) {
    const externalId = webhookData.order?.external_id;
    const reason = webhookData.reason || 'Unknown error';
    
    console.error(`POD order failed: ${externalId}, Reason: ${reason}`);
    
    // In production, this would:
    // 1. Notify customer service
    // 2. Potentially refund the customer
    // 3. Log the error for analysis
  }
}

// Initialize webhook handler
if (typeof window !== 'undefined') {
  window.PicatsoPODWebhookHandler = new PicatsoPODWebhookHandler();
}

// Export for server-side use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PicatsoPODWebhookHandler;
}
