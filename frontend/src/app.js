// app.js
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { router } from './router.js';
import { goTo, isTokenExpired, logout } from "./helpers/auth.js";
import { API_BASE } from "/public/assets/js/api.js";

// -----------------------------
// Refresh header/footer dynamically
// -----------------------------
export function refreshHeader() {
    const path = window.location.pathname;

    const header = document.getElementById('header');
    const footer = document.getElementById('footer');

    // Hide header/footer on admin pages
    if (path.startsWith('/admin')) {
        if (header) header.innerHTML = '';
        if (footer) footer.innerHTML = '';
        return;
    }

    // Render header/footer for non-admin pages
    if (header) header.innerHTML = renderHeader();
    if (footer) footer.innerHTML = renderFooter();
}

// -----------------------------
// SPA link handler
// -----------------------------
document.addEventListener("click", e => {
    const link = e.target.closest("[data-link]");
    if (!link) return;

    e.preventDefault();
    const path = link.getAttribute("href");

    // Only push state if path is different
    if (window.location.pathname !== path) {
        history.pushState(null, null, path);
        router(path);
        refreshHeader(); // Update header/footer dynamically
    }
});

// -----------------------------
// Browser back/forward support
// -----------------------------
window.addEventListener('popstate', () => {
    router(window.location.pathname);
    refreshHeader(); // Update header/footer dynamically
});

// -----------------------------
// Initial load
// -----------------------------
refreshHeader(); // Render header/footer first
router(window.location.pathname || '/');

// -----------------------------
// Auto logout if token expired
// -----------------------------
const token = localStorage.getItem("auth_token");
if (token && isTokenExpired(token)) {
    logout('/login');
}
// Load Public Announcements
async function loadPublicAnnouncements() {
    try {
        const res = await fetch(`${API_BASE}/api/announcements`);
        const data = await res.json();

        const active = data.filter(a => a.status === "active");

        if (!active.length) return;

        const html = active.map(a => `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <strong>${escapeHtml(a.title)}</strong> – ${escapeHtml(a.message)}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `).join("");

        document.getElementById("announcementBar").innerHTML = html;

    } catch (err) {
        console.warn("Announcements failed:", err);
    }
}

// helper
function escapeHtml(str = "") {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

// Call on page load
document.addEventListener("DOMContentLoaded", loadPublicAnnouncements);
