// Main JavaScript file for the website

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initStatCounters();
    initFormValidation();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Elements to animate
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Stat Counters Animation
function initStatCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    
    const countObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const increment = target / speed;
                
                const updateCount = () => {
                    const count = +counter.innerText;
                    
                    if (count < target) {
                        counter.innerText = Math.ceil(count + increment);
                        setTimeout(updateCount, 1);
                    } else {
                        counter.innerText = target;
                        counter.classList.add('counted');
                    }
                };
                
                updateCount();
                countObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        countObserver.observe(counter);
    });
}

// Form Validation Helper
function initFormValidation() {
    // Email validation
    window.validateEmail = function(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };
    
    // Phone validation (Israeli format)
    window.validatePhone = function(phone) {
        const re = /^0(5[^7]|[2-4]|[8-9]|1)[0-9]{8}$/;
        return re.test(phone.replace(/[-()\s]/g, ''));
    };
    
    // Required field validation
    window.validateRequired = function(value) {
        return value.trim() !== '';
    };
    
    // Show error message
    window.showError = function(input, message) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            const errorMessage = formGroup.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
        }
    };
    
    // Clear error message
    window.clearError = function(input) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorMessage = formGroup.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = '';
            }
        }
    };
}

// Utility Functions
window.utils = {
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Get element offset
    getOffset: function(el) {
        const rect = el.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset
        };
    },
    
    // Format date
    formatDate: function(date, format = 'short') {
        const options = format === 'short' 
            ? { year: 'numeric', month: 'short', day: 'numeric' }
            : { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
            
        return new Date(date).toLocaleDateString('he-IL', options);
    },
    
    // Format number with commas
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
};

// Header scroll effect
window.addEventListener('scroll', utils.throttle(function() {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}, 100));

// Add scrolled class to header
const header = document.querySelector('.header');
if (header) {
    // Add initial scrolled class check
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    }
}

// Add CSS for scrolled header
const headerStyles = document.createElement('style');
headerStyles.textContent = `
    .header.scrolled {
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        background-color: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }
`;
document.head.appendChild(headerStyles);

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
    });
}

// Initialize lazy loading
initLazyLoading();

// Add CSS for lazy loading
const lazyStyles = document.createElement('style');
lazyStyles.textContent = `
    img.lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    img:not(.lazy) {
        opacity: 1;
    }
`;
document.head.appendChild(lazyStyles);

// Print styles
const printStyles = document.createElement('style');
printStyles.textContent = `
    @media print {
        .header, .footer, .floating-cta, .btn {
            display: none !important;
        }
        
        body {
            font-size: 12pt;
            line-height: 1.4;
        }
        
        h1, h2, h3 {
            page-break-after: avoid;
        }
        
        .container {
            max-width: 100%;
            padding: 0;
        }
        
        a {
            text-decoration: none;
            color: #000;
        }
        
        .article-card, .feature-card, .testimonial-card {
            break-inside: avoid;
            page-break-inside: avoid;
        }
    }
`;
document.head.appendChild(printStyles);

// Load performance optimizations
const performanceScript = document.createElement('script');
performanceScript.src = 'js/performance.js';
performanceScript.async = true;
document.head.appendChild(performanceScript);

// Console welcome message
console.log('%cהייטק בית שמש', 'color: #0066cc; font-size: 24px; font-weight: bold;');
console.log('%cברוכים הבאים לאתר הכישרונות הטכנולוגיים של בית שמש!', 'color: #333; font-size: 14px;');