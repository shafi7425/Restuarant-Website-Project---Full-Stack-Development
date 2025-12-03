// src/pages/orders.js
// --------------------
// Orders page (admin + user) with sidebar, filters, pagination and full modal viewer (D2)

import { apiFetch, getUser, isLoggedIn, isTokenExpired, goTo, logout } from "../../helpers/auth.js";
import { renderSidebar, sidebarInit } from "../../components/sidebar.js";

/**
 * Public entry to render Orders page.
 * Replaces #app content with sidebar + orders UI.
 */
export async function ordersPage() {
    const app = document.getElementById("app");
    if (!app) return console.warn("#app not found");

    // Authorization guard
    if (!isLoggedIn() || isTokenExpired()) {
        goTo("/login");
        return;
    }

    // Display loading skeleton
    app.innerHTML = `<div class="container py-5 text-center">
        <div class="spinner-border" role="status"></div>
        <div class="mt-2">Loading orders...</div>
    </div>`;

    try {
        const user = getUser();
        const allOrders = await fetchOrders(user);

        // Render page (synchronously) with initial data
        app.innerHTML = pageTemplate();

        // Insert sidebar html and init
        const sidebarHolder = document.getElementById("sidebar-holder");
        if (sidebarHolder) sidebarHolder.innerHTML = renderSidebar();
        sidebarInit();

        // Initialize controls and render first page
        OrdersController.init({ orders: allOrders, user });

    } catch (err) {
        console.error("Orders page error:", err);
        app.innerHTML = `<div class="container py-5 text-center">
            <h4 class="text-danger">Failed to load orders.</h4>
            <p>${escapeHtml(err.message || "Please try again later.")}</p>
        </div>`;
    }
}

/* ------------------------------
   Fetching orders
   - Admin: GET /api/orders
   - User: Attempt GET /api/orders/user/:id else fallback to GET /api/orders and filter
--------------------------------*/
async function fetchOrders(user) {
    try {
        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
        // Prefer user-specific endpoint for non-admins
        if (user && user.role !== "admin") {
            try {
                const res = await apiFetch(`${base}/api/orders/user/${user.id || user.user_id}`);
                // apiFetch returns parsed JSON
                if (Array.isArray(res)) return res;
                if (Array.isArray(res.orders)) return res.orders;
                if (Array.isArray(res.data)) return res.data;
                // fallback to empty
                return [];
            } catch (err) {
                console.warn("User-specific orders failed, will try generic endpoint:", err);
            }
        }

        // Generic fetch (admin or fallback)
        const res = await apiFetch(`${base}/api/orders`);
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.orders)) return res.orders;
        if (Array.isArray(res.data)) return res.data;
        return [];
    } catch (err) {
        console.error("fetchOrders:", err);
        return [];
    }
}

/* ------------------------------
   Page Template (HTML shell)
--------------------------------*/
function pageTemplate() {
    return `
    <div class="d-flex" id="ordersWrapper">

        <!-- Sidebar placeholder -->
        <div id="sidebar-holder"></div>

        <!-- Main content -->
        <div class="flex-grow-1">
           <main class="container-fluid p-4">
                <h1 class="mt-5 mb-4">Orders</h1>
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                        <input id="filterSearch" class="form-control form-control-sm" style="min-width:220px" placeholder="Search order id or customer...">
                        <select id="filterStatus" class="form-select form-select-sm" style="width:180px">
                            <option value="">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancel">Cancelled</option>
                        </select>
                        <input id="filterFrom" type="date" class="form-control form-control-sm" style="width:170px" title="From">
                        <input id="filterTo" type="date" class="form-control form-control-sm" style="width:170px" title="To">
                        <select id="perPage" class="form-select form-select-sm" style="width:120px">
                            <option value="5">5 / page</option>
                            <option value="10" selected>10 / page</option>
                            <option value="25">25 / page</option>
                            <option value="50">50 / page</option>
                        </select>
                        <button id="applyFilters" class="btn btn-sm btn-primary">Apply</button>
                        <button id="clearFilters" class="btn btn-sm btn-outline-secondary">Clear</button>
                    </div>

                    <div class="ms-auto d-flex gap-2 align-items-center">
                        <div class="text-muted small">Total: <strong id="ordersCount">0</strong></div>
                        <button id="refreshOrders" class="btn btn-sm btn-outline-primary">Refresh</button>
                    </div>
                </div>

                <div id="ordersTableWrap" class="table-responsive">
                    <!-- Table inserted here -->
                </div>

                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div id="paginationInfo" class="text-muted small"></div>
                    <nav><ul id="pagination" class="pagination mb-0"></ul></nav>
                </div>
            </main>
        </div>
    </div>

    <!-- Modal placeholder -->
    <div id="orderModalContainer"></div>
    `;
}

/* ------------------------------
   OrdersController - single stateful controller for filters/pagination/modal
--------------------------------*/
const OrdersController = (function () {
    // state
    let state = {
        allOrders: [],      // original fetched orders
        filtered: [],       // after filters
        user: null,
        page: 1,
        perPage: 10,
        filters: {
            q: "",
            status: "",
            from: "",
            to: ""
        }
    };

    // DOM references (populated on init)
    let refs = {};

    // Initialize controller
    async function init({ orders = [], user }) {
        state.allOrders = Array.isArray(orders) ? orders : [];
        state.user = user || null;
        state.page = 1;
        state.perPage = Number(document.getElementById("perPage")?.value) || 10;

        // refs
        refs = {
            search: document.getElementById("filterSearch"),
            status: document.getElementById("filterStatus"),
            from: document.getElementById("filterFrom"),
            to: document.getElementById("filterTo"),
            perPage: document.getElementById("perPage"),
            applyBtn: document.getElementById("applyFilters"),
            clearBtn: document.getElementById("clearFilters"),
            refreshBtn: document.getElementById("refreshOrders"),
            tableWrap: document.getElementById("ordersTableWrap"),
            ordersCount: document.getElementById("ordersCount"),
            paginationEl: document.getElementById("pagination"),
            paginationInfo: document.getElementById("paginationInfo")
        };

        // Wire events
        refs.applyBtn?.addEventListener("click", () => { state.page = 1; applyFiltersAndRender(); });
        refs.clearBtn?.addEventListener("click", () => { clearFilters(); });
        refs.perPage?.addEventListener("change", () => { state.perPage = Number(refs.perPage.value); state.page = 1; renderPage(); });
        refs.refreshBtn?.addEventListener("click", async () => { await refreshOrders(); });

        // Search on Enter
        refs.search?.addEventListener("keypress", (e) => { if (e.key === "Enter") { state.page = 1; applyFiltersAndRender(); } });

        // Mobile sidebar toggle
        const mobileToggle = document.getElementById("mobileSidebarToggle");
        const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
        if (mobileToggle && sidebarToggleBtn) {
            mobileToggle.addEventListener("click", () => sidebarToggleBtn.click());
        }

        // Initial filter & render
        applyFiltersAndRender();
    }

    async function refreshOrders() {
        try {
            // re-fetch from backend
            const user = state.user;
            const newOrders = await fetchOrders(user);
            state.allOrders = Array.isArray(newOrders) ? newOrders : [];
            state.page = 1;
            applyFiltersAndRender();
        } catch (err) {
            console.error("Refresh failed:", err);
            alert("Failed to refresh orders.");
        }
    }

    function clearFilters() {
        state.filters = { q: "", status: "", from: "", to: "" };
        if (refs.search) refs.search.value = "";
        if (refs.status) refs.status.value = "";
        if (refs.from) refs.from.value = "";
        if (refs.to) refs.to.value = "";
        state.page = 1;
        applyFiltersAndRender();
    }

    function applyFiltersAndRender() {
        // read UI into state.filters
        state.filters.q = refs.search?.value?.trim() || "";
        state.filters.status = refs.status?.value || "";
        state.filters.from = refs.from?.value || "";
        state.filters.to = refs.to?.value || "";
        state.perPage = Number(refs.perPage?.value) || state.perPage;

        // Filter logic: case-insensitive search over order id & customer name/email
        const q = state.filters.q.toLowerCase();

        state.filtered = state.allOrders.filter(order => {
            // Status filter
            if (state.filters.status) {
                const st = (order.status || "").toString().toLowerCase();
                if (!st.includes(state.filters.status.toLowerCase())) return false;
            }

            // Date filter: use created_at.$date if available or created_at
            if (state.filters.from || state.filters.to) {
                const createdAt = order.created_at?.$date || order.created_at || order.created || null;
                let createdTime = null;
                if (createdAt) {
                    try {
                        createdTime = new Date(createdAt).getTime();
                    } catch { createdTime = null; }
                }
                if (state.filters.from) {
                    const fromTime = new Date(state.filters.from).setHours(0,0,0,0);
                    if (!createdTime || createdTime < fromTime) return false;
                }
                if (state.filters.to) {
                    const toTime = new Date(state.filters.to).setHours(23,59,59,999);
                    if (!createdTime || createdTime > toTime) return false;
                }
            }

            // Search query
            if (q) {
                const id = (order._id || order.id || "").toString().toLowerCase();
                const name = (order.user_info?.name || order.customer_name || order.user_name || "").toString().toLowerCase();
                const email = (order.user_info?.email || order.customer_email || "").toString().toLowerCase();
                if (!id.includes(q) && !name.includes(q) && !email.includes(q)) return false;
            }

            return true;
        });

        // Update orders count
        refs.ordersCount && (refs.ordersCount.innerText = String(state.filtered.length));

        // Render page
        renderPage();
    }

    function renderPage() {
        const total = state.filtered.length;
        const per = state.perPage || 10;
        const pages = Math.max(1, Math.ceil(total / per));
        if (state.page > pages) state.page = pages;

        const start = (state.page - 1) * per;
        const end = start + per;
        const pageItems = state.filtered.slice(start, end);

        // Build table
        refs.tableWrap.innerHTML = renderTable(pageItems);

        // Pagination controls
        renderPagination(state.page, pages);

        // Hook row buttons (view details)
        document.querySelectorAll(".view-order-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = btn.dataset.id;
                const order = state.allOrders.find(o => String(o._id || o.id) === String(id));
                if (!order) {
                    // try fetch single order
                    try {
                        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
                        const res = await apiFetch(`${base}/api/orders/${id}`);
                        openOrderModal(res.order || res || {});
                    } catch (err) {
                        console.error(err);
                        alert("Failed to load order details.");
                    }
                } else {
                    openOrderModal(order);
                }
            });
        });
    }

    function renderPagination(current, totalPages) {
        refs.paginationEl.innerHTML = "";

        const createPageBtn = (label, page, disabled=false, active=false) => {
            const li = document.createElement("li");
            li.className = "page-item" + (disabled ? " disabled" : "") + (active ? " active" : "");
            const a = document.createElement("a");
            a.className = "page-link";
            a.href = "#!";
            a.innerText = label;
            a.addEventListener("click", (e) => {
                e.preventDefault();
                if (disabled) return;
                state.page = page;
                renderPage();
            });
            li.appendChild(a);
            return li;
        };

        // prev
        refs.paginationEl.appendChild(createPageBtn("Prev", Math.max(1, current-1), current===1));
        // center: show few pages
        const start = Math.max(1, current - 2);
        const end = Math.min(totalPages, current + 2);
        if (start > 1) refs.paginationEl.appendChild(createPageBtn("1", 1));
        if (start > 2) {
            const gap = document.createElement("li"); gap.className = "page-item disabled"; gap.innerHTML = `<span class="page-link">…</span>`;
            refs.paginationEl.appendChild(gap);
        }
        for (let p = start; p <= end; p++) {
            refs.paginationEl.appendChild(createPageBtn(String(p), p, false, p === current));
        }
        if (end < totalPages - 1) {
            const gap = document.createElement("li"); gap.className = "page-item disabled"; gap.innerHTML = `<span class="page-link">…</span>`;
            refs.paginationEl.appendChild(gap);
        }
        if (end < totalPages) refs.paginationEl.appendChild(createPageBtn(String(totalPages), totalPages));

        // next
        refs.paginationEl.appendChild(createPageBtn("Next", Math.min(totalPages, current+1), current===totalPages));

        refs.paginationInfo && (refs.paginationInfo.innerText = `Showing ${Math.min((current-1)*state.perPage + 1, state.filtered.length)} - ${Math.min(current*state.perPage, state.filtered.length)} of ${state.filtered.length}`);
    }

    return { init };
})();

/* ------------------------------
   Table renderer (responsive)
--------------------------------*/
function renderTable(orders) {
    // handle empty
    if (!Array.isArray(orders) || orders.length === 0) {
        return `<div class="p-4 text-center text-muted">No orders to show.</div>`;
    }

    // Build rows
    const rows = orders.map((order, idx) => {
        const id = escapeHtml(order._id || order.id || "");
        const status = escapeHtml(order.status || "unknown");
        const total = Number(order.total ?? order.grand_total ?? order.total_amount ?? 0).toFixed(2);

        // created date formatting robust
        let createdStr = "Unknown";
        try {
            const createdAt = order.created_at?.$date || order.created_at || order.created || null;
            if (createdAt) {
                const d = new Date(createdAt);
                if (!isNaN(d.getTime())) {
                    const day = String(d.getDate()).padStart(2,"0");
                    const month = String(d.getMonth()+1).padStart(2,"0");
                    const year = d.getFullYear();
                    createdStr = `${day}-${month}-${year}`;
                }
            }
        } catch {}

        // items count
        const items = Array.isArray(order.items) ? order.items : (order.cart || []);
        const itemCount = items.length || 0;

        return `
            <tr>
                <td>${escapeHtml(String(idx + 1))}</td>
                <td class="text-monospace">${id}</td>
                <td>
                    <div class="fw-medium">${escapeHtml(order.user_info?.name || order.customer_name || 'Customer')}</div>
                    <div class="small text-muted">${escapeHtml(order.user_info?.email || order.customer_email || '')}</div>
                </td>
                <td>$${total}</td>
                <td><span class="badge ${statusClass(order.status)}">${status}</span></td>
                <td>${createdStr}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary view-order-btn" data-id="${id}">View</button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="copyToClipboard('${id}')">Copy ID</button>
                        <span class="badge bg-light text-dark align-self-center">${itemCount} items</span>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    return `
    <table class="table table-hover table-striped table-bordered align-middle">
        <thead class="table-dark">
            <tr>
                <th style="width:48px">#</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th style="min-width:220px">Actions</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
    `;
}

/* ------------------------------
   Modal: full order viewer (D2)
--------------------------------*/
function openOrderModal(order) {
    // normalize created date
    let createdStr = "Unknown";
    try {
        const createdAt = order.created_at?.$date || order.created_at || order.created || null;
        if (createdAt) {
            const d = new Date(createdAt);
            if (!isNaN(d.getTime())) {
                createdStr = d.toLocaleString();
            }
        }
    } catch {}

    // items table html
    const items = Array.isArray(order.items) ? order.items : (order.cart || []);
    const itemsHtml = items.length
        ? items.map(it => {
            const title = escapeHtml(it.title || it.name || "Item");
            const qty = Number(it.quantity ?? it.qty ?? 1);
            const price = Number(it.price ?? it.unit_price ?? 0).toFixed(2);
            const subtotal = (qty * Number(it.price ?? it.unit_price ?? 0)).toFixed(2);
            const img = escapeHtml(it.img || it.image || "");
            return `
                <tr>
                    <td style="width:64px"><img src="${img}" width="48" height="48" class="rounded" onerror="this.style.visibility='hidden'"/></td>
                    <td>${title}</td>
                    <td>${qty}</td>
                    <td>$${price}</td>
                    <td>$${subtotal}</td>
                </tr>
            `;
        }).join("")
        : `<tr><td colspan="5" class="text-muted small">No items</td></tr>`;

    // customer info
    const cust = order.user_info || {};
    const notes = escapeHtml(order.user_info?.notes || order.notes || order.order_notes || "");

    // status select (admin only)
    const currentStatus = escapeHtml(order.status || "");

    const user = getUser();
    const isAdmin = user?.role === "admin";

    const modalId = "orderModal";

    // build modal HTML
    const html = `
    <div class="modal fade show" id="${modalId}" tabindex="-1" style="display:block; background: rgba(0,0,0,0.4);">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Order Details — <small class="text-monospace">${escapeHtml(order._id || order.id || "")}</small></h5>
            <button type="button" class="btn-close" id="${modalId}-close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
                <div class="col-md-8">
                    <h6>Items</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr><th></th><th>Title</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="col-md-4">
                    <h6>Customer</h6>
                    <p class="mb-1"><strong>${escapeHtml(cust.name || order.customer_name || "N/A")}</strong></p>
                    <p class="mb-1">${escapeHtml(cust.email || order.customer_email || "")}</p>
                    <p class="mb-1">${escapeHtml(cust.phone || order.user_info?.phone || "")}</p>
                    <p class="mb-1 small text-muted">${escapeHtml(cust.address || order.user_info?.address || "")}</p>

                    <h6 class="mt-3">Order Info</h6>
                    <p class="mb-1"><strong>Total:</strong> $${Number(order.total ?? order.grand_total ?? 0).toFixed(2)}</p>
                    <p class="mb-1"><strong>Status:</strong> <span id="modalStatusBadge" class="badge ${statusClass(order.status)}">${escapeHtml(order.status || "")}</span></p>
                    <p class="mb-1"><strong>Date:</strong> ${createdStr}</p>
                    <p class="mb-1"><strong>Notes:</strong> <div class="small text-muted">${notes || "<i>None</i>"}</div></p>

                    ${isAdmin ? `
                        <div class="mt-3">
                            <label class="form-label small mb-1">Change Status</label>
                            <select id="modalStatusSelect" class="form-select form-select-sm">
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <div class="d-flex gap-2 mt-2">
                                <button id="saveStatusBtn" class="btn btn-sm btn-success">Save</button>
                                <button id="cancelStatusBtn" class="btn btn-sm btn-outline-secondary">Cancel</button>
                            </div>
                        </div>
                    ` : ""}
                </div>
            </div>
          </div>

          <div class="modal-footer">
            <button id="${modalId}-close-2" class="btn btn-sm btn-secondary">Close</button>
            ${isAdmin ? `<button id="${modalId}-print" class="btn btn-sm btn-outline-primary">Print</button>` : ""}
          </div>
        </div>
      </div>
    </div>
    `;

    // attach and wire events
    const container = document.getElementById("orderModalContainer");
    container.innerHTML = html;

    // closing
    const closeBtn = document.getElementById(`${modalId}-close`);
    const closeBtn2 = document.getElementById(`${modalId}-close-2`);
    [closeBtn, closeBtn2].forEach(b => b && b.addEventListener("click", () => closeOrderModal(modalId)));

    // save status
    if (isAdmin) {
        const select = document.getElementById("modalStatusSelect");
        select.value = currentStatus || "pending";

        document.getElementById("saveStatusBtn").addEventListener("click", async () => {
            const newStatus = select.value;
            await updateOrderStatus(order._id || order.id, newStatus);
            // update badge text & class
            const badge = document.getElementById("modalStatusBadge");
            if (badge) {
                badge.className = `badge ${statusClass(newStatus)}`;
                badge.innerText = escapeHtml(newStatus);
            }
            // update in-memory orders list so page reflects change next time render runs
            replaceOrderInState(order._id || order.id, { ...order, status: newStatus });
            alert("Status updated");
        });

        document.getElementById("cancelStatusBtn").addEventListener("click", () => {
            select.value = currentStatus || "pending";
        });

        document.getElementById(`${modalId}-print`)?.addEventListener("click", () => {
            window.print();
        });
    }
}

/* ------------------------------
   Helpers used by modal/actions
--------------------------------*/
function closeOrderModal(id) {
    const container = document.getElementById("orderModalContainer");
    if (container) container.innerHTML = "";
}

async function updateOrderStatus(orderId, newStatus) {
    if (!orderId) return;
    try {
        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
        const payload = { status: newStatus };
        await apiFetch(`${base}/api/orders/update/${orderId}`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
        return true;
    } catch (err) {
        console.warn("Status update failed:", err);
        alert("Failed to update status (backend may not support it).");
        return false;
    }
}

function replaceOrderInState(orderId, newOrder) {
    try {
        // attempt to update global OrdersController state by refreshing data from page
        // simplest approach: trigger refresh
        document.getElementById("refreshOrders")?.click();
    } catch (err) {
        console.warn("Failed to refresh state after update:", err);
    }
}

/* ------------------------------
   Utilities
--------------------------------*/
function statusClass(status) {
    if (!status) return "bg-secondary text-white";
    const s = String(status).toLowerCase();
    if (s.includes("pending")) return "bg-warning text-dark";
    if (s.includes("processing")) return "bg-info text-white";
    if (s.includes("completed") || s.includes("delivered")) return "bg-success text-white";
    if (s.includes("cancel") || s.includes("cancelled")) return "bg-danger text-white";
    return "bg-secondary text-white";
}

function escapeHtml(str = "") {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// copy to clipboard helper
window.copyToClipboard = function (text) {
    try {
        navigator.clipboard.writeText(text);
        const msg = document.createElement("div");
        msg.className = "toast position-fixed bottom-0 end-0 m-3";
        msg.innerHTML = `<div class="toast-body small">Copied to clipboard</div>`;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 1000);
    } catch {
        alert("Copy failed");
    }
};

/* ------------------------------
   Exported (none) - page encapsulated
--------------------------------*/
