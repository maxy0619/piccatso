/**
 * Printful Integration Test Suite
 * Standalone testing for Printful functionality without Piccatso dependency
 */

class PrintfulTester {
  constructor() {
    this.apiKey = window.PrintfulCredentials?.api_key;
    this.baseUrl = 'https://api.printful.com';
    this.testResults = [];
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting Printful integration tests...');
    
    const tests = [
      { name: 'API Connection', fn: () => this.testAPIConnection() },
      { name: 'Product Catalog', fn: () => this.testProductCatalog() },
      { name: 'Product Details', fn: () => this.testProductDetails() },
      { name: 'Pricing Calculation', fn: () => this.testPricingCalculation() },
      { name: 'Mockup Generation', fn: () => this.testMockupGeneration() }
    ];

    for (const test of tests) {
      try {
        console.log(`\n🔍 Testing: ${test.name}`);
        const result = await test.fn();
        this.logTestResult(test.name, true, result);
      } catch (error) {
        this.logTestResult(test.name, false, error.message);
      }
    }

    this.displayTestSummary();
  }

  /**
   * Test API connection
   */
  async testAPIConnection() {
    const response = await fetch(`${this.baseUrl}/store/products`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return `Connected successfully. Store has ${data.result?.length || 0} products.`;
  }

  /**
   * Test product catalog fetching
   */
  async testProductCatalog() {
    const response = await fetch(`${this.baseUrl}/products`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.result || [];
    
    // Filter art-relevant products
    const artProducts = products.filter(product => {
      const name = product.name.toLowerCase();
      const type = product.type.toLowerCase();
      return name.includes('canvas') || name.includes('poster') || 
             name.includes('metal') || name.includes('frame') ||
             type.includes('print');
    });

    return `Found ${artProducts.length} art print products out of ${products.length} total products.`;
  }

  /**
   * Test product details fetching
   */
  async testProductDetails() {
    // Try to get details for a common canvas product (ID 71 is typically canvas)
    const productId = 71;
    const response = await fetch(`${this.baseUrl}/products/${productId}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const product = data.result;
    
    return `Product "${product.name}" has ${product.variants?.length || 0} variants.`;
  }

  /**
   * Test pricing calculation
   */
  async testPricingCalculation() {
    const testCases = [
      { baseCost: 21.50, expected: 43.00 }, // Canvas A4
      { baseCost: 49.50, expected: 99.00 }, // Canvas 18x24
      { baseCost: 14.50, expected: 29.00 }, // Poster A4
    ];

    const results = [];
    for (const test of testCases) {
      const calculated = this.calculateCustomerPrice(test.baseCost);
      const correct = calculated === test.expected;
      results.push(`$${test.baseCost} → $${calculated} (${correct ? '✅' : '❌'})`);
    }

    return `Pricing tests: ${results.join(', ')}`;
  }

  /**
   * Test mockup generation
   */
  async testMockupGeneration() {
    const mockupData = {
      product_id: 71, // Canvas product
      variant_ids: [4011], // Common canvas variant
      files: [{
        placement: 'default',
        image_url: 'https://picsum.photos/800/600?random=1',
        position: { area_width: 1800, area_height: 2400 }
      }]
    };

    const response = await fetch(`${this.baseUrl}/mockup-generator/create-task/71`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(mockupData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return `Mockup task created: ${data.result.task_key} (Status: ${data.result.status})`;
  }

  /**
   * Calculate customer price with 100% markup
   */
  calculateCustomerPrice(baseCost) {
    const markup = baseCost * 1.0; // 100% markup
    return Math.ceil((baseCost + markup) * 100) / 100; // Round up to nearest cent
  }

  /**
   * Get headers for API requests
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Piccatso-Printful-Test/1.0'
    };
  }

  /**
   * Log test result
   */
  logTestResult(testName, passed, message) {
    const result = {
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'color: green' : 'color: red';
    console.log(`%c${icon} ${testName}: ${message}`, color);
  }

  /**
   * Display test summary
   */
  displayTestSummary() {
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const passRate = Math.round((passed / total) * 100);

    console.log(`\n📊 Test Summary: ${passed}/${total} tests passed (${passRate}%)`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Printful integration is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the errors above.');
    }

    // Store results globally for debugging
    window.PrintfulTestResults = this.testResults;
  }

  /**
   * Test specific product by ID
   */
  async testSpecificProduct(productId) {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const product = data.result;

      console.log(`📦 Product: ${product.name}`);
      console.log(`🏷️ Type: ${product.type}`);
      console.log(`💰 Variants: ${product.variants?.length || 0}`);
      
      if (product.variants && product.variants.length > 0) {
        console.log('📏 Available sizes:');
        product.variants.forEach(variant => {
          const price = this.calculateCustomerPrice(parseFloat(variant.price));
          console.log(`  • ${variant.name}: $${variant.price} → $${price} (100% markup)`);
        });
      }

      return product;
    } catch (error) {
      console.error(`❌ Error testing product ${productId}:`, error);
      throw error;
    }
  }
}

// Initialize tester when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (window.PrintfulCredentials?.isConfigured()) {
    window.PrintfulTester = new PrintfulTester();
    
    // Add global test functions
    window.testPrintfulIntegration = () => window.PrintfulTester.runAllTests();
    window.testPrintfulProduct = (id) => window.PrintfulTester.testSpecificProduct(id);
    
    console.log('🧪 Printful Tester ready! Run testPrintfulIntegration() to test everything.');
  } else {
    console.warn('⚠️ Printful credentials not configured. Cannot run tests.');
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PrintfulTester;
}
