// src/pages/dishes.js
// --------------------
// Dishes admin page: list, add, edit, delete, categories, image upload (multipart)
// Assumptions:
// - API_BASE global constant available (e.g. from api.js)
// - Helper functions exported from ../../helpers/auth.js include apiFetch, getUser, isLoggedIn, isTokenExpired, goTo
// - Sidebar component at ../../components/sidebar.js exports renderSidebar and sidebarInit

import { apiFetch, getUser, isLoggedIn, isTokenExpired, goTo } from "../../helpers/auth.js";
import { renderSidebar, sidebarInit } from "../../components/sidebar.js";

/* -----------------------
   Public entry point used by router
   ----------------------- */
export async function dishesPage() {
    const app = document.getElementById("app");
    if (!app) return console.warn("#app missing");

    // auth guard
    if (!isLoggedIn() || isTokenExpired()) {
        goTo("/login");
        return;
    }

    // show loader
    app.innerHTML = loadingUI();

    try {
        // fetch initial data
        const [dishes, categories] = await Promise.all([fetchDishes(), fetchCategories()]);

        // render shell & sidebar
        app.innerHTML = pageTemplate();
        const sidebarHolder = document.getElementById("sidebar-holder");
        if (sidebarHolder) sidebarHolder.innerHTML = renderSidebar();
        sidebarInit();

        // init controller with fetched data
        DishesController.init({ dishes, categories, user: getUser() });
    } catch (err) {
        console.error("Dishes page error:", err);
        app.innerHTML = `<div class="container py-5 text-center"><h4 class="text-danger">Failed to load dishes.</h4><p>${escapeHtml(err.message || "")}</p></div>`;
    }
}

/* -----------------------
   API helpers
   ----------------------- */
async function fetchDishes() {
    try {
        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
        const res = await apiFetch(`${base}/api/dishes`);
        console.log("Fetched dishes:", res);
        // handle possible shapes
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.dishes)) return res.dishes;
        if (Array.isArray(res.data)) return res.data;
        if (res && res.dishes && Array.isArray(res.dishes)) return res.dishes;
        return [];
    } catch (err) {
        console.warn("fetchDishes error:", err);
        return [];
    }
}

async function fetchCategories() {
    try {
        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
        const res = await apiFetch(`${base}/api/dishes/categories`);
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.categories)) return res.categories;
        if (Array.isArray(res.data)) return res.data;
        return [];
    } catch (err) {
        console.warn("fetchCategories error:", err);
        return [];
    }
}

/* -----------------------
   Page template (shell)
   ----------------------- */
function pageTemplate() {
    return `
    <div class="d-flex" id="dishesWrapper">
        <!-- Sidebar placeholder -->
        <div id="sidebar-holder"></div>

        <div class="flex-grow-1">
            <nav class="navbar navbar-light bg-white shadow-sm d-md-none">
                <div class="container-fluid">
                    <button class="btn btn-outline-primary" type="button" id="mobileSidebarToggle">
                        <i class="ri-menu-line"></i>
                    </button>
                    <span class="navbar-brand mb-0 h1">Dishes</span>
                </div>
            </nav>

            <main class="container-fluid p-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                        <input id="filterSearch" class="form-control form-control-sm" style="min-width:220px" placeholder="Search title or id...">
                        <select id="filterDay" class="form-select form-select-sm" style="width:150px">
                            <option value="">All days</option>
                            <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
                            <option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option>
                        </select>
                        <select id="filterCategory" class="form-select form-select-sm" style="width:180px">
                            <option value="">All categories</option>
                        </select>
                        <select id="perPage" class="form-select form-select-sm" style="width:120px">
                            <option value="5">5 / page</option>
                            <option value="10" selected>10 / page</option>
                            <option value="25">25 / page</option>
                        </select>
                        <button id="applyFilters" class="btn btn-sm btn-primary">Apply</button>
                        <button id="clearFilters" class="btn btn-sm btn-outline-secondary">Clear</button>
                    </div>

                    <div class="ms-auto d-flex gap-2 align-items-center">
                        <div class="text-muted small">Total: <strong id="dishesCount">0</strong></div>
                        <button id="btnAddDish" class="btn btn-sm btn-success">+ Add Dish</button>
                        <a class="btn btn-sm btn-primary" href="/admin/dishcategories">View Categories</a>
                        <button id="refreshDishes" class="btn btn-sm btn-outline-primary">Refresh</button>
                    </div>
                </div>

                <div id="dishesTableWrap" class="table-responsive"></div>

                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div id="paginationInfo" class="text-muted small"></div>
                    <nav><ul id="pagination" class="pagination mb-0"></ul></nav>
                </div>
            </main>
        </div>
    </div>

    <!-- Modal container -->
    <div id="dishModalContainer"></div>
    `;
}

/* -----------------------
   DishesController - manages state, filters, pagination, modal, CRUD
   ----------------------- */
const DishesController = (function () {
    // state
    let state = {
        all: [],          // original fetched dishes
        categories: [],   // categories list
        filtered: [],     // after filters
        page: 1,
        perPage: 10,
        filters: { q: "", day: "", category: "" },
        user: null
    };

    // refs
    let refs = {};

    async function init({ dishes = [], categories = [], user = null }) {
        state.all = Array.isArray(dishes) ? dishes : [];
        state.categories = Array.isArray(categories) ? categories : [];
        state.user = user;
        state.page = 1;
        state.perPage = Number(document.getElementById("perPage")?.value) || 10;

        refs = {
            search: document.getElementById("filterSearch"),
            day: document.getElementById("filterDay"),
            category: document.getElementById("filterCategory"),
            perPage: document.getElementById("perPage"),
            applyBtn: document.getElementById("applyFilters"),
            clearBtn: document.getElementById("clearFilters"),
            addBtn: document.getElementById("btnAddDish"),
            refreshBtn: document.getElementById("refreshDishes"),
            tableWrap: document.getElementById("dishesTableWrap"),
            count: document.getElementById("dishesCount"),
            paginationEl: document.getElementById("pagination"),
            paginationInfo: document.getElementById("paginationInfo")
        };

        // populate category filter dropdown
        populateCategoryFilter();

        // wire events
        refs.applyBtn?.addEventListener("click", () => { state.page = 1; applyFiltersAndRender(); });
        refs.clearBtn?.addEventListener("click", () => clearFilters());
        refs.perPage?.addEventListener("change", () => { state.perPage = Number(refs.perPage.value); state.page = 1; renderPage(); });
        refs.addBtn?.addEventListener("click", () => openDishModal(null));
        refs.refreshBtn?.addEventListener("click", async () => await refreshData());
        refs.search?.addEventListener("keypress", (e) => { if (e.key === "Enter") { state.page = 1; applyFiltersAndRender(); } });

        // mobile sidebar toggle wiring (connect to sidebar toggle button produced by renderSidebar)
        const mobileToggle = document.getElementById("mobileSidebarToggle");
        const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
        if (mobileToggle && sidebarToggleBtn) mobileToggle.addEventListener("click", () => sidebarToggleBtn.click());

        // initial filter & render
        applyFiltersAndRender();
    }

    async function refreshData() {
        try {
            const fresh = await fetchDishes();
            state.all = Array.isArray(fresh) ? fresh : [];
            state.page = 1;
            applyFiltersAndRender();
        } catch (err) {
            console.error("Refresh failed:", err);
            alert("Failed to refresh dishes.");
        }
    }

    function populateCategoryFilter() {
        const sel = refs.category;
        if (!sel) return;
        sel.innerHTML = `<option value="">All categories</option>`;
        state.categories.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c._id || c.id || c.slug || c.name;
            opt.innerText = c.name || c.title || c.slug || String(c._id || "");
            sel.appendChild(opt);
        });
    }

    function clearFilters() {
        state.filters = { q: "", day: "", category: "" };
        if (refs.search) refs.search.value = "";
        if (refs.day) refs.day.value = "";
        if (refs.category) refs.category.value = "";
        state.page = 1;
        applyFiltersAndRender();
    }

    function applyFiltersAndRender() {
        const q = (refs.search?.value || "").trim().toLowerCase();
        const day = (refs.day?.value || "").trim();
        const cat = (refs.category?.value || "").trim();

        state.filters.q = q;
        state.filters.day = day;
        state.filters.category = cat;
        state.perPage = Number(refs.perPage?.value) || state.perPage;

        state.filtered = state.all.filter(d => {
            // day filter
            if (day && String((d.day || "")).toLowerCase() !== day.toLowerCase()) return false;
            // category filter (backend stores category id in d.category_id or category._id)
            if (cat) {
                const dCat = (d.category_id || d.category?._id || d.category)?.toString();
                if (!dCat || String(dCat) !== String(cat)) return false;
            }
            // text search
            if (q) {
                const title = (d.title || "").toString().toLowerCase();
                const id = (d._id || d.id || "").toString().toLowerCase();
                if (!title.includes(q) && !id.includes(q)) return false;
            }
            return true;
        });

        refs.count && (refs.count.innerText = String(state.filtered.length));
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

        refs.tableWrap.innerHTML = renderTable(pageItems, start);
        renderPagination(state.page, pages, total);
        wireTableButtons();
    }

    function renderPagination(current, totalPages, totalItems = 0) {
        refs.paginationEl.innerHTML = "";

        const createPageBtn = (label, page, disabled = false, active = false) => {
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

        refs.paginationEl.appendChild(createPageBtn("Prev", Math.max(1, current - 1), current === 1));

        const start = Math.max(1, current - 2);
        const end = Math.min(totalPages, current + 2);
        if (start > 1) refs.paginationEl.appendChild(createPageBtn("1", 1));
        if (start > 2) {
            const gap = document.createElement("li");
            gap.className = "page-item disabled";
            gap.innerHTML = `<span class="page-link">…</span>`;
            refs.paginationEl.appendChild(gap);
        }
        for (let p = start; p <= end; p++) {
            refs.paginationEl.appendChild(createPageBtn(String(p), p, false, p === current));
        }
        if (end < totalPages - 1) {
            const gap = document.createElement("li");
            gap.className = "page-item disabled";
            gap.innerHTML = `<span class="page-link">…</span>`;
            refs.paginationEl.appendChild(gap);
        }
        if (end < totalPages) refs.paginationEl.appendChild(createPageBtn(String(totalPages), totalPages));
        refs.paginationEl.appendChild(createPageBtn("Next", Math.min(totalPages, current + 1), current === totalPages));

        refs.paginationInfo && (refs.paginationInfo.innerText = `Showing ${Math.min((current - 1) * state.perPage + 1, state.filtered.length)} - ${Math.min(current * state.perPage, state.filtered.length)} of ${state.filtered.length}`);
    }

    function wireTableButtons() {
        // Edit buttons
        document.querySelectorAll(".edit-dish-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                let dish = state.all.find(d => String(d._id || d.id) === String(id));
                if (!dish) {
                    try {
                        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
                        const res = await apiFetch(`${base}/api/dishes/${id}`);
                        dish = res?.data || res?.dish || res;
                    } catch (err) {
                        console.error("Failed to fetch dish:", err);
                        alert("Failed to load dish for editing.");
                        return;
                    }
                }
                openDishModal(dish);
            });
        });

        // Delete buttons
        document.querySelectorAll(".delete-dish-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                if (!confirm("Delete this dish?")) return;
                try {
                    const base = typeof API_BASE !== "undefined" ? API_BASE : "";
                    const token = localStorage.getItem("auth_token");
                    const res = await fetch(`${base}/api/dishes/${id}`, {
                        method: "DELETE",
                        headers: token ? { "Authorization": `Bearer ${token}` } : {}
                    });
                    if (!res.ok) {
                        const txt = await res.text();
                        throw new Error(txt || "Delete failed");
                    }
                    // remove locally & refresh
                    state.all = state.all.filter(d => String(d._id || d.id) !== String(id));
                    applyFiltersAndRender();
                    alert("Deleted");
                } catch (err) {
                    console.error("Delete failed:", err);
                    alert("Failed to delete dish");
                }
            });
        });

        // View (image) click
        document.querySelectorAll(".dish-thumb").forEach(img => {
            img.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                const dish = state.all.find(d => String(d._id || d.id) === String(id));
                if (dish) openDishModal(dish, { readonly: true });
            });
        });
    }

    // expose init
    return { init };
})();

/* -----------------------
   Table rendering
   ----------------------- */
function renderTable(items, offset = 0) {
    if (!Array.isArray(items) || items.length === 0) {
        return `<div class="p-4 text-center text-muted">No dishes found.</div>`;
    }

    const rows = items.map((d, idx) => {
        const id = escapeHtml(d._id || d.id || "");
        const title = escapeHtml(d.title || "");
        const day = escapeHtml(d.day || "");
        const created = formatDate(d.created_at || d.createdAt || d.created || null);
        const price = Number(d.price ?? d.unit_price ?? 0).toFixed(2);
        const img = escapeHtml(d.img || d.image || "");

        // category title if available
        const catTitle = d.category?.name || d.category_title || d.category_name || "";

        return `
        <tr>
            <td>${escapeHtml(String(offset + idx + 1))}</td>
            <td class="text-monospace">${id}</td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <img src="${img}" width="64" height="48" class="rounded dish-thumb" data-id="${id}" style="object-fit:cover;cursor:pointer;" onerror="this.style.visibility='hidden'"/>
                    <div>
                        <div class="fw-semibold">${title}</div>
                        <div class="small text-muted">${day}</div>
                    </div>
                </div>
            </td>
            <td>$${price}</td>
            <td>${escapeHtml(catTitle)}</td>
            <td>${created}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary edit-dish-btn" data-id="${id}">Edit</button>
                    <button class="btn btn-sm btn-outline-danger delete-dish-btn" data-id="${id}">Delete</button>
                </div>
            </td>
        </tr>`;
    }).join("");

    return `
    <table class="table table-hover table-striped table-bordered align-middle">
        <thead class="table-dark">
            <tr>
                <th style="width:48px">#</th>
                <th>Dish ID</th>
                <th>Dish</th>
                <th>Price</th>
                <th>Category</th>
                <th>Created</th>
                <th style="min-width:160px">Actions</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        </tbody>
    </table>
    `;
}

/* -----------------------
   Modal (Add/Edit) with drag-drop and category preselect
   Options:
     - dish null => add new
     - dish object => edit (pre-fill)
     - opts.readonly => view only
   ----------------------- */
function openDishModal(dish = null, opts = {}) {
    const isEdit = !!dish;
    const readonly = !!opts.readonly;
    const modalId = "dishModal";
    const imageUrl = dish?.img || dish?.image || "";

    // build categories options (we fetch fresh categories to ensure up-to-date)
    const categoriesPromise = fetchCategories(); // returns array

    // modal html
    const html = `
    <div class="modal fade show" id="${modalId}" tabindex="-1" style="display:block; background: rgba(0,0,0,0.45);">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${isEdit ? "Edit Dish" : "Add Dish"}</h5>
            <button type="button" class="btn-close" id="${modalId}-close"></button>
          </div>
          <div class="modal-body">
            <form id="dishForm" class="row g-3">
                <div class="col-12 col-md-8">
                    <label class="form-label">Title</label>
                    <input id="dishTitle" class="form-control" value="${escapeHtml(dish?.title || "")}" ${readonly ? "disabled" : ""} required />
                </div>
                <div class="col-6 col-md-2">
                    <label class="form-label">Price</label>
                    <input id="dishPrice" type="number" step="0.01" class="form-control" value="${escapeHtml(dish?.price ?? "")}" ${readonly ? "disabled" : ""} />
                </div>
                <div class="col-6 col-md-2">
                    <label class="form-label">Day</label>
                    <select id="dishDay" class="form-select" ${readonly ? "disabled" : ""}>
                        <option value="">Select</option>
                        <option ${dish?.day === "Monday" ? "selected": ""}>Monday</option>
                        <option ${dish?.day === "Tuesday" ? "selected": ""}>Tuesday</option>
                        <option ${dish?.day === "Wednesday" ? "selected": ""}>Wednesday</option>
                        <option ${dish?.day === "Thursday" ? "selected": ""}>Thursday</option>
                        <option ${dish?.day === "Friday" ? "selected": ""}>Friday</option>
                        <option ${dish?.day === "Saturday" ? "selected": ""}>Saturday</option>
                        <option ${dish?.day === "Sunday" ? "selected": ""}>Sunday</option>
                    </select>
                </div>

                <div class="col-12">
                    <label class="form-label">Category</label>
                    <select id="dishCategory" class="form-select" ${readonly ? "disabled" : ""}>
                        <option value="">Loading categories...</option>
                    </select>
                </div>

                <div class="col-12">
                    <label class="form-label">Image</label>
                    <div id="dropArea" class="border rounded p-3 text-center" style="min-height:160px; display:flex; flex-direction:column; justify-content:center; gap:.5rem;">
                        <div id="previewWrap">
                            ${imageUrl ? `<img id="imgPreview" src="${escapeHtml(imageUrl)}" style="max-height:140px; object-fit:cover; display:block; margin:0 auto;" />` : `<img id="imgPreview" style="max-height:140px; object-fit:cover; display:none; margin:0 auto;" />`}
                        </div>
                        <div class="small text-muted">Drag & drop image here or <button type="button" id="pickFileBtn" class="btn btn-link p-0">choose file</button></div>
                        <input id="fileInput" type="file" accept="image/*" style="display:none;" />
                        <div id="dropMsg" class="small text-muted"></div>
                    </div>
                </div>

                <div class="col-12">
                    <label class="form-label">Description (optional)</label>
                    <textarea id="dishDesc" class="form-control" rows="3" ${readonly ? "disabled" : ""}>${escapeHtml(dish?.description || dish?.content || "")}</textarea>
                </div>

                <div class="col-12 text-end">
                    ${readonly ? `<button id="${modalId}-close-2" class="btn btn-sm btn-secondary">Close</button>` :
                        `${isEdit ? `<button id="deleteDishBtn" class="btn btn-sm btn-outline-danger me-2">Delete</button>` : "" }
                        <button type="submit" id="saveDishBtn" class="btn btn-sm btn-primary">${isEdit ? "Save changes" : "Create Dish"}</button>
                        <button id="${modalId}-close-2" type="button" class="btn btn-sm btn-outline-secondary ms-2">Cancel</button>`}
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    `;

    const container = document.getElementById("dishModalContainer");
    container.innerHTML = html;

    // wire events after DOM placed
    document.getElementById(`${modalId}-close`)?.addEventListener("click", closeDishModal);
    document.getElementById(`${modalId}-close-2`)?.addEventListener("click", closeDishModal);

    const dropArea = document.getElementById("dropArea");
    const fileInput = document.getElementById("fileInput");
    const pickBtn = document.getElementById("pickFileBtn");
    const imgPreview = document.getElementById("imgPreview");
    const dropMsg = document.getElementById("dropMsg");

    let selectedFile = null;

    // load categories and preselect if editing
    (async () => {
        const cats = await fetchCategories();
        const sel = document.getElementById("dishCategory");
        sel.innerHTML = `<option value="">Select category</option>`;
        cats.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c._id || c.id || c.slug || c.name;
            opt.innerText = c.name || c.title || c.slug || String(c._id || "");
            sel.appendChild(opt);
        });

        // preselect when editing
        const existingCat = dish?.category_id || dish?.category?._id || dish?.category;
        if (existingCat) {
            sel.value = String(existingCat);
        }
    })();

    // pick button
    pickBtn?.addEventListener("click", (e) => { e.preventDefault(); fileInput.click(); });

    // file input change
    fileInput.addEventListener("change", (e) => {
        const f = e.target.files[0];
        if (f) handleSelectedFile(f);
    });

    // drag & drop events
    ["dragenter", "dragover"].forEach(ev => dropArea.addEventListener(ev, (e) => {
        e.preventDefault(); e.stopPropagation();
        dropArea.classList.add("border-primary");
        dropMsg.innerText = "Drop to upload";
    }));
    ["dragleave", "dragend", "drop"].forEach(ev => dropArea.addEventListener(ev, (e) => {
        e.preventDefault(); e.stopPropagation();
        dropArea.classList.remove("border-primary");
        dropMsg.innerText = "";
    }));
    dropArea.addEventListener("drop", (e) => {
        const f = e.dataTransfer?.files?.[0];
        if (f) handleSelectedFile(f);
    });

    function handleSelectedFile(f) {
        if (!f.type.startsWith("image/")) {
            alert("Only images are allowed");
            return;
        }
        selectedFile = f;
        const reader = new FileReader();
        reader.onload = () => {
            if (imgPreview) {
                imgPreview.src = reader.result;
                imgPreview.style.display = "block";
            }
        };
        reader.readAsDataURL(f);
    }

    // delete button (only when editing and not readonly)
    if (!opts.readonly) {
        const deleteBtn = document.getElementById("deleteDishBtn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
                if (!dish || !dish._id) return;
                if (!confirm("Delete this dish?")) return;
                try {
                    const base = typeof API_BASE !== "undefined" ? API_BASE : "";
                    const token = localStorage.getItem("auth_token");
                    const res = await fetch(`${base}/api/dishes/${dish._id}`, {
                        method: "DELETE",
                        headers: token ? { "Authorization": `Bearer ${token}` } : {}
                    });
                    if (!res.ok) {
                        const txt = await res.text();
                        throw new Error(txt || "Delete failed");
                    }
                    alert("Deleted");
                    closeDishModal();
                    document.getElementById("refreshDishes")?.click();
                } catch (err) {
                    console.error("Delete dish failed:", err);
                    alert("Failed to delete dish");
                }
            });
        }
    }

    // submit - create or update
    if (!opts.readonly) {
        const form = document.getElementById("dishForm");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("dishTitle").value.trim();
            const price = document.getElementById("dishPrice").value;
            const day = document.getElementById("dishDay").value;
            const categoryId = document.getElementById("dishCategory").value;
            const desc = document.getElementById("dishDesc").value;

            console.log("Submitting dish:", { title, price, day, categoryId, desc});

            if (!title) {
                alert("Title required");
                return;
            }

            const base = typeof API_BASE !== "undefined" ? API_BASE : "";
            const token = localStorage.getItem("auth_token");

            const fd = new FormData();
            fd.append("title", title);
            fd.append("price", price || 0);
            fd.append("day", day || "");
            fd.append("category_id", categoryId || "");
            fd.append("description", desc || "");
            if (selectedFile) fd.append("img", selectedFile);

            try {
                let res;
                if (dish && dish._id) {
                    // update
                    res = await fetch(`${base}/api/dishes/${dish._id}`, {
                        method: "PUT",
                        headers: token ? { "Authorization": `Bearer ${token}` } : {},
                        body: fd
                    });
                } else {
                    // create
                    res = await fetch(`${base}/api/dishes`, {
                        method: "POST",
                        headers: token ? { "Authorization": `Bearer ${token}` } : {},
                        body: fd
                    });
                }

                // try parse json if provided
                let data = null;
                const contentType = res.headers.get("content-type") || "";
                if (contentType.includes("application/json")) data = await res.json();

                if (!res.ok) {
                    console.error("Dish save failed:", data ?? await res.text());
                    alert(data?.error || data?.message || "Failed to save dish");
                    return;
                }

                alert(dish && dish._id ? "Dish updated" : "Dish created");
                closeDishModal();
                document.getElementById("refreshDishes")?.click();

            } catch (err) {
                console.error("Save dish error:", err);
                alert("Failed to save dish");
            }
        });
    }
}

/* -----------------------
   Close modal
   ----------------------- */
function closeDishModal() {
    const container = document.getElementById("dishModalContainer");
    if (container) container.innerHTML = "";
}

/* -----------------------
   Utilities
   ----------------------- */
function formatDate(obj) {
    if (!obj) return "Unknown";
    try {
        const maybe = obj.$date || obj;
        const d = new Date(maybe);
        if (isNaN(d.getTime())) return "Unknown";
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    } catch { return "Unknown"; }
}

function escapeHtml(str = "") {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function loadingUI() {
    return `
    <div class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <span class="ms-2">Loading dishes...</span>
    </div>`;
}

/* -----------------------
   Expose small helper for copy
   ----------------------- */
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
