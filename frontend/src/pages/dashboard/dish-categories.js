// src/pages/dishCategories.js
// Dishes Categories page (list, add, edit, soft-delete, pagination, search)
// Requires: apiFetch, API_BASE, getUser, isLoggedIn, isTokenExpired, goTo
import { apiFetch, getUser, isLoggedIn, isTokenExpired, goTo } from "../../helpers/auth.js";
import { renderSidebar, sidebarInit } from "../../components/sidebar.js";

/**
 * Entry function - mount into #app
 */
export async function dishcategoriesPage() {
    const app = document.getElementById("app");
    if (!app) return console.warn("#app not found");

    if (!isLoggedIn() || isTokenExpired()) {
        goTo("/login");
        return;
    }

    app.innerHTML = loadingUI();

    try {
        // fetch first page
        const res = await apiFetch(`${API_BASE}/api/dishes/categories?page=1&limit=10`);
        // res: { categories: [...], total, page, pages, limit }
        const categories = res.categories || [];
        app.innerHTML = pageTemplate();

        // insert sidebar and init
        const holder = document.getElementById("sidebar-holder");
        if (holder) {
            holder.innerHTML = renderSidebar();
            sidebarInit();
        }

        // init controller
        CategoriesController.init({
            initial: categories,
            total: res.total || 0,
            page: res.page || 1,
            pages: res.pages || 1,
            limit: res.limit || 10
        });

    } catch (err) {
        console.error("Categories load error:", err);
        app.innerHTML = `<div class="container py-5 text-center"><h4 class="text-danger">Failed to load categories</h4><p>${err.message || ""}</p></div>`;
    }
}

/* --------------------------
   Page skeleton
---------------------------*/
function pageTemplate() {
    return `
    <div class="d-flex" id="categoriesWrapper">
        <div id="sidebar-holder"></div>

        <div class="flex-grow-1">
            <nav class="navbar navbar-light bg-white shadow-sm d-md-none">
                <div class="container-fluid">
                    <button class="btn btn-outline-primary" type="button" id="mobileSidebarToggle"><i class="ri-menu-line"></i></button>
                    <span class="navbar-brand mb-0 h1">Categories</span>
                </div>
            </nav>

            <main class="container-fluid p-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                        <input id="catSearch" class="form-control form-control-sm" style="min-width:220px" placeholder="Search categories...">
                        <select id="perPage" class="form-select form-select-sm" style="width:120px">
                            <option value="5">5 / page</option>
                            <option value="10" selected>10 / page</option>
                            <option value="25">25 / page</option>
                        </select>
                        <button id="applyCatFilters" class="btn btn-sm btn-primary">Apply</button>
                        <button id="addCategoryBtn" class="btn btn-sm btn-success">Add Category</button>
                    </div>
                    <div class="ms-auto d-flex gap-2 align-items-center">
                        <div class="text-muted small">Total: <strong id="categoriesCount">0</strong></div>
                        <button id="refreshCats" class="btn btn-sm btn-outline-primary">Refresh</button>
                    </div>
                </div>

                <div id="catsTableWrap" class="table-responsive"></div>

                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div id="paginationInfo" class="text-muted small"></div>
                    <nav><ul id="pagination" class="pagination mb-0"></ul></nav>
                </div>
            </main>
        </div>
    </div>

    <div id="categoryModalContainer"></div>
    `;
}

/* --------------------------
   Controller
---------------------------*/
const CategoriesController = (function () {
    let state = {
        all: [],      // full page set loaded from server for current page
        total: 0,
        page: 1,
        pages: 1,
        perPage: 10,
        query: ""
    };

    let refs = {};

    function init({ initial = [], total = 0, page = 1, pages = 1, limit = 10 }) {
        state.all = Array.isArray(initial) ? initial : [];
        state.total = total || 0;
        state.page = page || 1;
        state.pages = pages || 1;
        state.perPage = limit || 10;

        refs = {
            search: document.getElementById("catSearch"),
            perPage: document.getElementById("perPage"),
            apply: document.getElementById("applyCatFilters"),
            addBtn: document.getElementById("addCategoryBtn"),
            refresh: document.getElementById("refreshCats"),
            tableWrap: document.getElementById("catsTableWrap"),
            count: document.getElementById("categoriesCount"),
            pagination: document.getElementById("pagination"),
            paginationInfo: document.getElementById("paginationInfo")
        };

        // wire events
        refs.apply?.addEventListener("click", () => {
            state.query = refs.search.value.trim();
            state.perPage = Number(refs.perPage.value) || state.perPage;
            state.page = 1;
            fetchAndRender();
        });
        refs.refresh?.addEventListener("click", async () => { await fetchAndRender(); });
        refs.search?.addEventListener("keypress", (e) => { if (e.key === "Enter") { state.query = refs.search.value.trim(); state.page = 1; fetchAndRender(); } });

        refs.addBtn?.addEventListener("click", () => openCategoryModal());

        // initial render
        renderTable(state.all);
        updateCount();
        renderPagination();
    }

    async function fetchAndRender(page = state.page) {
        try {
            const base = typeof API_BASE !== "undefined" ? API_BASE : "";
            const limit = state.perPage;
            const q = encodeURIComponent(state.query || "");
            const url = `${base}/api/dishes/categories?page=${page}&limit=${limit}${q ? `&q=${q}` : ""}`;
            const res = await apiFetch(url);
            state.all = Array.isArray(res.categories) ? res.categories : res.categories || [];
            state.total = res.total || 0;
            state.page = res.page || page;
            state.pages = res.pages || Math.max(1, Math.ceil(state.total / state.perPage));
            renderTable(state.all);
            updateCount();
            renderPagination();
        } catch (err) {
            console.error("Fetch categories error:", err);
            refs.tableWrap.innerHTML = `<div class="p-4 text-center text-danger">Failed to load categories</div>`;
        }
    }

    function updateCount() {
        refs.count && (refs.count.innerText = String(state.total || state.all.length || 0));
    }

    function renderTable(items) {
        if (!Array.isArray(items) || items.length === 0) {
            refs.tableWrap.innerHTML = `<div class="p-4 text-center text-muted">No categories found.</div>`;
            return;
        }

        const rows = items.map((c, idx) => {
            const created = c.created_at?.$date ? (new Date(c.created_at.$date)).toLocaleDateString() : (c.created_at || "");
            const deleted = c.deleted_at ? " (deleted)" : "";
            return `
                <tr>
                    <td>${escapeHtml(String(idx + 1))}</td>
                    <td class="text-monospace">${escapeHtml(c._id)}</td>
                    <td>${escapeHtml(c.name)}${deleted}</td>
                    <td>${escapeHtml(c.slug || "")}</td>
                    <td>${created}</td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary edit-cat-btn" data-id="${c._id}">Edit</button>
                            <button class="btn btn-sm btn-outline-danger delete-cat-btn" data-id="${c._id}">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        refs.tableWrap.innerHTML = `
            <table class="table table-hover table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th style="width:48px">#</th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;

        // attach events
        document.querySelectorAll(".edit-cat-btn").forEach(b => b.addEventListener("click", async (e) => {
            const id = b.dataset.id;
            openCategoryModal(id);
        }));

        document.querySelectorAll(".delete-cat-btn").forEach(b => b.addEventListener("click", async (e) => {
            const id = b.dataset.id;
            if (!confirm("Delete this category? (soft delete)")) return;
            try {
                const base = typeof API_BASE !== "undefined" ? API_BASE : "";
                await apiFetch(`${base}/api/dishes/categories/${id}`, { method: "DELETE" });
                alert("Category deleted (soft).");
                await fetchAndRender(1);
            } catch (err) {
                console.error("Delete category error:", err);
                alert("Failed to delete category.");
            }
        }));
    }

    function renderPagination() {
        refs.pagination.innerHTML = "";
        const totalPages = state.pages || Math.max(1, Math.ceil((state.total || state.all.length) / state.perPage));
        const current = state.page || 1;

        const createLi = (label, page, disabled=false, active=false) => {
            const li = document.createElement("li");
            li.className = "page-item" + (disabled ? " disabled" : "") + (active ? " active" : "");
            const a = document.createElement("a");
            a.className = "page-link";
            a.href = "#!";
            a.innerText = label;
            a.addEventListener("click", (e) => {
                e.preventDefault();
                if (disabled || active) return;
                state.page = page;
                fetchAndRender(page);
            });
            li.appendChild(a);
            return li;
        };

        refs.pagination.appendChild(createLi("Prev", Math.max(1, current-1), current===1));
        const start = Math.max(1, current - 2);
        const end = Math.min(totalPages, current + 2);
        if (start > 1) refs.pagination.appendChild(createLi("1", 1));
        if (start > 2) {
            const gap = document.createElement("li"); gap.className = "page-item disabled"; gap.innerHTML = `<span class="page-link">…</span>`; refs.pagination.appendChild(gap);
        }
        for (let p = start; p <= end; p++) refs.pagination.appendChild(createLi(String(p), p, false, p===current));
        if (end < totalPages - 1) {
            const gap = document.createElement("li"); gap.className = "page-item disabled"; gap.innerHTML = `<span class="page-link">…</span>`; refs.pagination.appendChild(gap);
        }
        if (end < totalPages) refs.pagination.appendChild(createLi(String(totalPages), totalPages));
        refs.pagination.appendChild(createLi("Next", Math.min(totalPages, current+1), current===totalPages));

        refs.paginationInfo && (refs.paginationInfo.innerText = `Showing page ${current} of ${totalPages} (${state.total || 0} items)`);
    }

    return { init };
})();

/* --------------------------
   Modal / Add & Edit
---------------------------*/
async function openCategoryModal(id) {
    // id undefined => create new
    let mode = id ? "edit" : "add";
    let category = { name: "", slug: "" };

    if (id) {
        try {
            const base = typeof API_BASE !== "undefined" ? API_BASE : "";
            const res = await apiFetch(`${base}/api/dishes/categories/${id}`);
            category = (res.category || res) || category;
        } catch (err) {
            console.error("Load category for edit failed:", err);
            alert("Failed to load category details.");
            return;
        }
    }

    const modalId = "catModal";
    const html = `
    <div class="modal fade show" id="${modalId}" tabindex="-1" style="display:block; background: rgba(0,0,0,0.4);">
      <div class="modal-dialog modal-md">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${mode === "add" ? "Add Category" : "Edit Category"}</h5>
            <button type="button" class="btn-close" id="${modalId}-close"></button>
          </div>
          <div class="modal-body">
            <form id="catForm">
                <div class="mb-3">
                    <label class="form-label small">Name</label>
                    <input id="catName" class="form-control" required value="${escapeHtml(category.name || "")}" />
                </div>
                <div class="mb-3">
                    <label class="form-label small">Slug (optional)</label>
                    <input id="catSlug" class="form-control" value="${escapeHtml(category.slug || "")}" />
                    <div class="form-text">If left blank slug will be generated from name.</div>
                </div>
            </form>
          </div>
          <div class="modal-footer">
            <button id="${modalId}-cancel" class="btn btn-sm btn-outline-secondary">Cancel</button>
            <button id="${modalId}-save" class="btn btn-sm btn-primary">${mode === "add" ? "Create" : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
    `;

    const container = document.getElementById("categoryModalContainer");
    container.innerHTML = html;

    document.getElementById(`${modalId}-close`).addEventListener("click", () => closeCategoryModal());
    document.getElementById(`${modalId}-cancel`).addEventListener("click", () => closeCategoryModal());

    document.getElementById(`${modalId}-save`).addEventListener("click", async () => {
        const name = document.getElementById("catName").value.trim();
        let slug = document.getElementById("catSlug").value.trim();
        if (!name) { alert("Name required"); return; }
        if (!slug) slug = name.toLowerCase().replace(/\s+/g, "-");

        try {
            const base = typeof API_BASE !== "undefined" ? API_BASE : "";
            if (mode === "add") {
                await apiFetch(`${base}/api/dishes/categories`, {
                    method: "POST",
                    body: JSON.stringify({ name, slug })
                });
                alert("Category created");
            } else {
                await apiFetch(`${base}/api/dishes/categories/${id}`, {
                    method: "PUT",
                    body: JSON.stringify({ name, slug })
                });
                alert("Category updated");
            }
            closeCategoryModal();
            // refresh list
            document.getElementById("refreshCats")?.click();
        } catch (err) {
            console.error("Save category error:", err);
            alert(err.response?.error || err.message || "Save failed");
        }
    });
}

function closeCategoryModal() {
    const container = document.getElementById("categoryModalContainer");
    if (container) container.innerHTML = "";
}

/* --------------------------
   UI Helpers
---------------------------*/
function loadingUI() {
    return `<div class="container py-5 text-center"><div class="spinner-border" role="status"></div><div class="mt-2">Loading categories...</div></div>`;
}

function escapeHtml(str = "") {
    return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
