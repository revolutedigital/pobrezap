/**
 * ACCESSIBILITY ENHANCEMENTS
 * WCAG 2.1 AA Compliance
 */

class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupReducedMotion();
        this.setupHighContrast();
        this.setupSkipLinks();
        this.setupLiveRegions();
        this.setupTouchTargets();
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        // Escape key handling for modals and menus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeActiveModal();
                this.closeMobileMenu();
            }
        });

        // Tab trapping for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabTrapping(e);
            }
        });

        // Arrow key navigation for menus
        this.setupArrowKeyNavigation();
    }

    // Focus Management
    setupFocusManagement() {
        // Focus visible only for keyboard users
        document.addEventListener('mousedown', () => {
            document.body.classList.add('using-mouse');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.remove('using-mouse');
            }
        });

        // Focus restoration after modal close
        this.focusStack = [];
    }

    // Screen Reader Support
    setupScreenReaderSupport() {
        // Announce page changes
        this.announcePageChanges();
        
        // Dynamic content announcements
        this.setupDynamicAnnouncements();
        
        // Form validation announcements
        this.setupFormValidationAnnouncements();
    }

    // Reduced Motion Support
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduce-motion');
            this.disableAnimations();
        }

        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduce-motion');
                this.disableAnimations();
            } else {
                document.body.classList.remove('reduce-motion');
                this.enableAnimations();
            }
        });
    }

    // High Contrast Support
    setupHighContrast() {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        if (prefersHighContrast.matches) {
            document.body.classList.add('high-contrast');
        }

        prefersHighContrast.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }

    // Skip Links
    setupSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link');
        
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // Live Regions
    setupLiveRegions() {
        this.liveRegion = document.getElementById('live-region');
        
        // Polite announcements
        this.announcePolite = (message) => {
            if (this.liveRegion) {
                this.liveRegion.textContent = message;
                setTimeout(() => {
                    this.liveRegion.textContent = '';
                }, 1000);
            }
        };

        // Assertive announcements
        this.announceAssertive = (message) => {
            const assertiveRegion = document.createElement('div');
            assertiveRegion.setAttribute('aria-live', 'assertive');
            assertiveRegion.className = 'sr-only';
            assertiveRegion.textContent = message;
            document.body.appendChild(assertiveRegion);
            
            setTimeout(() => {
                document.body.removeChild(assertiveRegion);
            }, 1000);
        };
    }

    // Touch Targets
    setupTouchTargets() {
        // Ensure minimum touch target size
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea');
        
        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                element.classList.add('touch-target');
            }
        });
    }

    // Arrow Key Navigation for Menus
    setupArrowKeyNavigation() {
        const menus = document.querySelectorAll('[role="menubar"], [role="menu"]');
        
        menus.forEach(menu => {
            const menuItems = menu.querySelectorAll('[role="menuitem"]');
            let currentIndex = -1;

            menu.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowDown':
                    case 'ArrowRight':
                        e.preventDefault();
                        currentIndex = (currentIndex + 1) % menuItems.length;
                        menuItems[currentIndex].focus();
                        break;
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        e.preventDefault();
                        currentIndex = currentIndex <= 0 ? menuItems.length - 1 : currentIndex - 1;
                        menuItems[currentIndex].focus();
                        break;
                    case 'Home':
                        e.preventDefault();
                        currentIndex = 0;
                        menuItems[currentIndex].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        currentIndex = menuItems.length - 1;
                        menuItems[currentIndex].focus();
                        break;
                }
            });
        });
    }

    // Tab Trapping for Modals
    handleTabTrapping(e) {
        const modal = document.querySelector('.modal.active');
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Close Active Modal
    closeActiveModal() {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            this.restoreFocus();
        }
    }

    // Close Mobile Menu
    closeMobileMenu() {
        const mobileMenu = document.querySelector('.nav__menu.active');
        const menuToggle = document.querySelector('.nav__toggle');
        
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.focus();
        }
    }

    // Focus Management
    storeFocus() {
        this.focusStack.push(document.activeElement);
    }

    restoreFocus() {
        const previousFocus = this.focusStack.pop();
        if (previousFocus) {
            previousFocus.focus();
        }
    }

    // Animation Control
    disableAnimations() {
        const style = document.createElement('style');
        style.id = 'disable-animations';
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }

    enableAnimations() {
        const style = document.getElementById('disable-animations');
        if (style) {
            style.remove();
        }
    }

    // Page Change Announcements
    announcePageChanges() {
        // Announce route changes for SPAs
        let currentPath = window.location.pathname;
        
        const observer = new MutationObserver(() => {
            if (window.location.pathname !== currentPath) {
                currentPath = window.location.pathname;
                const pageTitle = document.title;
                this.announcePolite(`Navegou para ${pageTitle}`);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Dynamic Content Announcements
    setupDynamicAnnouncements() {
        // Announce loading states
        const loadingElements = document.querySelectorAll('[aria-busy="true"]');
        
        loadingElements.forEach(element => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.attributeName === 'aria-busy') {
                        const isBusy = element.getAttribute('aria-busy') === 'true';
                        if (isBusy) {
                            this.announcePolite('Carregando...');
                        } else {
                            this.announcePolite('Carregamento concluído');
                        }
                    }
                });
            });

            observer.observe(element, { attributes: true });
        });
    }

    // Form Validation Announcements
    setupFormValidationAnnouncements() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const invalidFields = form.querySelectorAll(':invalid');
                if (invalidFields.length > 0) {
                    this.announceAssertive(`Formulário contém ${invalidFields.length} erro(s). Por favor, corrija os campos destacados.`);
                }
            });

            // Real-time validation announcements
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('invalid', () => {
                    const errorMessage = input.validationMessage;
                    this.announcePolite(errorMessage);
                });
            });
        });
    }

    // Color Contrast Checker (Development Tool)
    checkColorContrast() {
        if (process.env.NODE_ENV === 'development') {
            // This would integrate with a color contrast checking library
            console.log('Color contrast checking enabled in development mode');
        }
    }

    // Accessibility Testing Helper
    runAccessibilityAudit() {
        if (process.env.NODE_ENV === 'development') {
            // This would integrate with axe-core or similar
            console.log('Accessibility audit running...');
        }
    }
}

// Initialize Accessibility Manager
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityManager();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}