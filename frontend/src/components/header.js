import { goTo, logout } from "../helpers/auth.js";
import { isLoggedIn, getUser } from "../helpers/auth.js";

// Render the header HTML
export function renderHeader() {
    const path = window.location.pathname;

    // Don't render header on admin pages
    if (path.startsWith("/admin")) return "";

    const loggedIn = isLoggedIn();
    const user = getUser() || {};

    return `
    <marquee class="bg-dark py-1 text-center" behavior="scroll" direction="right" scrollamount="5">
        <span class="white">Free Delivery on orders over $50!</span>
    </marquee>

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
