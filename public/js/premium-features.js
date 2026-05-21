/**
 * TSV GLOBAL SOLUTIONS - PREMIUM JAVASCRIPT ENHANCEMENTS
 * Add these features to enhance user experience and interactivity
 */

// ============================================
// 1. SCROLL PROGRESS BAR
// ============================================
function initScrollProgress() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    // Update progress on scroll
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// ============================================
// 2. ANIMATED STATISTICS COUNTER
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('.odometer, .stat-number[data-count]');

    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-count') || element.textContent);
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        updateCounter();
    };

    // Intersection Observer for triggering animation when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// ============================================
// 3. DYNAMIC COPYRIGHT YEAR
// ============================================
function updateCopyrightYear() {
    const yearElements = document.querySelectorAll('#currentYear, .current-year');
    const currentYear = new Date().getFullYear();
    yearElements.forEach(el => el.textContent = currentYear);
}

// ============================================
// 4. SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// 5. FORM VALIDATION & ENHANCEMENT
// ============================================
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            // Phone validation for Indian numbers
            const phoneInputs = form.querySelectorAll('input[type="phone"], input[name*="phone"]');
            phoneInputs.forEach(input => {
                const phone = input.value.replace(/\D/g, '');
                if (phone && !/^[6-9]\d{9}$/.test(phone)) {
                    e.preventDefault();
                    showNotification('Please enter a valid 10-digit Indian mobile number', 'error');
                    input.focus();
                    return false;
                }
            });

            // Email validation
            const emailInputs = form.querySelectorAll('input[type="email"]');
            emailInputs.forEach(input => {
                const email = input.value;
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    e.preventDefault();
                    showNotification('Please enter a valid email address', 'error');
                    input.focus();
                    return false;
                }
            });
        });
    });
}

// ============================================
// 6. TOAST NOTIFICATIONS
// ============================================
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3',
        warning: '#ff9800'
    };

    toast.innerHTML = `
        <div class="toast-icon" style="background: ${colors[type]}">
            <i class="fa-solid ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <strong>${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <p>${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-times"></i>
        </button>
    `;

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

// ============================================
// 7. LAZY LOADING IMAGES
// ============================================
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}



// ============================================
// 9. SHIPMENT TRACKING FUNCTIONALITY
// ============================================
function initTracking() {
    const trackingForm = document.getElementById('trackingForm');
    if (!trackingForm) return;

    trackingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const trackingNumber = document.getElementById('trackingNumber').value.trim();

        if (!trackingNumber) {
            showNotification('Please enter a tracking number', 'error');
            return;
        }

        // Show loading
        showNotification('Fetching shipment details...', 'info');

        // Simulate API call
        setTimeout(() => {
            const resultsDiv = document.getElementById('trackingResults');
            document.getElementById('displayTrackingNo').textContent = trackingNumber;
            resultsDiv.style.display = 'block';
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
            showNotification('Shipment details loaded successfully!', 'success');
        }, 1500);
    });
}

// ============================================
// 10. INSTANT QUOTE CALCULATOR
// ============================================
function initQuoteCalculator() {
    const calculatorForm = document.getElementById('quoteCalculator');
    if (!calculatorForm) return;

    calculatorForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const shipmentType = document.getElementById('shipmentType').value;
        const weight = parseFloat(document.getElementById('weight').value);

        if (!shipmentType || !weight) {
            showNotification('Please fill all required fields', 'error');
            return;
        }

        // Calculate quote (simplified calculation)
        const rates = {
            air: 150,
            ocean: 50,
            road: 30
        };

        const baseRate = rates[shipmentType] || 50;
        const estimatedCost = Math.round(weight * baseRate);

        // Show result
        document.getElementById('quoteAmount').textContent = estimatedCost.toLocaleString('en-IN');
        document.getElementById('quoteResult').style.display = 'block';
        document.getElementById('quoteResult').scrollIntoView({ behavior: 'smooth' });

        showNotification('Quote calculated successfully!', 'success');
    });
}


// ============================================
// 13. BACK TO TOP BUTTON ENHANCEMENT
// ============================================
function enhanceScrollToTop() {
    const scrollBtn = document.getElementById('scroll-top');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.parentElement.style.display = 'block';
        } else {
            scrollBtn.parentElement.style.display = 'none';
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}



// ============================================
// 15. ENHANCED SEARCH FUNCTIONALITY
// ============================================
function enhanceSearch() {
    const searchInput = document.getElementById('popup-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase();

        // Here you would implement actual search
        // For now, just show suggestions
        if (query.length > 2) {
            console.log('Searching for:', query);
        }
    });
}


// ============================================
// 17. OFFLINE DETECTION
// ============================================
function initOfflineDetection() {
    window.addEventListener('offline', () => {
        showNotification('You are currently offline. Some features may not work.', 'warning');
    });

    window.addEventListener('online', () => {
        showNotification('Connection restored!', 'success');
    });
}

// ============================================
// 18. PERFORMANCE MONITORING
// ============================================
function monitorPerformance() {
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // Log slow resources
                if (entry.duration > 1000) {
                    console.warn('Slow resource:', entry.name, entry.duration + 'ms');
                }
            }
        });

        observer.observe({ entryTypes: ['resource', 'navigation'] });
    }
}

// ============================================
// 19. ANALYTICS TRACKING
// ============================================
function trackEvent(category, action, label) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }

    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', action, { category, label });
    }
}

// Track important user actions
function initAnalyticsTracking() {
    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', () => {
            trackEvent('Form', 'Submit', form.id || 'unnamed-form');
        });
    });

    // Track button clicks
    document.querySelectorAll('.default-btn, .btn-premium').forEach(btn => {
        btn.addEventListener('click', () => {
            trackEvent('Button', 'Click', btn.textContent.trim());
        });
    });

    // Track outbound links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.href.includes(window.location.hostname)) {
            link.addEventListener('click', () => {
                trackEvent('Outbound Link', 'Click', link.href);
            });
        }
    });
}

// ============================================
// 20. INITIALIZE ALL FEATURES
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    // Core features
    updateCopyrightYear();
    initSmoothScroll();
    initScrollProgress();
    enhanceScrollToTop();

    // Interactive features
    initCounters();
    initFormValidation();
    initLazyLoading();

    // Advanced features
    initTracking();
    initQuoteCalculator();
    enhanceSearch();



    // Monitoring
    initOfflineDetection();
    monitorPerformance();
    initAnalyticsTracking();

    console.log('✅ TSV Global Solutions - All premium features initialized!');
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format currency
function formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy', 'error');
    });
}

// Export functions for global use
window.TSVGlobal = {
    showNotification,
    trackEvent,
    formatCurrency,
    formatDate,
    copyToClipboard
};
