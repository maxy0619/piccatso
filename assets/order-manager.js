/**
 * Piccatso Order Management System
 * Handles order history, tracking, and Printful integration
 */

class PiccatsoOrderManager {
  constructor(subscriptionManager) {
    this.subscriptionManager = subscriptionManager;
    this.orders = [];
    this.currentFilter = 'all';
  }

  async init() {
    await this.loadOrderHistory();
    this.updateUI();
  }

  async loadOrderHistory() {
    try {
      // Load orders from Shopify customer orders
      const response = await fetch('/account/orders.json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.orders = this.parseOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading order history:', error);
    }
  }

  parseOrders(shopifyOrders) {
    return shopifyOrders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at,
      totalPrice: order.total_price,
      currency: order.currency,
      status: this.mapOrderStatus(order.fulfillment_status),
      lineItems: order.line_items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        properties: item.properties || {},
        image: item.image,
        // Extract Printful-specific data
        printfulProductId: item.properties['printful_product_id'],
        printfulVariantId: item.properties['printful_variant_id'],
        designUrl: item.properties['design_url'],
        piccatsoStyle: item.properties['piccatso_style'],
        subscriptionTier: item.properties['piccatso_subscription_tier'],
        discountApplied: item.properties['piccatso_discount_applied']
      })),
      shippingAddress: order.shipping_address,
      trackingInfo: this.extractTrackingInfo(order.fulfillments)
    }));
  }

  mapOrderStatus(fulfillmentStatus) {
    switch (fulfillmentStatus) {
      case 'fulfilled': return 'shipped';
      case 'partial': return 'processing';
      case 'null': return 'pending';
      default: return 'pending';
    }
  }

  extractTrackingInfo(fulfillments) {
    if (!fulfillments || fulfillments.length === 0) return null;
    
    const fulfillment = fulfillments[0];
    return {
      trackingNumber: fulfillment.tracking_number,
      trackingUrl: fulfillment.tracking_url,
      carrier: fulfillment.tracking_company,
      status: fulfillment.status
    };
  }

  filterOrders(filter) {
    this.currentFilter = filter;
    this.updateUI();
  }

  updateUI() {
    const orderHistory = document.getElementById('order-history');
    if (!orderHistory) return;

    const filteredOrders = this.getFilteredOrders();
    
    if (filteredOrders.length === 0) {
      orderHistory.innerHTML = this.getEmptyStateHTML();
      return;
    }

    orderHistory.innerHTML = filteredOrders.map(order => this.createOrderCard(order)).join('');
  }

  getFilteredOrders() {
    if (this.currentFilter === 'all') {
      return this.orders;
    }
    
    return this.orders.filter(order => order.status === this.currentFilter);
  }

  getEmptyStateHTML() {
    if (this.currentFilter === 'all') {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <p>No orders yet.<br>Your print orders will appear here!</p>
          <a href="/" class="action-button">Start Creating Art</a>
        </div>
      `;
    } else {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <p>No ${this.currentFilter} orders found.</p>
        </div>
      `;
    }
  }

  createOrderCard(order) {
    const statusIcon = this.getStatusIcon(order.status);
    const statusColor = this.getStatusColor(order.status);
    
    return `
      <div class="order-card" data-order-id="${order.id}">
        <div class="order-header">
          <div class="order-info">
            <h4>Order #${order.orderNumber}</h4>
            <p class="order-date">${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="order-status" style="color: ${statusColor}">
            ${statusIcon} ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>
        
        <div class="order-items">
          ${order.lineItems.map(item => this.createOrderItem(item)).join('')}
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <strong>Total: ${order.currency} ${(order.totalPrice / 100).toFixed(2)}</strong>
          </div>
          <div class="order-actions">
            ${this.createOrderActions(order)}
          </div>
        </div>
        
        ${order.trackingInfo ? this.createTrackingInfo(order.trackingInfo) : ''}
      </div>
    `;
  }

  createOrderItem(item) {
    const hasDiscount = item.discountApplied && parseFloat(item.discountApplied) > 0;
    
    return `
      <div class="order-item">
        <div class="item-image">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" loading="lazy">` : '<div class="no-image">🎨</div>'}
        </div>
        <div class="item-details">
          <h5>${item.title}</h5>
          <p class="item-quantity">Quantity: ${item.quantity}</p>
          ${item.piccatsoStyle ? `<p class="item-style">Style: ${item.piccatsoStyle}</p>` : ''}
          ${hasDiscount ? `<p class="item-discount">Pro Discount: ${item.discountApplied}%</p>` : ''}
        </div>
        <div class="item-price">
          ${item.currency} ${(item.price / 100).toFixed(2)}
        </div>
      </div>
    `;
  }

  createOrderActions(order) {
    let actions = '';
    
    if (order.status === 'shipped' && order.trackingInfo) {
      actions += `<a href="${order.trackingInfo.trackingUrl}" target="_blank" class="track-button">Track Package</a>`;
    }
    
    if (order.status === 'delivered') {
      actions += `<button onclick="reorderItems('${order.id}')" class="reorder-button">Reorder</button>`;
    }
    
    return actions;
  }

  createTrackingInfo(trackingInfo) {
    return `
      <div class="tracking-info">
        <h5>📦 Tracking Information</h5>
        <p><strong>Carrier:</strong> ${trackingInfo.carrier || 'Unknown'}</p>
        <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
        ${trackingInfo.trackingUrl ? `<a href="${trackingInfo.trackingUrl}" target="_blank" class="track-link">Track Package</a>` : ''}
      </div>
    `;
  }

  getStatusIcon(status) {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'shipped': return '🚚';
      case 'delivered': return '✅';
      default: return '📦';
    }
  }

  getStatusColor(status) {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      default: return '#64748b';
    }
  }

  // Integration with artwork manager for reordering
  async reorderItems(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    // Find items that can be reordered (have design URLs)
    const reorderableItems = order.lineItems.filter(item => item.designUrl);
    
    if (reorderableItems.length === 0) {
      alert('No items available for reorder.');
      return;
    }

    // Add items to cart
    for (const item of reorderableItems) {
      await this.addToCart(item);
    }

    // Redirect to cart
    window.location.href = '/cart';
  }

  async addToCart(item) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          quantity: item.quantity,
          properties: item.properties
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }
}

// Global functions for order management
window.filterOrders = function(filter) {
  if (window.orderManager) {
    window.orderManager.filterOrders(filter);
  }
};

window.reorderItems = function(orderId) {
  if (window.orderManager) {
    window.orderManager.reorderItems(orderId);
  }
};

// Initialize order manager when page loads
document.addEventListener('DOMContentLoaded', function() {
  if (window.subscriptionManager) {
    window.orderManager = new PiccatsoOrderManager(window.subscriptionManager);
    window.orderManager.init();
  }
});

// Export for use in other modules
window.PiccatsoOrderManager = PiccatsoOrderManager;
