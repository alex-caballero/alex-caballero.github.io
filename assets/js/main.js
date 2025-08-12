// Modern Portfolio JavaScript with Spanish Translation

// Language Translation System
class LanguageToggle {
    constructor() {
        this.currentLang = 'en';
        this.init();
    }

    init() {
        const toggleBtn = document.getElementById('lang-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleLanguage());
        }
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'en' ? 'es' : 'en';
        this.updateContent();
        this.updateToggleButton();
        this.updatePageLanguage();
    }

    updateContent() {
        const elements = document.querySelectorAll('[data-en][data-es]');
        elements.forEach(element => {
            const text = element.getAttribute(`data-${this.currentLang}`);
            if (text) {
                element.textContent = text;
            }
        });
    }

    updateToggleButton() {
        const toggleBtn = document.getElementById('lang-toggle');
        if (toggleBtn) {
            if (this.currentLang === 'en') {
                toggleBtn.textContent = 'Español';
                toggleBtn.setAttribute('data-lang', 'es');
            } else {
                toggleBtn.textContent = 'English';
                toggleBtn.setAttribute('data-lang', 'en');
            }
        }
    }

    updatePageLanguage() {
        document.documentElement.lang = this.currentLang;
        
        // Track language toggle event in GA4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'language_toggle', {
                'language': this.currentLang,
                'page_title': document.title
            });
        }
    }
}

// Mobile Navigation
class MobileNav {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        const toggle = document.querySelector('.nav__mobile-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleNav());
        }
    }

    toggleNav() {
        const navList = document.querySelector('.nav__list');
        const toggle = document.querySelector('.nav__mobile-toggle');
        
        if (!navList || !toggle) return;

        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            navList.style.display = 'flex';
            navList.style.flexDirection = 'column';
            navList.style.position = 'absolute';
            navList.style.top = '100%';
            navList.style.left = '0';
            navList.style.right = '0';
            navList.style.background = 'white';
            navList.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            navList.style.padding = '1rem';
            navList.style.gap = '1rem';
            toggle.classList.add('active');
        } else {
            navList.style.display = '';
            navList.style.flexDirection = '';
            navList.style.position = '';
            navList.style.top = '';
            navList.style.left = '';
            navList.style.right = '';
            navList.style.background = '';
            navList.style.boxShadow = '';
            navList.style.padding = '';
            navList.style.gap = '';
            toggle.classList.remove('active');
        }
    }
}

// Intersection Observer for animations
class AnimationObserver {
    constructor() {
        this.options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        this.observer.unobserve(entry.target);
                    }
                });
            }, this.options);

            this.observeElements();
        }
    }

    observeElements() {
        const elements = document.querySelectorAll('.service-card, .win-card, .hero__stats, .section__title');
        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            this.observer.observe(el);
        });
    }
}

// Enhanced Analytics Tracker
class PortfolioAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.events = [];
        this.init();
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    init() {
        this.trackPageView();
        this.setupEventListeners();
        this.trackEngagementMetrics();
    }

    trackPageView() {
        this.trackEvent('page_view', {
            page: window.location.pathname,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            language: navigator.language
        });
    }

    trackEvent(eventName, data = {}) {
        const event = {
            eventName,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            timeOnPage: Date.now() - this.startTime,
            ...data
        };

        this.events.push(event);
        
        // Send to Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                'session_id': this.sessionId,
                'time_on_page': Math.round((Date.now() - this.startTime) / 1000),
                ...data
            });
        }
        
        // Store in localStorage for demo purposes
        this.storeEventLocally(event);
        
        // Console log for debugging
        console.log('Analytics Event:', event);
    }

    storeEventLocally(event) {
        const stored = JSON.parse(localStorage.getItem('portfolioAnalytics') || '[]');
        stored.push(event);
        
        // Keep only last 100 events
        if (stored.length > 100) {
            stored.splice(0, stored.length - 100);
        }
        
        localStorage.setItem('portfolioAnalytics', JSON.stringify(stored));
    }

    setupEventListeners() {
        // Track CTA clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn, .win-card__link, .nav__link')) {
                this.trackEvent('cta_click', {
                    element: e.target.className,
                    text: e.target.textContent.trim(),
                    href: e.target.href || null
                });
            }
        });

        // Track email link clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="mailto:"]')) {
                this.trackEvent('email_click', {
                    email: e.target.href.replace('mailto:', '')
                });
            }
        });

        // Track resume downloads
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href*="resume"], a[href*="cv"]')) {
                this.trackEvent('resume_download', {
                    href: e.target.href
                });
            }
        });
    }

    trackEngagementMetrics() {
        let maxScroll = 0;
        let readTime = 0;
        
        // Track scroll depth
        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
                maxScroll = scrollPercent;
                this.trackEvent('scroll_depth', { percentage: scrollPercent });
            }
        };

        // Track reading time
        const trackReadTime = () => {
            readTime += 1;
            if (readTime % 30 === 0) { // Every 30 seconds
                this.trackEvent('reading_time', { seconds: readTime });
            }
        };

        window.addEventListener('scroll', trackScroll);
        setInterval(trackReadTime, 1000);

        // Track page exit
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_exit', {
                timeOnPage: Date.now() - this.startTime,
                maxScrollDepth: maxScroll,
                totalReadTime: readTime
            });
        });
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.init();
    }

    init() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => this.measurePerformance(), 100);
            });
        }
    }

    measurePerformance() {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        if (perfData) {
            const metrics = {
                loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
                totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                ttfb: Math.round(perfData.responseStart - perfData.requestStart)
            };

            console.log('Performance Metrics:', metrics);

            // Track slow performance
            if (metrics.totalTime > 3000) {
                this.showPerformanceNotice();
            }

            // Send to analytics
            if (window.portfolioAnalytics) {
                window.portfolioAnalytics.trackEvent('performance_metrics', metrics);
            }
        }
    }

    showPerformanceNotice() {
        const notice = document.createElement('div');
        notice.style.cssText = `
            position: fixed;
            top: 70px;
            right: 1rem;
            background: #f97316;
            color: white;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            z-index: 1001;
            max-width: 300px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        `;
        notice.textContent = 'Optimizing load time...';
        
        document.body.appendChild(notice);
        
        setTimeout(() => {
            notice.remove();
        }, 4000);
    }
}

// Smooth scrolling enhancement
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    const languageToggle = new LanguageToggle();
    const mobileNav = new MobileNav();
    const animationObserver = new AnimationObserver();
    const performanceMonitor = new PerformanceMonitor();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize analytics
    window.portfolioAnalytics = new PortfolioAnalytics();
    
    // Add subtle loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Utility functions
window.portfolioUtils = {
    // Format numbers with commas
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    // Animate counter
    animateCounter: (element, target, duration = 2000) => {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            element.textContent = Math.floor(start);
            
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, 16);
    },
    
    // Get stored analytics
    getAnalytics: () => {
        return JSON.parse(localStorage.getItem('portfolioAnalytics') || '[]');
    }
};

// Auto-update copyright year
document.addEventListener('DOMContentLoaded', function() {
    const copyrightElement = document.getElementById('copyright-year');
    if (copyrightElement) {
        copyrightElement.textContent = new Date().getFullYear();
    }
});