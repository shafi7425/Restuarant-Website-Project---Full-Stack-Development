// src/components/sidebar.js
// --------------------------
// Advanced responsive sidebar with smooth toggle and click-outside auto-close

export function renderSidebar() {

    const user = getUser();
    const userRole = user?.role || "user"; // 'admin' or 'user'
    return `
    <!-- Sidebar Toggle Button -->
    <button class="sidebar-toggle-btn" id="sidebarToggleBtn" aria-label="Toggle Sidebar">
        <i class="ri-menu-line"></i>
    </button>

    <!-- Sidebar -->
    <nav id="sidebar" class="sidebar collapsed bg-dark text-white shadow-sm">
        <div class="sidebar-header d-flex justify-content-between align-items-center px-3 py-3">
            <h4 class="mb-0 text-white">Admin Panel</h4>
            <button class="btn btn-sm btn-outline-light d-md-none" id="sidebarCloseBtn">
                <i class="ri-close-line"></i>
            </button>
        </div>

        <ul class="nav flex-column px-2 mt-3">
            <li class="nav-item mb-2">
                <a class="nav-link text-white active" href="/admin/dashboard" data-link>
                    <i class="ri-dashboard-line me-2"></i> Dashboard
                </a>
            </li>
            <li class="nav-item mb-2">
                <a class="nav-link text-white" href="/admin/orders" data-link>
                    <i class="ri-shopping-cart-2-line me-2"></i> Orders
                </a>
            </li>
            ${userRole === "admin" ? `
                <li class="nav-item mb-2">
                    <a class="nav-link text-white" href="/admin/users" data-link>
                        <i class="ri-user-3-line me-2"></i> Users
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link text-white" href="/admin/dishes" data-link>
                        <i class="ri-store-2-line me-2"></i> Dishes
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link text-white" href="/admin/announcements" data-link>
                        <i class="ri-store-2-line me-2"></i> Announcements
                    </a>
                </li>
                <li class="nav-item mb-2">
                    <a class="nav-link text-white" href="/admin/blogs" data-link>
                        <i class="ri-store-2-line me-2"></i> Blogs
                    </a>
                </li>
            ` : ``}
            <li class="nav-item mt-4">
                <a href="javascript:void(0)" id="logoutBtn" class="nav-link text-danger">
                    <i class="ri-login-box-line me-2"></i> Logout
                </a>
            </li>
        </ul>
    </nav>

    <style>
        /* Sidebar base */
        .sidebar {
            width: 260px;
            min-height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            background: #212529;
            transition: transform 0.3s ease;
            z-index: 1050;
        }
        .sidebar.collapsed {
            transform: translateX(-260px);
        }
        .sidebar.show {
            transform: translateX(0);
        }

        /* Sidebar links */
        .sidebar .nav-link {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            border-radius: 5px;
        }
        .sidebar .nav-link.active {
            background: #343a40;
        }
        .sidebar .nav-link:hover {
            background: rgba(255,255,255,0.1);
        }

        /* Sidebar toggle button */
        .sidebar-toggle-btn {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1060;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #0d6efd;
            color: white;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        }
        .sidebar-toggle-btn:hover {
            transform: scale(1.1) rotate(90deg);
            background-color: #0b5ed7;
        }
        .sidebar-toggle-btn.hide {
            display: none;
        }

        /* Close button for mobile */
        #sidebarCloseBtn {
            display: none;
        }
        @media (max-width: 992px) {
            #sidebarCloseBtn {
                display: inline-flex;
            }
        }

        /* Main content spacing */
        .main-content {
            margin-left: 260px;
            transition: margin-left 0.3s ease;
        }
        .sidebar.collapsed ~ .main-content {
            margin-left: 0 !important;
        }
    </style>
    `;
}


import { getUser, logout } from "../helpers/auth.js";

export function sidebarInit() {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebarToggleBtn");
    const closeBtn = document.getElementById("sidebarCloseBtn");

    const updateToggleBtn = () => {
        if (sidebar.classList.contains("show")) {
            toggleBtn.classList.add("hide");
        } else {
            toggleBtn.classList.remove("hide");
        }
    };

    // Toggle sidebar open
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.remove("collapsed");
            sidebar.classList.add("show");
            updateToggleBtn();
        });
    }

    // Close sidebar with close button
    if (closeBtn && sidebar) {
        closeBtn.addEventListener("click", () => {
            sidebar.classList.add("collapsed");
            sidebar.classList.remove("show");
            updateToggleBtn();
        });
    }

    // Click outside to close
    document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            if (sidebar.classList.contains("show")) {
                sidebar.classList.add("collapsed");
                sidebar.classList.remove("show");
                updateToggleBtn();
            }
        }
    });

    // ⭐ LOGOUT HANDLER
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    }

    updateToggleBtn();
}


