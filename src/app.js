import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { router } from './router.js';

// Load header & footer once
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

// SPA link handler
document.addEventListener("click", e => {
    const link = e.target.closest("[data-link]");
    if (link) {
        e.preventDefault();
        const path = link.getAttribute("href");
        history.pushState(null, null, path);
        router(path);
    }
});

// Handle back/forward buttons
window.addEventListener('popstate', () => {
    router(window.location.pathname);
});

// Initial route
router(window.location.pathname);
