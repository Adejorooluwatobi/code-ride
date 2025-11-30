document.addEventListener("DOMContentLoaded", function() {
    const authPages = ['login.html', 'create-account.html', 'verify-code.html'];
    const currentPageFileName = window.location.pathname.split('/').pop();

    // Only load header and footer if not on an authentication page
    if (!authPages.includes(currentPageFileName)) {
        // Load header and then initialize header-dependent scripts
        fetch(`/components/header.html`)
            .then(response => response.ok ? response.text() : Promise.reject('Failed to load header'))
            .then(data => {
                const headerPlaceholder = document.getElementById("header-placeholder");
                if (headerPlaceholder) {
                    headerPlaceholder.innerHTML = data;
                    initializeSideMenu(); // Initialize after header is loaded
                }
            })
            .catch(console.error);

        // Load footer and then initialize footer-dependent scripts
        fetch(`/components/footer.html`)
            .then(response => response.ok ? response.text() : Promise.reject('Failed to load footer'))
            .then(data => {
                const footerPlaceholder = document.getElementById("footer-placeholder");
                if (footerPlaceholder) {
                    footerPlaceholder.innerHTML = data;
                    updateActiveNav(); // Update nav after footer is loaded
                }
            })
            .catch(console.error);
    } else {
        // For auth pages, directly initialize page-specific logic, as no header/footer is loaded
        initializePageSpecifics();
    }


    // Auth Form Submission Handlers
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Dummy login: always redirects to index.html
            window.location.href = '/pages/index.html';
        });
    }

    const createAccountForm = document.getElementById('createAccountForm');
    if (createAccountForm) {
        createAccountForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Dummy create account: always redirects to verify-code.html
            window.location.href = '/pages/verify-code.html';
        });
    }

    const verifyCodeForm = document.getElementById('verifyCodeForm');
    if (verifyCodeForm) {
        verifyCodeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Dummy verification: any code redirects to index.html
            window.location.href = '/pages/index.html';
        });
    }

    // Logout functionality (added to side menu in header.html)
    // This listener needs to be attached after the header is loaded
    // So, it's part of initializeSideMenu or a function called after header fetch.
    // For now, let's put it here and ensure it handles cases where it's not present immediately.
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'logoutButton') {
            event.preventDefault();
            window.location.href = '/pages/login.html';
        }
    });

    // Initialize page-specific scripts that might not depend on header/footer for other pages.
    // This is called conditionally inside the fetch block for non-auth pages.
    // We also need it for auth pages if they have special needs.
    // For now, it's called in the non-auth branch only.
});

function initializeSideMenu() {
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
}

function updateActiveNav() {
    let currentPage = window.location.pathname.split('/').pop();
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
            // Check for account page and its sub-pages (these might not exist as separate files if they are handled by client-side routing)
            // For now, we assume they are distinct files but activated by clicking 'account' in bottom nav
            const accountSubPages = ['profile', 'ride-history', 'payment-methods', 'ratings-reviews', 'support', 'promotions'];
            if (btn.dataset.page === 'account' && accountSubPages.includes(currentPage)) {
                btn.classList.add('nav-active');
            } else {
                btn.classList.remove('nav-active');
            }
        }
    });
}

function initializePageSpecifics() {
    // Rider/Driver mode toggle for index.html
    const riderModeBtn = document.getElementById('riderModeBtn');
    const driverModeBtn = document.getElementById('driverModeBtn');

    if (riderModeBtn && driverModeBtn) {
        const riderView = document.getElementById('riderView');
        const driverView = document.getElementById('driverView');
        let isDriverMode = false;

        function updateModeUI() {
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
        }

        riderModeBtn.addEventListener('click', () => {
            isDriverMode = false;
            updateModeUI();
        });

        driverModeBtn.addEventListener('click', () => {
            isDriverMode = true;
            updateModeUI();
        });
        
        updateModeUI();
    }
}