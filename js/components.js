/**
 * Components Module
 * Handles loading and managing header, footer, and other reusable components
 * Works correctly in both local and deployment environments
 */

const ComponentsModule = (() => {
    // Get the base path for components - works in both local and deployed environments
    const getComponentPath = () => {
        // Since all pages are now in the root directory, we can just return 'components/'
        return 'components/';
    };

    const COMPONENT_PATH = getComponentPath();
    const AUTH_PAGES = ['login.html', 'create-account.html', 'verify-code.html'];

    /**
     * Get the current page filename
     */
    const getCurrentPageFileName = () => {
        let path = window.location.pathname;
        // Handle file:// protocol
        if (window.location.protocol === 'file:') {
            path = window.location.pathname.split('\\').pop();
        }
        return path.split('/').pop() || 'index.html';
    };

    /**
     * Load a component from the components folder
     */
    const loadComponent = async (componentName, targetElementId) => {
        try {
            const componentPath = `${COMPONENT_PATH}${componentName}.html`;
            const response = await fetch(componentPath);

            if (!response.ok) {
                throw new Error(`Failed to load ${componentName}: ${response.status}`);
            }

            const html = await response.text();
            const targetElement = document.getElementById(targetElementId);

            if (targetElement) {
                targetElement.innerHTML = html;
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            return false;
        }
    };

    /**
     * Load header and footer components
     */
    const loadComponents = async () => {
        const currentPage = getCurrentPageFileName();

        // Skip header and footer for auth pages
        if (AUTH_PAGES.includes(currentPage)) {
            return {
                headerLoaded: false,
                footerLoaded: false
            };
        }

        // Load header
        const headerLoaded = await loadComponent('header', 'header-placeholder');

        // Load footer
        const footerLoaded = await loadComponent('footer', 'footer-placeholder');

        return {
            headerLoaded,
            footerLoaded
        };
    };

    /**
     * Initialize all components and dependent functionality
     */
    const initialize = async () => {
        // Load components
        const { headerLoaded, footerLoaded } = await loadComponents();

        // If components were loaded, initialize their functionality
        if (headerLoaded) {
            initializeSideMenu();
        }

        if (footerLoaded) {
            updateActiveNav();
        }

        // Initialize page-specific scripts (like driver mode toggle)
        initializePageSpecifics();

        // Setup auth forms if on auth pages
        setupAuthForms();

        // Setup logout functionality
        setupLogout();
    };

    /**
     * Initialize side menu from header
     */
    const initializeSideMenu = () => {
        const sideMenu = document.getElementById('sideMenu');
        const menuToggle = document.getElementById('menuToggle');
        const menuIcon = document.getElementById('menuIcon');
        const closeIcon = document.getElementById('closeIcon');
        const headerTitle = document.getElementById('headerTitle');

        // Set header title based on the document title
        if (headerTitle && document.title) {
            headerTitle.textContent = document.title.split(' - ')[0];
        }

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sideMenu.classList.toggle('hidden');
                menuIcon.classList.toggle('hidden');
                closeIcon.classList.toggle('hidden');
            });
        }

        // Close menu when clicking outside of it
        document.addEventListener('click', (e) => {
            if (sideMenu && menuToggle && !sideMenu.contains(e.target) && !menuToggle.contains(e.target) && !sideMenu.classList.contains('hidden')) {
                sideMenu.classList.add('hidden');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            }
        });
    };

    /**
     * Update active navigation button based on current page
     */
    const updateActiveNav = () => {
        let currentPage = getCurrentPageFileName();

        // Default to home if path is empty or just index.html
        if (currentPage === '' || currentPage === 'index.html') {
            currentPage = 'home';
        } else {
            // Remove .html extension for comparison
            currentPage = currentPage.replace('.html', '');
        }

        const navButtons = document.querySelectorAll('#bottomNav .nav-button');
        navButtons.forEach(btn => {
            const pageName = btn.dataset.page;
            if (pageName === currentPage) {
                btn.classList.add('nav-active');
            } else {
                // Check for account page and its sub-pages
                const accountSubPages = ['profile', 'ride-history', 'payment-methods', 'ratings-reviews', 'support', 'promotions'];
                if (btn.dataset.page === 'account' && accountSubPages.includes(currentPage)) {
                    btn.classList.add('nav-active');
                } else {
                    btn.classList.remove('nav-active');
                }
            }
        });
    };

    /**
     * Initialize page-specific scripts
     */
    const initializePageSpecifics = () => {
        // Rider/Driver mode toggle for index.html
        const riderModeBtn = document.getElementById('riderModeBtn');
        const driverModeBtn = document.getElementById('driverModeBtn');

        if (riderModeBtn && driverModeBtn) {
            const riderView = document.getElementById('riderView');
            const driverView = document.getElementById('driverView');
            let isDriverMode = false;

            const updateModeUI = () => {
                if (!isDriverMode) {
                    riderView.classList.remove('hidden');
                    driverView.classList.add('hidden');
                    riderModeBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
                    riderModeBtn.classList.remove('text-gray-500');
                    driverModeBtn.classList.add('text-gray-500');
                    driverModeBtn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
                } else {
                    driverView.classList.remove('hidden');
                    riderView.classList.add('hidden');
                    driverModeBtn.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
                    driverModeBtn.classList.remove('text-gray-500');
                    riderModeBtn.classList.add('text-gray-500');
                    riderModeBtn.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
                }
            };

            riderModeBtn.addEventListener('click', () => {
                isDriverMode = false;
                updateModeUI();
            });

            driverModeBtn.addEventListener('click', () => {
                isDriverMode = true;
                updateModeUI();
            });

            // Initial UI update
            updateModeUI();
        }
    };

    /**
     * Setup authentication form handlers
     */
    const setupAuthForms = () => {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function (event) {
                event.preventDefault();
                window.location.href = 'index.html';
            });
        }

        const createAccountForm = document.getElementById('createAccountForm');
        if (createAccountForm) {
            createAccountForm.addEventListener('submit', function (event) {
                event.preventDefault();
                window.location.href = 'verify-code.html';
            });
        }

        const verifyCodeForm = document.getElementById('verifyCodeForm');
        if (verifyCodeForm) {
            verifyCodeForm.addEventListener('submit', function (event) {
                event.preventDefault();
                window.location.href = 'index.html';
            });
        }
    };

    /**
     * Setup logout functionality
     */
    const setupLogout = () => {
        document.addEventListener('click', function (event) {
            if (event.target && event.target.id === 'logoutButton') {
                event.preventDefault();
                window.location.href = 'login.html';
            }
        });
    };

    // Public API
    return {
        initialize,
        loadComponent,
        updateActiveNav,
        initializeSideMenu
    };
})();

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    ComponentsModule.initialize();
});
