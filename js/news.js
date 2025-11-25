// News & Articles Page JavaScript

// Global variables
let allArticles = [];
let filteredArticles = [];
let currentPage = 1;
const articlesPerPage = 6;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    fetchArticles().then(() => {
        initSearch();
        initFilters();
        initPagination();
        initNewsletter();
        initArticleCards();
        initScrollToTop();
        renderArticles();
    });
});

// Fetch articles from API
async function fetchArticles() {
    try {
        const response = await fetch('/api/articles?status=published');
        const data = await response.json();
        allArticles = data.articles || [];
        filteredArticles = [...allArticles];
    } catch (error) {
        console.error('Error fetching articles:', error);
        allArticles = [];
        filteredArticles = [];
    }
}

// Search functionality
function initSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    if (searchForm && searchInput) {
        let searchTimeout;
        
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
        
        // Real-time search with debounce
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.trim() !== '') {
                    performSearch();
                } else {
                    resetSearch();
                }
            }, 500);
        });
    }
}

// Filter functionality
function initFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
}

// Render articles from API data
function renderArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    const featuredSection = document.querySelector('.featured-article');
    
    if (!articlesGrid) return;
    
    // Clear existing articles
    articlesGrid.innerHTML = '';
    
    // Render featured article if available
    if (featuredSection && filteredArticles.length > 0) {
        const featuredArticle = filteredArticles[0];
        featuredSection.innerHTML = `
            <div class="container">
                <div class="featured-card">
                    <div class="featured-image">
                        <img src="${featuredArticle.image || 'https://picsum.photos/seed/featured-tech/800/400.jpg'}" alt="${featuredArticle.title}">
                    </div>
                    <div class="featured-content">
                        <div class="article-meta">
                            <span class="article-category">${getCategoryName(featuredArticle.category)}</span>
                            <span class="article-date">${formatDate(featuredArticle.date)}</span>
                        </div>
                        <h2 class="featured-title">${featuredArticle.title}</h2>
                        <p class="featured-excerpt">${featuredArticle.content.substring(0, 150)}...</p>
                        <a href="#" class="btn btn-primary" onclick="showFullArticle('${featuredArticle._id}')">קרא עוד</a>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const articlesToShow = filteredArticles.slice(startIndex, endIndex);
    
    // Render article cards
    articlesToShow.forEach(article => {
        const articleCard = createArticleCard(article);
        articlesGrid.appendChild(articleCard);
    });
    
    // Update pagination
    updatePaginationControls();
}

// Create article card element
function createArticleCard(article) {
    const articleCard = document.createElement('article');
    articleCard.className = 'article-card';
    articleCard.dataset.category = article.category;
    articleCard.dataset.date = article.date.toISOString().split('T')[0];
    
    articleCard.innerHTML = `
        <div class="article-image">
            <img src="${article.image || `https://picsum.photos/seed/${article._id}/400/250.jpg`}" alt="${article.title}">
        </div>
        <div class="article-content">
            <div class="article-meta">
                <span class="article-category">${getCategoryName(article.category)}</span>
                <span class="article-date">${formatDate(article.date)}</span>
            </div>
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.content.substring(0, 120)}...</p>
            <a href="#" class="read-more" onclick="showFullArticle('${article._id}')">קרא עוד</a>
        </div>
    `;
    
    return articleCard;
}

// Get category name in Hebrew
function getCategoryName(category) {
    const categories = {
        'startups': 'סטארטאפים',
        'education': 'הכשרות',
        'events': 'אירועים',
        'success': 'סיפורי הצלחה',
        'technology': 'טכנולוגיה'
    };
    return categories[category] || category;
}

// Format date in Hebrew
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('he-IL', options);
}

// Show full article
function showFullArticle(articleId) {
    const article = allArticles.find(a => a._id === articleId);
    if (article) {
        showArticleModal(article.title, article.content, article);
    }
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumbers = document.querySelector('.pagination-numbers');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        for (let i = 1; i <= Math.max(1, totalPages); i++) {
            const pageNum = document.createElement('span');
            pageNum.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageNum.textContent = i;
            pageNum.addEventListener('click', () => {
                currentPage = i;
                renderArticles();
            });
            pageNumbers.appendChild(pageNum);
        }
    }
}

// Pagination functionality
function initPagination() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderArticles();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderArticles();
            }
        });
    }
}

// Newsletter functionality
function initNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('emailInput');
    const messageDiv = document.getElementById('newsletterMessage');
    
    if (newsletterForm && emailInput && messageDiv) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            if (!validateEmail(email)) {
                showNewsletterMessage('אנא הזינו כתובת דוא"ל תקינה', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> רושם...';
            
            // Simulate API call
            setTimeout(() => {
                // Show success message
                showNewsletterMessage('נרשמת בהצלחה לניוזלטר שלנו!', 'success');
                
                // Reset form
                emailInput.value = '';
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    hideNewsletterMessage();
                }, 5000);
            }, 1500);
        });
        
        // Hide message when user starts typing
        emailInput.addEventListener('input', hideNewsletterMessage);
    }
}

// Article cards functionality
function initArticleCards() {
    // This function is now handled by the renderArticles function
    // which creates article cards with proper event handlers
}

// Scroll to top functionality
function initScrollToTop() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.setAttribute('aria-label', 'חזור למעלה');
    
    // Add styles
    Object.assign(scrollToTopBtn.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#0066cc',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        opacity: '0',
        visibility: 'hidden',
        transition: 'all 0.3s ease',
        zIndex: '999',
        boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)'
    });
    
    document.body.appendChild(scrollToTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    });
    
    // Scroll to top when clicked
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Perform search
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (searchTerm === '') {
        filteredArticles = [...allArticles];
    } else {
        filteredArticles = allArticles.filter(article => {
            const title = article.title.toLowerCase();
            const content = article.content.toLowerCase();
            const tags = article.tags ? article.tags.join(' ').toLowerCase() : '';
            
            return title.includes(searchTerm) || content.includes(searchTerm) || tags.includes(searchTerm);
        });
    }
    
    // Apply existing filters
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter && categoryFilter.value) {
        filteredArticles = filteredArticles.filter(article => article.category === categoryFilter.value);
    }
    
    // Apply existing sort
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter && sortFilter.value) {
        applySorting(sortFilter.value);
    }
    
    currentPage = 1;
    renderArticles();
    
    // Show no results message if needed
    if (filteredArticles.length === 0) {
        showNoResults(searchTerm);
    } else {
        hideNoResults();
    }
}

// Reset search
function resetSearch() {
    filteredArticles = [...allArticles];
    currentPage = 1;
    
    // Apply existing filters
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter && categoryFilter.value || sortFilter && sortFilter.value) {
        applyFilters();
    } else {
        renderArticles();
    }
    
    hideNoResults();
}

// Apply filters
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortFilter').value;
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    // Start with all articles
    filteredArticles = [...allArticles];
    
    // Apply search filter
    if (searchTerm) {
        filteredArticles = filteredArticles.filter(article => {
            const title = article.title.toLowerCase();
            const content = article.content.toLowerCase();
            const tags = article.tags ? article.tags.join(' ').toLowerCase() : '';
            
            return title.includes(searchTerm) || content.includes(searchTerm) || tags.includes(searchTerm);
        });
    }
    
    // Apply category filter
    if (category) {
        filteredArticles = filteredArticles.filter(article => article.category === category);
    }
    
    // Apply sorting
    if (sortBy) {
        applySorting(sortBy);
    }
    
    currentPage = 1;
    renderArticles();
    
    // Show no results message if needed
    if (filteredArticles.length === 0) {
        showNoResults(searchTerm || category);
    } else {
        hideNoResults();
    }
}

// Apply sorting
function applySorting(sortBy) {
    switch (sortBy) {
        case 'date-desc':
            filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            filteredArticles.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'title-asc':
            filteredArticles.sort((a, b) => a.title.localeCompare(b.title, 'he'));
            break;
        case 'title-desc':
            filteredArticles.sort((a, b) => b.title.localeCompare(a.title, 'he'));
            break;
    }
}

// Update pagination
function updatePagination(currentPage, totalPages) {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumbers = document.querySelectorAll('.page-number');
    
    // Update prev/next buttons
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
    }
    
    // Update page numbers
    pageNumbers.forEach((pageNum, index) => {
        pageNum.classList.remove('active');
        if (index + 1 === currentPage) {
            pageNum.classList.add('active');
        }
    });
}

// Load page
function loadPage(page) {
    // In a real app, this would load articles from the server
    console.log('Loading page:', page);
    
    // Scroll to top of articles section
    const articlesSection = document.querySelector('.articles-section');
    if (articlesSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = articlesSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Validate email
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Show newsletter message
function showNewsletterMessage(message, type) {
    const messageDiv = document.getElementById('newsletterMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `newsletter-message ${type}`;
    }
}

// Hide newsletter message
function hideNewsletterMessage() {
    const messageDiv = document.getElementById('newsletterMessage');
    if (messageDiv) {
        messageDiv.className = 'newsletter-message';
        messageDiv.textContent = '';
    }
}

// Show loading state
function showLoading() {
    const articlesGrid = document.getElementById('articlesGrid');
    if (articlesGrid) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>מחפש...</p>
        `;
        loadingDiv.id = 'searchLoading';
        articlesGrid.appendChild(loadingDiv);
    }
}

// Hide loading state
function hideLoading() {
    const loadingDiv = document.getElementById('searchLoading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Show no results message
function showNoResults(searchTerm) {
    const articlesGrid = document.getElementById('articlesGrid');
    if (articlesGrid) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>לא נמצאו תוצאות</h3>
            <p>לא מצאנו מאמרים התואמים לחיפוש "${searchTerm}"</p>
            <button class="btn btn-primary" onclick="resetSearch()">נקה חיפוש</button>
        `;
        noResultsDiv.id = 'noResults';
        articlesGrid.appendChild(noResultsDiv);
    }
}

// Hide no results message
function hideNoResults() {
    const noResultsDiv = document.getElementById('noResults');
    if (noResultsDiv) {
        noResultsDiv.remove();
    }
}

// Show article modal
function showArticleModal(title, content, article) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
        <div class="article-modal-content">
            <div class="article-modal-header">
                <h2>${title}</h2>
                <button class="article-modal-close">&times;</button>
            </div>
            <div class="article-modal-body">
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>טוען מאמר...</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.article-modal-close');
    
    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Load article content
    setTimeout(() => {
        const modalBody = modal.querySelector('.article-modal-body');
        const articleDate = article ? formatDate(article.date) : '';
        const articleCategory = article ? getCategoryName(article.category) : '';
        
        modalBody.innerHTML = `
            <div class="article-content">
                ${article ? `
                    <div class="article-meta" style="margin-bottom: 20px;">
                        <span class="article-category">${articleCategory}</span>
                        <span class="article-date">${articleDate}</span>
                    </div>
                ` : ''}
                <div class="article-body">${content}</div>
                ${article && article.tags && article.tags.length > 0 ? `
                    <div class="article-tags" style="margin-top: 20px;">
                        <h4>תגיות:</h4>
                        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                    </div>
                ` : ''}
            </div>
        `;
    }, 500);
}

// Add CSS for modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .article-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }
    
    .article-modal.active {
        display: flex;
    }
    
    .article-modal-content {
        background-color: white;
        border-radius: 10px;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.9);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .article-modal.active .article-modal-content {
        transform: scale(1);
        opacity: 1;
    }
    
    .article-modal-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .article-modal-header h2 {
        margin: 0;
        color: #1a1a1a;
    }
    
    .article-modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        transition: color 0.3s ease;
    }
    
    .article-modal-close:hover {
        color: #333;
    }
    
    .article-modal-body {
        padding: 20px;
    }
    
    .article-content {
        line-height: 1.7;
        color: #333;
    }
    
    .article-content h3 {
        color: #0066cc;
        margin-top: 30px;
        margin-bottom: 15px;
    }
    
    @media (max-width: 768px) {
        .article-modal {
            padding: 10px;
        }
        
        .article-modal-content {
            max-height: 95vh;
        }
        
        .article-modal-header,
        .article-modal-body {
            padding: 15px;
        }
    }
`;
document.head.appendChild(modalStyles);