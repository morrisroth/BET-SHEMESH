// Performance and Mobile Optimization Enhancements

document.addEventListener('DOMContentLoaded', function() {
    // Initialize performance optimizations
    initServiceWorker();
    initPreloading();
    initImageOptimization();
    initTouchGestures();
    initMobileMenu();
    initSmoothScrolling();
    initReducedMotion();
});

// Service Worker for Caching
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    }
}

// Preloading Critical Resources
function initPreloading() {
    // Preload critical pages
    const criticalPages = ['talent.html', 'news.html', 'contact.html'];
    criticalPages.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
    });
    
    // Preload critical images
    const heroImages = document.querySelectorAll('.hero-image img');
    heroImages.forEach(img => {
        if (img.dataset.src) {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'image';
            preloadLink.href = img.dataset.src;
            document.head.appendChild(preloadLink);
        }
    });
}

// Image Optimization
function initImageOptimization() {
    // Add loading="lazy" to all images below the fold
    const images = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.loading = 'lazy';
                
                // Add fade-in effect
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.addEventListener('load', function() {
                    this.style.opacity = '1';
                });
                
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Touch Gestures for Mobile
function initTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Swipe gestures for mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0 && navMenu.classList.contains('active')) {
                    // Swipe left - close menu
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                } else if (diff < 0 && !navMenu.classList.contains('active')) {
                    // Swipe right - open menu
                    hamburger.classList.add('active');
                    navMenu.classList.add('active');
                }
            }
        }
    }
    
    // Touch feedback for buttons
    const buttons = document.querySelectorAll('.btn, .nav-link');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Enhanced Mobile Menu
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger && navMenu) {
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
        
        // Add overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
        });
        
        hamburger.addEventListener('click', function() {
            const isActive = navMenu.classList.contains('active');
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                overlay.classList.remove('active');
            });
        });
    }
}

// Smooth Scrolling with Performance
function initSmoothScrolling() {
    let isScrolling = false;
    
    // Throttle scroll events for better performance
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            window.requestAnimationFrame(function() {
                // Update header state
                const header = document.querySelector('.header');
                if (header) {
                    if (window.scrollY > 100) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                }
                
                // Update scroll-to-top button
                const scrollToTopBtn = document.querySelector('.scroll-to-top');
                if (scrollToTopBtn) {
                    if (window.scrollY > 300) {
                        scrollToTopBtn.style.opacity = '1';
                        scrollToTopBtn.style.visibility = 'visible';
                    } else {
                        scrollToTopBtn.style.opacity = '0';
                        scrollToTopBtn.style.visibility = 'hidden';
                    }
                }
                
                isScrolling = false;
            });
            
            isScrolling = true;
        }
    });
}

// Respect Reduced Motion Preferences
function initReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Disable animations for users who prefer reduced motion
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Performance Monitoring
function initPerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            console.log(`Page load time: ${loadTime}ms`);
            
            // Log performance issues
            if (loadTime > 3000) {
                console.warn('Page load time is slow (>3s)');
            }
        }
    });
    
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log(`LCP: ${lastEntry.renderTime || lastEntry.loadTime}`);
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log(`FID: ${entry.processingStart - entry.startTime}`);
            });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log(`CLS: ${clsValue}`);
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
}

// Initialize performance monitoring
initPerformanceMonitoring();

// Add CSS for mobile optimizations
const mobileOptimizationStyles = document.createElement('style');
mobileOptimizationStyles.textContent = `
    /* Mobile Menu Overlay */
    .mobile-menu-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .mobile-menu-overlay.active {
        opacity: 1;
        visibility: visible;
    }
    
    /* Touch-friendly tap targets */
    @media (max-width: 768px) {
        .btn, .nav-link, .menu-item {
            min-height: 44px;
            min-width: 44px;
            padding: 12px 16px;
        }
        
        /* Better mobile navigation */
        .nav-menu {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 300px;
            height: 100vh;
            background-color: white;
            box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
            transition: right 0.3s ease;
            z-index: 1000;
            overflow-y: auto;
            padding: 80px 20px 20px;
        }
        
        .nav-menu.active {
            right: 0;
        }
        
        .nav-item {
            margin: 0;
            padding: 15px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .nav-link {
            display: block;
            padding: 15px 0;
            font-size: 1.1rem;
        }
    }
    
    /* Performance optimizations */
    .will-change-transform {
        will-change: transform;
    }
    
    .gpu-accelerated {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
        .btn {
            border: 2px solid currentColor;
        }
        
        .card {
            border: 1px solid currentColor;
        }
    }
    
    /* Focus indicators for keyboard navigation */
    *:focus {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
    }
    
    /* Skip to content link for accessibility */
    .skip-to-content {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #0066cc;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
    }
    
    .skip-to-content:focus {
        top: 6px;
    }
`;
document.head.appendChild(mobileOptimizationStyles);

// Add skip to content link for accessibility
const skipLink = document.createElement('a');
skipLink.href = '#main';
skipLink.className = 'skip-to-content';
skipLink.textContent = 'דלג לתוכן ראשי';
document.body.insertBefore(skipLink, document.body.firstChild);

// Add main id to main content
const main = document.querySelector('main');
if (main) {
    main.id = 'main';
}