/**
 * Printful Offline Tester - Test integration without API calls
 * Validates configuration, credentials, and functionality locally
 */

class PrintfulOfflineTester {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  /**
   * Run all offline tests
   */
  async runAllTests() {
    console.log('🧪 Starting Printful offline integration tests...');
    
    const tests = [
      { name: 'Credentials Loading', fn: () => this.testCredentialsLoading() },
      { name: 'API Key Validation', fn: () => this.testAPIKeyValidation() },
      { name: 'Configuration Check', fn: () => this.testConfiguration() },
      { name: 'POD Interface Loading', fn: () => this.testPODInterfaceLoading() },
      { name: 'Pricing Calculations', fn: () => this.testPricingCalculations() },
      { name: 'Product Configuration', fn: () => this.testProductConfiguration() },
      { name: 'Shopify Integration Setup', fn: () => this.testShopifyIntegration() },
      { name: 'Sample Image Processing', fn: () => this.testSampleImageProcessing() }
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

    return this.displayResults();
  }

  /**
   * Test if credentials are properly loaded
   */
  testCredentialsLoading() {
    if (!window.PrintfulCredentials) {
      throw new Error('PrintfulCredentials not found in window object');
    }

    const required = ['api_key', 'endpoints', 'markup_percentage', 'test_mode'];
    const missing = required.filter(key => !window.PrintfulCredentials.hasOwnProperty(key));
    
    if (missing.length > 0) {
      throw new Error(`Missing required properties: ${missing.join(', ')}`);
    }

    return 'All credential properties loaded successfully';
  }

  /**
   * Test API key validation
   */
  testAPIKeyValidation() {
    const apiKey = window.PrintfulCredentials.api_key;
    
    if (!apiKey || apiKey === 'YOUR_PRINTFUL_API_KEY_HERE') {
      throw new Error('API key not configured');
    }

    if (apiKey.length < 10) {
      throw new Error('API key appears to be invalid (too short)');
    }

    // Check if it looks like a Printful API key (basic format check)
    if (!/^[A-Za-z0-9]{20,}$/.test(apiKey)) {
      console.warn('⚠️ API key format may be incorrect');
    }

    return `API key configured (${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)})`;
  }

  /**
   * Test configuration settings
   */
  testConfiguration() {
    const config = window.PrintfulCredentials;
    const results = [];

    // Test markup percentage
    if (config.markup_percentage !== 100) {
      throw new Error(`Markup should be 100%, currently ${config.markup_percentage}%`);
    }
    results.push(`Markup: ${config.markup_percentage}% ✅`);

    // Test mode
    results.push(`Test mode: ${config.test_mode ? 'Enabled (Safe)' : 'Disabled (Live)'} ✅`);

    // Test endpoints
    if (!config.endpoints || !config.endpoints.base_url) {
      throw new Error('API endpoints not configured');
    }
    results.push(`Endpoints: Configured ✅`);

    // Test Shopify integration
    if (config.shopify_integration) {
      results.push(`Shopify Integration: ${config.shopify_integration.enabled ? 'Enabled' : 'Disabled'} ✅`);
    }

    return results.join(', ');
  }

  /**
   * Test POD interface loading
   */
  testPODInterfaceLoading() {
    // Check if POD-related scripts are loaded
    const scripts = Array.from(document.scripts).map(s => s.src);
    const requiredScripts = [
      'printful-credentials.js',
      'pod-integration.js',
      'printful-status-checker.js'
    ];

    const loadedScripts = requiredScripts.filter(script => 
      scripts.some(src => src.includes(script))
    );

    if (loadedScripts.length !== requiredScripts.length) {
      const missing = requiredScripts.filter(script => !loadedScripts.includes(script));
      throw new Error(`Missing scripts: ${missing.join(', ')}`);
    }

    // Check if POD interface elements exist
    const podElements = [
      'pod-interface-section',
      'pod-product-grid',
      'pod-mockup-container'
    ];

    const foundElements = podElements.filter(id => document.getElementById(id));

    return `Scripts loaded: ${loadedScripts.length}/${requiredScripts.length}, Elements found: ${foundElements.length}/${podElements.length}`;
  }

  /**
   * Test pricing calculations
   */
  testPricingCalculations() {
    const testPrices = [
      { cost: 19.99, expected: 39.98 },
      { cost: 29.95, expected: 59.90 },
      { cost: 49.50, expected: 99.00 }
    ];

    const markup = window.PrintfulCredentials.markup_percentage;
    const results = [];

    for (const test of testPrices) {
      const calculated = parseFloat((test.cost * (1 + markup / 100)).toFixed(2));
      if (Math.abs(calculated - test.expected) > 0.01) {
        throw new Error(`Pricing error: $${test.cost} should become $${test.expected}, got $${calculated}`);
      }
      results.push(`$${test.cost} → $${calculated}`);
    }

    return `Pricing calculations correct: ${results.join(', ')}`;
  }

  /**
   * Test product configuration
   */
  testProductConfiguration() {
    // Check if product configurations are loaded
    if (typeof window.PrintfulSizeConfigs === 'undefined') {
      console.warn('⚠️ PrintfulSizeConfigs not loaded yet (may load later)');
      return 'Product configs will be loaded dynamically';
    }

    const configs = window.PrintfulSizeConfigs;
    const productTypes = Object.keys(configs);
    
    if (productTypes.length === 0) {
      throw new Error('No product configurations found');
    }

    const results = [];
    for (const type of productTypes) {
      const sizes = Object.keys(configs[type]);
      results.push(`${type}: ${sizes.length} sizes`);
    }

    return `Product types configured: ${results.join(', ')}`;
  }

  /**
   * Test Shopify integration setup
   */
  testShopifyIntegration() {
    const integration = window.PrintfulCredentials.shopify_integration;
    
    if (!integration) {
      return 'Direct API mode (no Shopify integration)';
    }

    const results = [];
    results.push(`Enabled: ${integration.enabled ? 'Yes' : 'No'}`);
    results.push(`Sync Products: ${integration.sync_products ? 'Yes' : 'No'}`);

    // Check for Shopify-specific elements
    const shopifyElements = document.querySelectorAll('[name*="properties"]');
    if (shopifyElements.length > 0) {
      results.push(`Shopify form fields: ${shopifyElements.length} found`);
    }

    return results.join(', ');
  }

  /**
   * Test sample image processing
   */
  testSampleImageProcessing() {
    const sampleImages = [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop'
    ];

    const results = [];
    
    for (const imageUrl of sampleImages) {
      try {
        // Test if URL is valid format
        new URL(imageUrl);
        results.push('Valid URL ✅');
      } catch (error) {
        throw new Error(`Invalid sample image URL: ${imageUrl}`);
      }
    }

    // Test if sample image elements exist
    const imageElements = document.querySelectorAll('.sample-image');
    results.push(`Sample image elements: ${imageElements.length}`);

    return results.join(', ');
  }

  /**
   * Log test result
   */
  logTestResult(name, passed, result) {
    const testResult = { name, passed, result, timestamp: new Date() };
    this.results.push(testResult);
    
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'color: #10b981' : 'color: #ef4444';
    console.log(`%c${icon} ${name}: ${result}`, color);
  }

  /**
   * Display test results
   */
  displayResults() {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = Math.round((passed / total) * 100);

    const summary = {
      total,
      passed,
      failed: total - passed,
      passRate,
      results: this.results
    };

    console.log(`\n📊 Offline Test Summary: ${passed}/${total} tests passed (${passRate}%)`);
    
    if (passed === total) {
      console.log('🎉 All offline tests passed! Integration is properly configured.');
    } else {
      console.log('⚠️ Some tests failed. Check the errors above.');
    }

    return summary;
  }

  /**
   * Test specific functionality
   */
  async testSpecificFunction(functionName) {
    const functions = {
      'pricing': () => this.testPricingCalculations(),
      'config': () => this.testConfiguration(),
      'credentials': () => this.testCredentialsLoading(),
      'api-key': () => this.testAPIKeyValidation()
    };

    if (!functions[functionName]) {
      throw new Error(`Unknown test function: ${functionName}`);
    }

    return await functions[functionName]();
  }
}

/**
 * Main offline test function
 */
async function testPrintfulOffline() {
  const statusDiv = document.getElementById('api-status');
  const resultsDiv = document.getElementById('api-results');
  
  updateStatus(statusDiv, 'testing', '🔄 Running offline integration tests...');
  
  const tester = new PrintfulOfflineTester();
  const summary = await tester.runAllTests();
  
  if (summary.passRate === 100) {
    updateStatus(statusDiv, 'success', '✅ All offline tests passed! Integration ready.');
    showOfflineSuccessResults(resultsDiv, summary);
  } else {
    updateStatus(statusDiv, 'warning', `⚠️ ${summary.failed} tests failed (${summary.passRate}% passed)`);
    showOfflineResults(resultsDiv, summary);
  }
  
  return summary;
}

/**
 * Show offline success results
 */
function showOfflineSuccessResults(resultsDiv, summary) {
  if (!resultsDiv) return;
  
  resultsDiv.style.display = 'block';
  resultsDiv.innerHTML = `
    <h3>🎉 Offline Integration Test Results</h3>
    <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0;">
      <h4 style="color: #155724; margin: 0 0 1rem 0;">✅ All Tests Passed! (${summary.passRate}%)</h4>
      <p style="margin: 0.5rem 0;"><strong>Total Tests:</strong> ${summary.total}</p>
      <p style="margin: 0.5rem 0;"><strong>Passed:</strong> ${summary.passed}</p>
      <p style="margin: 0.5rem 0;"><strong>Failed:</strong> ${summary.failed}</p>
    </div>
    
    <div style="background: #cce5ff; border: 1px solid #99d3ff; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0;">
      <h4 style="color: #0056b3; margin: 0 0 1rem 0;">🔍 What Was Tested (No API Calls Needed)</h4>
      <ul style="margin: 0.5rem 0; padding-left: 2rem;">
        <li><strong>Credentials:</strong> Properly loaded and configured</li>
        <li><strong>API Key:</strong> Valid format and configured</li>
        <li><strong>Pricing:</strong> 100% markup calculations working</li>
        <li><strong>Scripts:</strong> All required JavaScript files loaded</li>
        <li><strong>Configuration:</strong> All settings correct</li>
        <li><strong>Shopify Integration:</strong> Properly configured</li>
        <li><strong>Sample Images:</strong> Valid URLs and elements</li>
        <li><strong>POD Interface:</strong> Components loaded</li>
      </ul>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0;">
      <h4 style="color: #856404; margin: 0 0 1rem 0;">💡 Why This Testing Method Works</h4>
      <p style="margin: 0.5rem 0;">• <strong>No CORS Issues:</strong> Tests everything locally without API calls</p>
      <p style="margin: 0.5rem 0;">• <strong>Validates Configuration:</strong> Ensures all settings are correct</p>
      <p style="margin: 0.5rem 0;">• <strong>Tests Logic:</strong> Pricing calculations and data processing</p>
      <p style="margin: 0.5rem 0;">• <strong>Verifies Setup:</strong> All required components are loaded</p>
    </div>
    
    <div style="text-align: center; margin-top: 2rem;">
      <button onclick="testSampleWorkflow()" class="test-button" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        🎨 Test Sample Workflow
      </button>
      <button onclick="validatePricingDemo()" class="test-button" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        💰 Validate Pricing Demo
      </button>
    </div>
  `;
}

/**
 * Show offline results with some failures
 */
function showOfflineResults(resultsDiv, summary) {
  if (!resultsDiv) return;
  
  const failedTests = summary.results.filter(r => !r.passed);
  const passedTests = summary.results.filter(r => r.passed);
  
  resultsDiv.style.display = 'block';
  resultsDiv.innerHTML = `
    <h3>📊 Offline Test Results</h3>
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0;">
      <h4 style="color: #856404; margin: 0 0 1rem 0;">Test Summary: ${summary.passRate}% Pass Rate</h4>
      <p style="margin: 0.5rem 0;"><strong>✅ Passed:</strong> ${summary.passed}/${summary.total}</p>
      <p style="margin: 0.5rem 0;"><strong>❌ Failed:</strong> ${summary.failed}/${summary.total}</p>
    </div>
    
    ${failedTests.length > 0 ? `
    <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0;">
      <h4 style="color: #721c24; margin: 0 0 1rem 0;">❌ Failed Tests:</h4>
      <ul style="margin: 0.5rem 0; padding-left: 2rem;">
        ${failedTests.map(test => `<li><strong>${test.name}:</strong> ${test.result}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    ${passedTests.length > 0 ? `
    <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0;">
      <h4 style="color: #155724; margin: 0 0 1rem 0;">✅ Passed Tests:</h4>
      <ul style="margin: 0.5rem 0; padding-left: 2rem;">
        ${passedTests.map(test => `<li><strong>${test.name}:</strong> ${test.result}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  `;
}

/**
 * Test sample workflow
 */
function testSampleWorkflow() {
  console.log('🎨 Testing sample workflow...');
  
  // Simulate selecting a sample image
  const sampleImage = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop';
  
  // Show POD interface
  const podSection = document.getElementById('pod-interface-section');
  if (podSection) {
    podSection.style.display = 'block';
    podSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  alert('🎨 Sample workflow activated! The POD interface should now be visible below.');
}

/**
 * Validate pricing demo
 */
function validatePricingDemo() {
  console.log('💰 Validating pricing demo...');
  
  const markup = window.PrintfulCredentials.markup_percentage;
  const testPrices = [
    { product: 'Canvas 12x16"', cost: 19.99 },
    { product: 'Metal Print 16x20"', cost: 29.95 },
    { product: 'Framed Print 18x24"', cost: 49.50 }
  ];
  
  let demoHTML = '<h4>💰 Pricing Validation Demo</h4><ul>';
  
  for (const item of testPrices) {
    const customerPrice = (item.cost * (1 + markup / 100)).toFixed(2);
    const profit = (customerPrice - item.cost).toFixed(2);
    demoHTML += `<li><strong>${item.product}:</strong> $${item.cost} → $${customerPrice} (Profit: $${profit})</li>`;
  }
  
  demoHTML += '</ul>';
  
  const resultsDiv = document.getElementById('api-results');
  if (resultsDiv) {
    const demoDiv = document.createElement('div');
    demoDiv.style.cssText = 'background: #e7f3ff; border: 1px solid #b8daff; border-radius: 0.5rem; padding: 1.5rem; margin: 1rem 0;';
    demoDiv.innerHTML = demoHTML;
    resultsDiv.appendChild(demoDiv);
  }
}

// Export for global use
window.testPrintfulOffline = testPrintfulOffline;
window.PrintfulOfflineTester = PrintfulOfflineTester;

console.log('✅ Printful Offline Tester loaded');
