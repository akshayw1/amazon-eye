// Mock data for product trust score
const mockTrustData = {
  trustScore: 85,
  verifiedReviews: "92%",
  recentSpecChanges: "⚠️",
  sellerRiskFlags: "Clean",
  productVerified: true,
  verificationDetails: "Images match description, reviews are authentic",
  savedProducts: 2,
  watchlistItems: [
    {
      name: "Wireless Headphones",
      image: "https://via.placeholder.com/60x60",
      trustScore: 88
    }
  ]
};

// Create and inject the eye button
function createEyeButton() {
  const eyeButton = document.createElement('div');
  eyeButton.id = 'amazon-eye-button';
  eyeButton.innerHTML = `
    <div class="eye-icon">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
      </svg>
    </div>
    <span class="eye-text">Amazon Eye</span>
  `;
  eyeButton.addEventListener('click', toggleSidebar);
  document.body.appendChild(eyeButton);
}

// Create and inject the sidebar
function createSidebar() {
  const sidebar = document.createElement('div');
  sidebar.id = 'amazon-eye-sidebar';
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="header-left">
        <div class="eye-icon-header">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        </div>
        <h2>Amazon Eye</h2>
      </div>
      <button class="close-button">×</button>
    </div>
    
    <div class="notification-banner">
      <span class="notification-icon">⚠️</span>
      <span class="notification-text">${mockTrustData.savedProducts} saved products had trust score changes</span>
      <a href="#" class="view-all-link">View All</a>
    </div>

    <div class="voice-assistant">
      <div class="voice-button">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="white" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
        </svg>
      </div>
      <h3>Ask Amazon Eye...</h3>
    </div>

    <div class="quick-actions">
      <div class="action-button">
        <span>"Is this item trustworthy?"</span>
      </div>
      <div class="action-button">
        <span>"Compare with safer options"</span>
      </div>
      <div class="action-button">
        <span>"Scan a barcode"</span>
      </div>
    </div>

    <div class="language-selector">
      <button class="lang-btn active">🇺🇸 EN</button>
      <button class="lang-btn">🇹🇷 Tü</button>
      <button class="lang-btn">🇧🇩 বা</button>
    </div>
    
    <div class="trust-score-section">
      <h3 class="section-title">Trust Score</h3>
      <div class="trust-score-display">
        <div class="score-circle">${mockTrustData.trustScore}</div>
      </div>
    </div>
    
    <div class="metrics">
      <div class="metric">
        <span class="metric-icon">✅</span>
        <span class="label">Verified reviews</span>
        <span class="value">${mockTrustData.verifiedReviews}</span>
      </div>
      <div class="metric">
        <span class="metric-icon">⚠️</span>
        <span class="label">Recent spec changes</span>
        <span class="value warning">⚠️</span>
      </div>
      <div class="metric">
        <span class="metric-icon">🚩</span>
        <span class="label">Seller risk flags</span>
        <span class="value success">${mockTrustData.sellerRiskFlags}</span>
      </div>
    </div>

    <div class="verification-section">
      <div class="verification-header">
        <span class="verification-icon">🛡️</span>
        <span class="verification-title">Product Verified</span>
      </div>
      <p class="verification-text">${mockTrustData.verificationDetails}</p>
    </div>

    <div class="barcode-section">
      <div class="barcode-icon">
        <svg viewBox="0 0 24 24" width="32" height="32">
          <path fill="#4285f4" d="M3 5v4h2V7h2V5H3zm0 10v4h4v-2H5v-2H3zm8 4h2v-4h-2v4zm4 0h4v-2h-2v-2h-2v4zm4-14v2h2V5h-2zm0 4v4h2V9h-2zM9 5v2h2V5H9zm4 0v4h2V5h-2z"/>
        </svg>
      </div>
      <h3>Scan a Product Barcode</h3>
      <p>Instantly check trust score</p>
    </div>

    <div class="watchlist-section">
      <div class="watchlist-header">
        <h3 class="section-title">Your Watchlist</h3>
        <a href="#" class="view-all-link">View All</a>
      </div>
      <div class="watchlist-item">
        <img src="https://via.placeholder.com/60x60" alt="Product" class="product-image">
        <div class="product-info">
          <span class="product-name">${mockTrustData.watchlistItems[0].name}</span>
          <div class="product-score">${mockTrustData.watchlistItems[0].trustScore}</div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(sidebar);
  
  // Add close button functionality
  sidebar.querySelector('.close-button').addEventListener('click', () => {
    sidebar.classList.remove('active');
  });

  // Add language selector functionality
  sidebar.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sidebar.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// Toggle sidebar visibility
function toggleSidebar() {
  const sidebar = document.getElementById('amazon-eye-sidebar');
  sidebar.classList.toggle('active');
}

// Initialize the extension
function init() {
  if (window.location.hostname.includes('amazon')) {
    createEyeButton();
    createSidebar();
  }
}

// Run initialization
init(); 