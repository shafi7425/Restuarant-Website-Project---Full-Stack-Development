import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { router } from './router.js';

// Load header & footer once
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

// SPA link handler: intercept clicks on links with data-link
document.addEventListener("click", e => {
    const link = e.target.closest("[data-link]");
    if (!link) return;

    e.preventDefault();
    const path = link.getAttribute("href");

    // Only push state if path is different from current
    if (window.location.pathname !== path) {
        history.pushState(null, null, path);
        router(path);
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    router(window.location.pathname);
});

// Initial route: render home or current path
router(window.location.pathname || '/');
