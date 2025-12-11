// src/pages/dashboard.js
import { getUser, isLoggedIn, isTokenExpired, goTo, logout } from "../../helpers/auth.js";
import { renderSidebar, sidebarInit } from "../../components/sidebar.js";

export function dashboard() {
    if (!isLoggedIn() || isTokenExpired()) {
        goTo("/login");
        return `<p class="text-center py-5">Redirecting to login...</p>`;
    }

    const user = getUser();
    const userRole = user?.role || "user"; // 'admin' or 'user'
    console.log("Rendering dashboard for user role:", userRole);

    return `
        <div class="d-flex" id="dashboardWrapper">
            ${renderSidebar()}
            <div class="flex-grow-1 main-content">
                <main class="container-fluid p-4">
                    <h1 class="mt-5 mb-4">Dashboard Overview</h1>

                    <div class="row g-4">
                        ${userRole === "admin" ? `
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm text-center">
                                    <h6 class="text-muted">Total Users</h6>
                                    <p class="fs-4 fw-bold" id="totalUsers">0</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm text-center">
                                    <h6 class="text-muted">Active Users</h6>
                                    <p class="fs-4 fw-bold" id="activeUsers">0</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm text-center">
                                    <h6 class="text-muted">Today's Orders</h6>
                                    <p class="fs-4 fw-bold" id="todayOrders">0</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm text-center">
                                    <h6 class="text-muted">Pending Orders</h6>
                                    <p class="fs-4 fw-bold" id="pendingOrders">0</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm text-center">
                                    <h6 class="text-muted">This Month Orders</h6>
                                    <p class="fs-4 fw-bold" id="monthOrders">0</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm text-center">
                                    <h6 class="text-muted">This Month Sales</h6>
                                    <p class="fs-4 fw-bold" id="monthSales">0</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm text-center">
                                    <h6 class="text-muted">Today's Revenue</h6>
                                    <p class="fs-4 fw-bold" id="todayRevenue">0</p>
                                </div>
                            </div>
                        ` : `
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm text-center">
                                    <h6 class="text-muted">My Orders</h6>
                                    <p class="fs-4 fw-bold" id="myOrders">0</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm text-center">
                                    <h6 class="text-muted">Pending Orders</h6>
                                    <p class="fs-4 fw-bold" id="pendingOrders">0</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card p-3 shadow-sm text-center">
                                    <h6 class="text-muted">Total Spent</h6>
                                    <p class="fs-4 fw-bold" id="totalSpent">$0</p>
                                </div>
                            </div>
                        `}
                    </div>

                    <h2 class="mt-5 mb-3">Analytics</h2>
                    <div class="row g-4">
                        ${userRole === "admin" ? `
                            <div class="col-lg-6"><div class="card p-3 shadow-sm"><canvas id="salesChart"></canvas></div></div>
                            <div class="col-lg-6"><div class="card p-3 shadow-sm"><canvas id="ordersChart"></canvas></div></div>
                            <div class="col-lg-6"><div class="card p-3 shadow-sm"><canvas id="usersChart"></canvas></div></div>
                        ` : `
                            <div class="col-lg-6"><div class="card p-3 shadow-sm"><canvas id="ordersChart"></canvas></div></div>
                        `}
                    </div>
                </main>
            </div>
        </div>
    `;
}

export async function dashboardInit() {
    if (!isLoggedIn() || isTokenExpired()) {
        goTo("/login");
        return;
    }

    sidebarInit(); // initialize toggle for sidebar

    const user = getUser();
    const userRole = user?.role || "user";
    const token = localStorage.getItem("auth_token");
    console.log("Dashboard init for user role:", token);

    if (userRole === "admin") {
        // Admin fetch full dashboard stats
        const statsRes = await fetch(`${API_BASE}/api/dashboard-stats`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const stats = await statsRes.json();
        document.getElementById("totalUsers").innerText = stats.totalUsers ?? 0;
        document.getElementById("activeUsers").innerText = stats.activeUsers ?? 0;
        document.getElementById("todayOrders").innerText = stats.todayOrders ?? 0;
        document.getElementById("pendingOrders").innerText = stats.pendingOrders ?? 0;
        document.getElementById("monthOrders").innerText = stats.monthOrders ?? 0;
        document.getElementById("monthSales").innerText = `$${stats.monthSales ?? 0}`;
        document.getElementById("todayRevenue").innerText = `$${stats.todayRevenue ?? 0}`;

        const analyticsRes = await fetch(`${API_BASE}/api/dashboard-analytics`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const analytics = await analyticsRes.json();
        const labels = analytics.last30Days;
        new Chart(document.getElementById("salesChart"), {
            type: "line",
            data: { labels, datasets: [{ label: "Sales", data: analytics.sales, borderColor: "#198754", fill: false }] },
            options: { responsive: true }
        });
        new Chart(document.getElementById("ordersChart"), {
            type: "bar",
            data: { labels, datasets: [{ label: "Orders", data: analytics.orders, backgroundColor: "#0d6efd" }] },
            options: { responsive: true }
        });
        new Chart(document.getElementById("usersChart"), {
            type: "line",
            data: { labels, datasets: [{ label: "New Users", data: analytics.newUsers, borderColor: "#fd7e14", fill: false }] },
            options: { responsive: true }
        });
    } else {
        // Non-admin fetch only user's data
        const res = await fetch(`${API_BASE}/api/dashboard-stats`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("User dashboard data:", data);
        document.getElementById("myOrders").innerText = data.myOrders ?? 0;
        document.getElementById("pendingOrders").innerText = data.pendingOrders ?? 0;
        document.getElementById("totalSpent").innerText = `$${data.totalSpent ?? 0}`;

        const labels = data.last30Days;
        new Chart(document.getElementById("ordersChart"), {
            type: "line",
            data: { labels, datasets: [{ label: "My Orders", data: data.orders, borderColor: "#0d6efd", fill: false }] },
            options: { responsive: true }
        });
    }
}