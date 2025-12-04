import { goTo, logout } from "../helpers/auth.js";
import { isLoggedIn, getUser } from "../helpers/auth.js";

let announcementIndex = 0;
let announcementTimer = null;
let announcementPaused = false;

async function loadPublicAnnouncements() {
    try {
        const res = await fetch(`${API_BASE}/api/announcements`);
        const data = await res.json();

        const active = data.filter(a => a.status === "active");
        if (!active.length) return;

        const slider = document.getElementById("announcementSlider");
        const track = document.getElementById("announcementTrack");
        const progressBar = document.getElementById("announcementProgressBar");

        slider.classList.remove("d-none");

        track.innerHTML = active.map((a, i) => `
            <div class="announcement-slide ${i === 0 ? "active" : ""}">
                <span class="announcement-title">${escapeHtml(a.title)}</span>
                <span>${escapeHtml(a.message)}</span>
            </div>
        `).join("");

        const slides = document.querySelectorAll(".announcement-slide");

        function showSlide(i) {
            slides.forEach(s => s.classList.remove("active"));
            slides[i].classList.add("active");

            // Restart progress animation
            progressBar.style.transition = "none";
            progressBar.style.width = "0%";
            requestAnimationFrame(() => {
                progressBar.style.transition = "width 3.5s linear";
                progressBar.style.width = "100%";
            });
        }

        function startAutoSlide() {
            if (announcementTimer) clearInterval(announcementTimer);

            announcementTimer = setInterval(() => {
                if (announcementPaused) return;

                announcementIndex = (announcementIndex + 1) % slides.length;
                showSlide(announcementIndex);

            }, 3500);
        }

        // Pause on hover
        slider.addEventListener("mouseenter", () => announcementPaused = true);
        slider.addEventListener("mouseleave", () => announcementPaused = false);

        showSlide(0);
        startAutoSlide();

    } catch (err) {
        console.warn("Announcement slider failed:", err);
    }
}

function escapeHtml(str = "") {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

document.addEventListener("DOMContentLoaded", loadPublicAnnouncements);


// Render the header HTML
export function renderHeader() {
    const path = window.location.pathname;

    // Don't render header on admin pages
    if (path.startsWith("/admin")) return "";

    const loggedIn = isLoggedIn();
    const user = getUser() || {};

    return `

    <header class="header-light">
        <div class="container">
            <nav class="navbar navbar-expand-lg p-0">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#offcanvasNavbar">
                    <span class="navbar-toggler-icon"><i class="ri-menu-line"></i></span>
                </button>

                <a href="/" class="text-black" data-link><b>Foodie Web</b></a>

                <div class="nav-option order-md-2">
                    <div class="profile-part dropdown-button order-md-2">
                        <div>
                            ${
                                loggedIn
                                    ? `
                                        <!-- Show Dashboard for logged-in users -->
                                        <a href="/admin/dashboard" class="theme-color fw-medium d-flex">
                                            <i class="ri-login-box-line me-2"></i> Dashboard
                                        </a>
                                    `
                                    : `
                                        <!-- Show LOGIN for logged-out users -->
                                        <a href="/login" class="theme-color fw-medium d-flex" data-link>
                                            <i class="ri-login-box-line me-2"></i> Login
                                        </a>
                                    `
                            }
                        </div>
                    </div>
                </div>

                <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar">
                    <div class="offcanvas-header">
                        <button class="navbar-toggler btn-close" id="offcanvas-close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <ul class="navbar-nav justify-content-center flex-grow-1">
                            <li class="nav-item"><a class="nav-link" href="/" data-link>Home</a></li>
                            <li class="nav-item"><a class="nav-link" href="/about-us" data-link>About Us</a></li>
                            <li class="nav-item"><a class="nav-link" href="/blogs" data-link>Blogs</a></li>
                            <li class="nav-item"><a class="nav-link" href="/cart" data-link>Cart</a></li>
                            <li class="nav-item"><a class="nav-link" href="/contact-us" data-link>Contact Us</a></li>
                        </ul>
                    </div>
                </div>

            </nav>
        </div>
    </header>
    `;
}

// -----------------------------
// SPA navigation for all data-link anchors
// -----------------------------
document.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-link]");
    if (link) {
        e.preventDefault();
        goTo(link.getAttribute("href"));
    }
});

// ⭐ LOGOUT HANDLER
document.addEventListener("click", (e) => {
    const logoutBtn = e.target.closest("#logoutBtn");
    if (logoutBtn) {
        e.preventDefault();
        logout();
    }
});


