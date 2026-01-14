// app.js - main app logic (extracted & patched)

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const searchBar = document.getElementById('search-bar');
const categoryFilter = document.getElementById('category-filter');
const captionGrid = document.getElementById('caption-grid');
const loadMoreBtn = document.getElementById('load-more');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const floatingBg = document.getElementById('floating-bg');

// App State
let currentCategory = 'all';
let currentPage = 1;
const itemsPerPage = 6;
let darkMode = localStorage.getItem('darkMode') === 'true' || 
              (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

// Initialize floating background elements
function initFloatingBackground() {
    for (let i = 0; i < 15; i++) {
        const element = document.createElement('div');
        element.classList.add('floating-element');
        
        // Random size and position
        const size = Math.random() * 200 + 50;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.left = `${Math.random() * 100}%`;
        element.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        element.style.animationDelay = `${Math.random() * 20}s`;
        
        floatingBg.appendChild(element);
    }
}

// Initialize app
function initApp() {
    // Set initial theme
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Generate initial caption cards
    if (captionGrid) {
        renderCaptionCards();
    }
    
    // Initialize floating background
    if (floatingBg) {
        initFloatingBackground();
    }
    
    // Attach event listeners
    attachEventListeners();
}

// Render caption cards based on current filter and page
function renderCaptionCards() {
    // Clear existing cards
    captionGrid.innerHTML = '';
    
    // Filter captions by category
    let filteredCaptions = currentCategory === 'all' 
        ? captionsData 
        : captionsData.filter(caption => caption.category === currentCategory);
    
    // Apply search filter if any
    const searchTerm = searchBar.value.toLowerCase();
    if (searchTerm) {
        filteredCaptions = filteredCaptions.filter(caption => 
            caption.text.toLowerCase().includes(searchTerm)
        );
    }
    
    // Calculate items to show based on current page
    const startIndex = 0;
    const endIndex = currentPage * itemsPerPage;
    const captionsToShow = filteredCaptions.slice(startIndex, endIndex);
    
    // Create caption cards
    captionsToShow.forEach((caption, index) => {
        const card = document.createElement('div');
        card.className = `caption-card ${caption.trending ? 'trending' : ''}`;
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="caption-text">${caption.text}</div>
            <div class="caption-actions">
                <div>
                    <button class="action-btn like-btn ${localStorage.getItem(`liked-${caption.id}`) ? 'liked' : ''}" data-id="${caption.id}">
                        <i class="fas fa-heart"></i> <span>${caption.likes}</span>
                    </button>
                    <button class="action-btn share-btn" data-id="${caption.id}">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
                <button class="action-btn copy-btn" data-text="${caption.text}">
                    <i class="fas fa-copy"></i> কপি করুন
                </button>
            </div>
        `;
        
        captionGrid.appendChild(card);
    });
    
    // Show/hide load more button
    if (endIndex >= filteredCaptions.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
    
    // Attach event listeners to new buttons
    attachCaptionCardListeners();
}

// Attach event listeners to caption card buttons
function attachCaptionCardListeners() {
    // Like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const likeCount = this.querySelector('span');
            
            if (this.classList.contains('liked')) {
                // Unlike
                this.classList.remove('liked');
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
                localStorage.removeItem(`liked-${id}`);
            } else {
                // Like
                this.classList.add('liked');
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
                localStorage.setItem(`liked-${id}`, 'true');
            }
        });
    });
    
    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.getAttribute('data-text');
            
            // Copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                // Show copied state
                this.classList.add('copied');
                this.innerHTML = '<i class="fas fa-check"></i> কপি হয়েছে!';
                
                // Show toast notification
                showToast('ক্যাপশন কপি করা হয়েছে!', 'success');
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    this.classList.remove('copied');
                    this.innerHTML = '<i class="fas fa-copy"></i> কপি করুন';
                }, 2000);
            }).catch(err => {
                showToast('কপি করতে সমস্যা হয়েছে!', 'error');
                console.error('Copy failed:', err);
            });
        });
    });
    
    // Share buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const caption = captionsData.find(c => c.id === id);
            
            if (caption && navigator.share) {
                navigator.share({
                    title: 'CaptionLagbe',
                    text: caption.text,
                    url: window.location.href,
                });
            } else {
                showToast('শেয়ার অপশনগুলো দেখতে উপরের আইকনে ক্লিক করুন', 'success');
            }
        });
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Attach all event listeners
function attachEventListeners() {
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            darkMode = !darkMode;
            document.body.classList.toggle('dark-mode', darkMode);
            localStorage.setItem('darkMode', darkMode);
        });
    }
    
    // Search bar input
    if (searchBar) {
        searchBar.addEventListener('input', () => {
            currentPage = 1;
            renderCaptionCards();
        });
    }
    
    // Category filter buttons
    if (categoryFilter) {
        categoryFilter.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                // Update active button
                document.querySelectorAll('.category-btn').forEach(btn => {
                    btn.classList.remove('active');

            });
            e.target.classList.add('active');
            
            // Update current category
            currentCategory = e.target.getAttribute('data-category');
            currentPage = 1;
            renderCaptionCards();
        }
        });
    }
    
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderCaptionCards();
            
            // Smooth scroll to newly loaded items
            const cards = document.querySelectorAll('.caption-card');
            if (cards.length > 0) {
                const lastCard = cards[cards.length - 1];
                lastCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
    
    // Upload link
    const uploadLinks = document.querySelectorAll('[data-action="upload"]');
    if (uploadLinks && uploadLinks.length) {
        uploadLinks.forEach((uploadLink) => {
            uploadLink.addEventListener('click', (e) => {
                e.preventDefault();
                showToast('ক্যাপশন আপলোড ফিচারটি শীঘ্রই আসছে!', 'success');
            });
        });
    }
}

// Initialize the app when DOM is loaded
// PWA Service Worker Registration
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/service-worker.js')
//             .then(registration => {
//                 console.log('Service Worker registered:', registration);
//             })
//             .catch(error => {
//                 console.log('Service Worker registration failed:', error);
//             });
//     });
// }

// ============================================================================
// CARD TEMPLATE SYSTEM - EASY WAY TO ADD NEW CAPTIONS
// ============================================================================
// HOW TO USE:
// 1. Just copy and paste a template below
// 2. Replace the text with your caption
// 3. Choose a category: "love", "sad", "funny", "attitude"
// 4. Done! The card will automatically look like the others
// ============================================================================

// TEMPLATE 1: Basic Card
// {
//     id: 13,
//     text: "আপনার ক্যাপশন এখানে লিখুন",
//     category: "love",  // love, sad, funny, attitude
//     likes: 0,
//     trending: false
// },

// TEMPLATE 2: Trending Card
// {
//     id: 14,
//     text: "আপনার ক্যাপশন এখানে লিখুন - এটি ট্রেন্ডিং হবে",
//     category: "love",
//     likes: 0,
//     trending: true  // Set to true for trending badge
// },

// EXAMPLE: নতুন ক্যাপশন যোগ করতে:
// Step 1: এই ফাংশন চালান:
//   addNewCaption("আপনার ক্যাপশন", "category");
// 
// Step 2: অথবা captionsData এ সরাসরি যোগ করুন:
//   captionsData.push({
//       id: 13,
//       text: "আপনার ক্যাপশন এখানে",
//       category: "love",
//       likes: 0,
//       trending: false
//   });
//   renderCaptionCards();

// HELPER FUNCTION: সহজে নতুন ক্যাপশন যোগ করুন


// Initialize the app safely (avoid double init)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Mobile menu toggle (used by inline onclick in index.html)
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('show');
}
