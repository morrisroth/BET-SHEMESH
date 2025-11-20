// News & Articles Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initSearch();
    initFilters();
    initPagination();
    initNewsletter();
    initArticleCards();
    initScrollToTop();
});

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

// Pagination functionality
function initPagination() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumbers = document.querySelectorAll('.page-number');
    
    let currentPage = 1;
    const totalPages = 3; // In a real app, this would be calculated dynamically
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                updatePagination(currentPage, totalPages);
                loadPage(currentPage);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                updatePagination(currentPage, totalPages);
                loadPage(currentPage);
            }
        });
    }
    
    pageNumbers.forEach((pageNum, index) => {
        pageNum.addEventListener('click', function() {
            currentPage = index + 1;
            updatePagination(currentPage, totalPages);
            loadPage(currentPage);
        });
    });
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
    const readMoreLinks = document.querySelectorAll('.read-more');
    
    readMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const articleCard = this.closest('.article-card');
            const title = articleCard.querySelector('.article-title').textContent;
            
            // In a real app, this would navigate to the full article
            console.log('Reading article:', title);
            showArticleModal(title);
        });
    });
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
    const articles = document.querySelectorAll('.article-card');
    let hasResults = false;
    
    // Show loading state
    showLoading();
    
    // Simulate search delay
    setTimeout(() => {
        articles.forEach(article => {
            const title = article.querySelector('.article-title').textContent.toLowerCase();
            const excerpt = article.querySelector('.article-excerpt').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                article.style.display = 'block';
                hasResults = true;
            } else {
                article.style.display = 'none';
            }
        });
        
        hideLoading();
        
        // Show no results message if needed
        if (!hasResults) {
            showNoResults(searchTerm);
        } else {
            hideNoResults();
        }
    }, 300);
}

// Reset search
function resetSearch() {
    const articles = document.querySelectorAll('.article-card');
    articles.forEach(article => {
        article.style.display = 'block';
    });
    hideNoResults();
}

// Apply filters
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortFilter').value;
    const articles = Array.from(document.querySelectorAll('.article-card'));
    
    // Filter by category
    let filteredArticles = articles;
    if (category) {
        filteredArticles = articles.filter(article => {
            return article.dataset.category === category;
        });
    }
    
    // Sort articles
    filteredArticles.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.dataset.date) - new Date(a.dataset.date);
            case 'date-asc':
                return new Date(a.dataset.date) - new Date(b.dataset.date);
            case 'title-asc':
                return a.querySelector('.article-title').textContent.localeCompare(b.querySelector('.article-title').textContent);
            case 'title-desc':
                return b.querySelector('.article-title').textContent.localeCompare(a.querySelector('.article-title').textContent);
            default:
                return 0;
        }
    });
    
    // Reorder articles in DOM
    const articlesGrid = document.getElementById('articlesGrid');
    filteredArticles.forEach(article => {
        articlesGrid.appendChild(article);
    });
    
    // Hide articles that don't match filters
    articles.forEach(article => {
        if (category && article.dataset.category !== category) {
            article.style.display = 'none';
        } else {
            article.style.display = 'block';
        }
    });
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
function showArticleModal(title) {
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
    
    // Simulate loading article content
    setTimeout(() => {
        const modalBody = modal.querySelector('.article-modal-body');
        modalBody.innerHTML = `
            <div class="article-content">
                <p>זהו תוכן הדגמה עבור המאמר "${title}". באפליקציה אמיתית, כאן יוצג התוכן המלא של המאמר כולל תמונות, קישורים ומידע נוסף.</p>
                <p>המאמר יכלול מידע מפורט על הנושא, ראיונות עם מומחים, דוגמאות מעשיות והמלצות שימושיות.</p>
                <h3>סיכום</h3>
                <p>בסעיף זה יסוכם המאמר ויוצגו המסקנות העיקריות יחד עם קריאה לפעולה.</p>
            </div>
        `;
    }, 1000);
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