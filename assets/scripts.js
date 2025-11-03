/**
 * POBRE ZAP - Interactive Components & UX Enhancements v2.0
 * Enterprise-grade, Accessible, Performance-optimized
 */

(function() {
  'use strict';

  // =========================================================================
  // MOBILE NAVIGATION
  // =========================================================================
  const initMobileNav = () => {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');
    const body = document.body;

    if (!navToggle || !navMenu) return;

    // Toggle menu
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';

      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');

      // Trap focus when menu is open
      if (!isExpanded) {
        navMenu.querySelector('.nav__link')?.focus();
        body.style.overflow = 'hidden'; // Prevent scroll on mobile
      } else {
        body.style.overflow = '';
      }
    });

    // Close menu when clicking on links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        body.style.overflow = '';
      });
    });

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        body.style.overflow = '';
        navToggle.focus();
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') &&
          !navMenu.contains(e.target) &&
          !navToggle.contains(e.target)) {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        body.style.overflow = '';
      }
    });
  };

  // =========================================================================
  // HEADER SCROLL BEHAVIOR
  // =========================================================================
  const initHeaderScroll = () => {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;
    const scrollThreshold = 10;

    const handleScroll = () => {
      const currentScroll = window.pageYOffset;

      // Add shadow when scrolled
      if (currentScroll > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', throttle(handleScroll, 100), { passive: true });
  };

  // =========================================================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // =========================================================================
  const initSmoothScroll = () => {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Skip if href is just "#"
        if (href === '#') {
          e.preventDefault();
          return;
        }

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          // Close mobile menu if open
          const navMenu = document.querySelector('.nav__menu');
          const navToggle = document.querySelector('.nav__toggle');
          if (navMenu?.classList.contains('active')) {
            navToggle?.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
          }

          // Calculate offset for sticky header
          const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Update URL without jumping
          history.pushState(null, '', href);

          // Set focus to target for accessibility
          target.setAttribute('tabindex', '-1');
          target.focus();
          target.removeAttribute('tabindex');
        }
      });
    });
  };

  // =========================================================================
  // INTERSECTION OBSERVER FOR ANIMATIONS
  // =========================================================================
  const initScrollAnimations = () => {
    const animatedElements = document.querySelectorAll('.fade-in-up');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
      });
    }
  };

  // =========================================================================
  // LAZY LOADING FOR IMAGES AND SVGS
  // =========================================================================
  const initLazyLoading = () => {
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');

      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;

            if (element.dataset.src) {
              element.src = element.dataset.src;
              element.removeAttribute('data-src');
            }

            element.classList.add('loaded');
            imageObserver.unobserve(element);
          }
        });
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    }
  };

  // =========================================================================
  // FORM VALIDATION & LOADING STATES
  // =========================================================================
  const initFormHandling = () => {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitButton = form.querySelector('[type="submit"]');
        if (!submitButton) return;

        // Validate required fields
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
          if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');

            field.addEventListener('input', function() {
              this.classList.remove('error');
              this.removeAttribute('aria-invalid');
            }, { once: true });
          }
        });

        if (!isValid) {
          showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
          return;
        }

        // Add loading state
        submitButton.classList.add('loading');
        submitButton.disabled = true;

        const originalText = submitButton.textContent;
        submitButton.textContent = 'Enviando...';

        try {
          // Simulate async operation (replace with actual API call)
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Success state
          submitButton.classList.remove('loading');
          submitButton.textContent = '✓ Enviado!';
          submitButton.style.backgroundColor = 'var(--color-success)';

          // Show success message
          showNotification('Mensagem enviada com sucesso!', 'success');

          // Reset form
          form.reset();

          // Reset button after 3 seconds
          setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.backgroundColor = '';
          }, 3000);

        } catch (error) {
          // Error state
          submitButton.classList.remove('loading');
          submitButton.textContent = '✗ Erro';
          submitButton.style.backgroundColor = 'var(--color-error)';

          showNotification('Erro ao enviar. Tente novamente.', 'error');

          setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.backgroundColor = '';
          }, 3000);
        }
      });
    });
  };

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  const showNotification = (message, type = 'info') => {
    // Check if notification already exists
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      zIndex: '9999',
      fontSize: '16px',
      fontWeight: '500',
      maxWidth: '400px',
      animation: 'fade-in-up 0.3s ease-out',
      backgroundColor: type === 'success' ? 'var(--color-success)' :
                      type === 'error' ? 'var(--color-error)' :
                      'var(--color-info)',
      color: 'white'
    });

    document.body.appendChild(notification);

    // Announce to screen readers
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(10px)';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  };

  // =========================================================================
  // ACCORDION ENHANCEMENTS (FAQ)
  // =========================================================================
  const initAccordions = () => {
    const details = document.querySelectorAll('details');

    details.forEach(detail => {
      const summary = detail.querySelector('summary');

      if (!summary) return;

      // Add aria attributes
      summary.setAttribute('role', 'button');

      // Add click analytics
      summary.addEventListener('click', () => {
        const question = summary.textContent.trim();

        // Track accordion interaction
        trackEvent('accordion_click', {
          question: question,
          action: detail.open ? 'close' : 'open'
        });
      });
    });
  };

  // =========================================================================
  // CTA BUTTON TRACKING
  // =========================================================================
  const initCTATracking = () => {
    const ctaButtons = document.querySelectorAll('.btn--primary, .btn--secondary');

    ctaButtons.forEach(button => {
      button.addEventListener('click', () => {
        const buttonText = button.textContent.trim();
        const buttonLocation = button.closest('section')?.id || 'unknown';

        trackEvent('cta_click', {
          button_text: buttonText,
          location: buttonLocation
        });
      });
    });
  };

  // =========================================================================
  // ANALYTICS EVENT TRACKING
  // =========================================================================
  const trackEvent = (eventName, properties = {}) => {
    // Track with Google Analytics if available
    if (typeof gtag === 'function') {
      gtag('event', eventName, properties);
    }

    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('📊 Event tracked:', eventName, properties);
    }
  };

  // =========================================================================
  // PERFORMANCE MONITORING (Production only)
  // =========================================================================
  const initPerformanceMonitoring = () => {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];

          trackEvent('web_vitals_lcp', {
            value: Math.round(lastEntry.startTime)
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fid = entry.processingStart - entry.startTime;

            trackEvent('web_vitals_fid', {
              value: Math.round(fid)
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Report CLS on page hide
        window.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            trackEvent('web_vitals_cls', {
              value: Math.round(clsValue * 1000)
            });
          }
        }, { once: true });
      } catch (e) {
        // CLS not supported
      }
    }
  };

  // =========================================================================
  // ACTIVE NAV LINK HIGHLIGHT
  // =========================================================================
  const initActiveNavHighlight = () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');

          navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');

            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
            }
          });
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '-100px 0px -100px 0px'
    });

    sections.forEach(section => observer.observe(section));
  };

  // =========================================================================
  // ACCESSIBILITY ENHANCEMENTS
  // =========================================================================
  const initAccessibility = () => {
    // Add keyboard navigation indicator
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Ensure main content has proper ID
    const mainContent = document.querySelector('main');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  };

  // =========================================================================
  // UTILITY FUNCTIONS
  // =========================================================================
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // =========================================================================
  // INITIALIZE ALL COMPONENTS
  // =========================================================================
  const init = () => {
    // Check if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all modules
    initMobileNav();
    initHeaderScroll();
    initSmoothScroll();
    initScrollAnimations();
    initLazyLoading();
    initFormHandling();
    initAccordions();
    initCTATracking();
    initActiveNavHighlight();
    initAccessibility();

    // Initialize performance monitoring only in production
    const isProduction = window.location.hostname !== 'localhost' &&
                        window.location.hostname !== '127.0.0.1' &&
                        !window.location.hostname.includes('local');

    if (isProduction) {
      initPerformanceMonitoring();
    }

    // Log initialization
    console.log('🚀 Pobre Zap: Sistema carregado e operacional');
  };

  // Start initialization
  init();

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      initMobileNav,
      initSmoothScroll,
      showNotification,
      throttle,
      debounce
    };
  }

})();
