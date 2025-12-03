// src/pages/blogs.js
// ------------------
// Admin Blogs page: list, filters, pagination, add/edit/delete posts
// Depends on: apiFetch, getUser, isLoggedIn, isTokenExpired, goTo
//             renderSidebar, sidebarInit

import { apiFetch, getUser, isLoggedIn, isTokenExpired, goTo } from "../../helpers/auth.js";
import { renderSidebar, sidebarInit } from "../../components/sidebar.js";

/**
 * Entry point — called from router
 */
export async function blogsPage() {
    const app = document.getElementById("app");
    if (!app) return console.warn("#app not found");

    // Auth guard
    if (!isLoggedIn() || isTokenExpired()) {
        goTo("/login");
        return;
    }

    app.innerHTML = loadingUI("Loading blog posts...");

    try {
        // render shell
        app.innerHTML = pageTemplate();

        // insert sidebar and init it
        const sidebarHolder = document.getElementById("sidebar-holder");
        if (sidebarHolder) sidebarHolder.innerHTML = renderSidebar();
        sidebarInit();

        // Initialize controller (will fetch data)
        await BlogController.init();
    } catch (err) {
        console.error("Blogs page init error:", err);
        app.innerHTML = `<div class="container py-5 text-center text-danger">Failed to load blogs. ${escapeHtml(err.message || "")}</div>`;
    }
}

/* ----------------------------
   Page template (shell)
   ---------------------------- */
function pageTemplate() {
    return `
    <div class="d-flex" id="blogsWrapper">

        <!-- Sidebar placeholder -->
        <div id="sidebar-holder"></div>

        <div class="flex-grow-1">
            <nav class="navbar navbar-light bg-white shadow-sm d-md-none">
                <div class="container-fluid">
                    <button class="btn btn-outline-primary" type="button" id="mobileSidebarToggle">
                        <i class="ri-menu-line"></i>
                    </button>
                    <span class="navbar-brand mb-0 h1">Blogs</span>
                </div>
            </nav>

            <main class="container-fluid p-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                        <input id="filterSearch" class="form-control form-control-sm" style="min-width:240px" placeholder="Search title or slug...">
                        <select id="filterCategory" class="form-select form-select-sm" style="width:200px">
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
                        <div class="text-muted small">Total: <strong id="blogsCount">0</strong></div>
                        <button id="btnAddBlog" class="btn btn-sm btn-success">+ Add Blog</button>
                        <button id="manageCategories" class="btn btn-sm btn-outline-secondary">Categories</button>
                        <button id="refreshBlogs" class="btn btn-sm btn-outline-primary">Refresh</button>
                    </div>
                </div>

                <div id="blogsTableWrap" class="table-responsive"></div>

                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div id="paginationInfo" class="text-muted small"></div>
                    <nav><ul id="pagination" class="pagination mb-0"></ul></nav>
                </div>
            </main>
        </div>
    </div>

    <!-- Modals -->
    <div id="blogModalContainer"></div>
    <div id="categoryModalContainer"></div>
    `;
}

/* ----------------------------
   BlogController
   - handles fetch, filters, pagination, modal
   ---------------------------- */
const BlogController = (function () {
    const state = {
        posts: [],       // full fetched page (server-side pagination)
        categories: [],  // categories list
        page: 1,
        perPage: 10,
        totalPages: 1,
        totalItems: 0,
        filters: {
            q: "",
            category: ""
        }
    };

    const refs = {};

    async function init() {
        // refs
        refs.search = document.getElementById("filterSearch");
        refs.category = document.getElementById("filterCategory");
        refs.perPage = document.getElementById("perPage");
        refs.applyBtn = document.getElementById("applyFilters");
        refs.clearBtn = document.getElementById("clearFilters");
        refs.addBtn = document.getElementById("btnAddBlog");
        refs.catBtn = document.getElementById("manageCategories");
        refs.refreshBtn = document.getElementById("refreshBlogs");
        refs.tableWrap = document.getElementById("blogsTableWrap");
        refs.count = document.getElementById("blogsCount");
        refs.paginationEl = document.getElementById("pagination");
        refs.paginationInfo = document.getElementById("paginationInfo");

        // mobile sidebar hook
        const mobileToggle = document.getElementById("mobileSidebarToggle");
        const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
        if (mobileToggle && sidebarToggleBtn) {
            mobileToggle.addEventListener("click", () => sidebarToggleBtn.click());
        }

        // wire events
        refs.applyBtn?.addEventListener("click", () => { state.page = 1; loadPosts(); });
        refs.clearBtn?.addEventListener("click", () => clearFilters());
        refs.perPage?.addEventListener("change", () => { state.perPage = Number(refs.perPage.value || 10); state.page = 1; loadPosts(); });
        refs.addBtn?.addEventListener("click", () => openBlogModal());
        refs.catBtn?.addEventListener("click", () => openCategoryManager());
        refs.refreshBtn?.addEventListener("click", () => { state.page = 1; loadPosts(); });

        refs.search?.addEventListener("keypress", (e) => { if (e.key === "Enter") { state.page = 1; loadPosts(); } });

        // fetch categories first (to populate select)
        await loadCategories();

        // initial load (page 1)
        await loadPosts();
    }

    async function loadCategories() {
        try {
            const base = typeof API_BASE !== "undefined" ? API_BASE : "";
            const res = await apiFetch(`${base}/api/categories`);
            // res may be array or object - normalize
            state.categories = Array.isArray(res) ? res : (res.data || res.categories || []);
        } catch (err) {
            console.warn("Failed to load categories:", err);
            state.categories = [];
        }
        renderCategoryOptions();
    }

    function renderCategoryOptions() {
        // Populate filter select and later blog modal will reuse category data
        const sel = refs.category;
        if (!sel) return;
        sel.innerHTML = `<option value="">All categories</option>` + (state.categories.map(c => `<option value="${c._id}">${escapeHtml(c.name)}</option>`).join(""));
    }

    async function loadPosts() {
        refs.tableWrap.innerHTML = loadingUI("Loading posts...");
        // assemble query params: page, limit, q, category
        const q = (refs.search?.value || "").trim();
        const category = (refs.category?.value || "").trim();
        const page = state.page || 1;
        const limit = state.perPage || 10;
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (q) params.set("q", q);
        if (category) params.set("category", category);

        try {
            const base = typeof API_BASE !== "undefined" ? API_BASE : "";
            const url = `${base}/api/blogpost?${params.toString()}`;
            // Note: backend returns { posts, page, limit, totalPages } per the code you shared
            const res = await apiFetch(url);
            // Normalize different shapes:
            const posts = res.posts || res.data || res.items || (Array.isArray(res) ? res : []);
            state.posts = Array.isArray(posts) ? posts : (posts.data || []);
            state.page = Number(res.page || page);
            state.perPage = Number(res.limit || limit);
            state.totalPages = Number(res.totalPages || res.pages || Math.max(1, Math.ceil((res.total || state.posts.length) / state.perPage)));
            state.totalItems = Number(res.total || res.totalItems || res.total_posts || state.posts.length);

            renderTable();
            renderPagination();
            refs.count && (refs.count.innerText = String(state.totalItems || state.posts.length));
        } catch (err) {
            console.error("Failed to load posts:", err);
            refs.tableWrap.innerHTML = `<div class="p-4 text-center text-danger">Failed to load posts. ${escapeHtml(err.message || "")}</div>`;
        }
    }

    function renderTable() {
        if (!Array.isArray(state.posts) || state.posts.length === 0) {
            refs.tableWrap.innerHTML = `<div class="p-4 text-center text-muted">No posts found.</div>`;
            refs.paginationInfo && (refs.paginationInfo.innerText = "");
            refs.paginationEl && (refs.paginationEl.innerHTML = "");
            return;
        }

        const rows = state.posts.map((p, idx) => {
            const id = escapeHtml(p._id || p.id || "");
            const title = escapeHtml(p.title || "");
            const categoryName = p.category && p.category.name
                ? escapeHtml(p.category.name)
                : (p.category_name || "Uncategorized");
            const created = formatDate(p.created_at || p.createdAt || p.created || p.created_at?.$date);
            const img = escapeHtml(p.image || p.img || "");
            const excerpt = stripHTML(p.content || "").slice(0, 140);

            return `
            <tr>
                <td>${escapeHtml(String(idx + 1))}</td>
                <td class="text-monospace fw-semibold">${title}</td>
                <td>
                    <div class="d-flex gap-2 align-items-center">
                        ${img ? `<img src="${img}" width="84" height="56" style="object-fit:cover;border-radius:6px;" onerror="this.style.visibility='hidden'"/>` : `<div style="width:84px;height:56px;background:#f3f3f3;border-radius:6px"></div>`}
                    </div>
                </td>
                <td>${categoryName}</td>
                <td>${created}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary edit-post-btn" data-id="${id}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger delete-post-btn" data-id="${id}">Delete</button>
                    </div>
                </td>
            </tr>
            `;
        }).join("");

        refs.tableWrap.innerHTML = `
        <table class="table table-hover table-striped table-bordered align-middle">
            <thead class="table-dark">
                <tr>
                    <th style="width:48px">#</th>
                    <th>Post ID</th>
                    <th>Image</th>
                    <th>Category</th>
                    <th>Created</th>
                    <th style="min-width:160px">Actions</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
        `;

        // wire action buttons
        document.querySelectorAll(".edit-post-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = btn.dataset.id;
                let post = state.posts.find(x => String(x._id || x.id) === String(id));
                if (!post) {
                    // fetch single
                    try {
                        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
                        const res = await apiFetch(`${base}/api/blogposts/${id}`);
                        post = res.blog || res.post || res || null;
                    } catch (err) {
                        console.error(err);
                        alert("Failed to fetch post");
                        return;
                    }
                }
                openBlogModal(post);
            });
        });

        document.querySelectorAll(".delete-post-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                if (!confirm("Delete this post?")) return;
                try {
                    const base = typeof API_BASE !== "undefined" ? API_BASE : "";
                    await apiFetch(`${base}/api/blogposts/${id}`, { method: "DELETE" });
                    alert("Deleted");
                    // reload current page
                    await loadPosts();
                } catch (err) {
                    console.error("Delete failed:", err);
                    alert("Failed to delete post.");
                }
            });
        });
    }

    function renderPagination() {
        const current = Number(state.page || 1);
        const totalPages = Math.max(1, Number(state.totalPages || 1));
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
                loadPosts();
            });
            li.appendChild(a);
            return li;
        };

        refs.paginationEl.appendChild(createPageBtn("Prev", Math.max(1, current - 1), current === 1));
        const start = Math.max(1, current - 2);
        const end = Math.min(totalPages, current + 2);
        if (start > 1) refs.paginationEl.appendChild(createPageBtn("1", 1));
        if (start > 2) {
            const gap = document.createElement("li"); gap.className = "page-item disabled"; gap.innerHTML = `<span class="page-link">…</span>`;
            refs.paginationEl.appendChild(gap);
        }
        for (let p = start; p <= end; p++) refs.paginationEl.appendChild(createPageBtn(String(p), p, false, p === current));
        if (end < totalPages - 1) {
            const gap = document.createElement("li"); gap.className = "page-item disabled"; gap.innerHTML = `<span class="page-link">…</span>`;
            refs.paginationEl.appendChild(gap);
        }
        if (end < totalPages) refs.paginationEl.appendChild(createPageBtn(String(totalPages), totalPages));
        refs.paginationEl.appendChild(createPageBtn("Next", Math.min(totalPages, current + 1), current === totalPages));

        refs.paginationInfo && (refs.paginationInfo.innerText = `Page ${current} of ${totalPages} — Showing ${state.posts.length} items`);
    }

    function clearFilters() {
        if (refs.search) refs.search.value = "";
        if (refs.category) refs.category.value = "";
        state.page = 1;
        state.filters = { q: "", category: "" };
        loadPosts();
    }

    // expose only init
    return { init: init };
})();

/* ----------------------------
   Blog modal: add / edit
   - Uses multipart/form-data
   - POST /api/blog-posts   (create)
   - PUT  /api/blogposts/:id (update)
   ---------------------------- */
function openBlogModal(blog = null) {
    const isEdit = !!blog;
    const modalId = "blogModal";

    // Collect categories from the main select (fast) — fallback to fetching inside populateModalCategories
    const categorySelectDom = document.getElementById("filterCategory");
    const categories = [];
    if (categorySelectDom) {
        Array.from(categorySelectDom.options).forEach(o => {
            if (o.value) categories.push({ _id: o.value, name: o.text });
        });
    }

    const selectedCategoryId = blog?.category?._id || blog?.category_id || blog?.category || "";

    const html = `
    <div class="modal fade show" id="${modalId}" tabindex="-1" style="display:block; background: rgba(0,0,0,0.45);">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${isEdit ? "Edit Post" : "Create Post"}</h5>
            <button type="button" class="btn-close" id="${modalId}-close"></button>
          </div>
          <div class="modal-body">
            <form id="blogForm" class="row g-3">
                <div class="col-12">
                    <label class="form-label">Title</label>
                    <input id="postTitle" class="form-control" value="${escapeHtml(blog?.title || "")}" required />
                </div>

                <div class="col-md-6">
                    <label class="form-label">Category</label>
                    <select id="postCategory" class="form-select">
                        <option value="">Select category</option>
                        ${categories.map(c => `<option value="${c._id}" ${String(c._id) === String(selectedCategoryId) ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
                    </select>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Image</label>
                    <div class="d-flex gap-2 align-items-center">
                        <div style="width:110px;height:70px;background:#f3f3f3;border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                            ${blog?.image ? `<img id="postImgPreview" src="${escapeHtml(blog.image)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.visibility='hidden'"/>` : `<div id="postImgPreview" style="display:none;"></div>`}
                        </div>
                        <div>
                            <input id="postFileInput" type="file" accept="image/*" style="display:none;">
                            <button id="postPickBtn" class="btn btn-sm btn-outline-secondary" type="button">Choose image</button>
                            <div class="small text-muted mt-1">Optional - upload to replace</div>
                        </div>
                    </div>
                </div>

                <div class="col-12">
                    <label class="form-label">Content</label>
                    <div id="postContentEditor" style="height:300px;background:#fff;"></div>
                </div>

                <div class="col-12 text-end">
                    ${isEdit ? `<button id="deletePostBtn" class="btn btn-sm btn-outline-danger me-2">Delete</button>` : ""}
                    <button type="submit" id="savePostBtn" class="btn btn-sm btn-primary">${isEdit ? "Save Changes" : "Create Post"}</button>
                    <button id="${modalId}-close-2" type="button" class="btn btn-sm btn-outline-secondary ms-2">Cancel</button>
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    `;

    const container = document.getElementById("blogModalContainer");
    container.innerHTML = html;

    // Ensure modal categories are up-to-date (will set selected)
    populateModalCategories(selectedCategoryId);

    // wire close
    document.getElementById(`${modalId}-close`)?.addEventListener("click", () => closeBlogModal());
    document.getElementById(`${modalId}-close-2`)?.addEventListener("click", () => closeBlogModal());

    // file picker
    const pickBtn = document.getElementById("postPickBtn");
    const fileInput = document.getElementById("postFileInput");
    const imgPreview = document.getElementById("postImgPreview");
    let selectedFile = null;

    pickBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        fileInput.click();
    });

    fileInput?.addEventListener("change", (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) { alert("Only images allowed"); return; }
        selectedFile = f;
        const reader = new FileReader();
        reader.onload = () => {
            if (imgPreview) {
                imgPreview.src = reader.result;
                imgPreview.style.display = "block";
            }
        };
        reader.readAsDataURL(f);
    });

    // Initialize Quill editor (global Quill must be available)
    let quill = null;
    try {
        if (typeof Quill === "undefined") {
            console.warn("Quill not loaded — install Quill CDN to enable rich editor.");
            // fallback: create simple contenteditable
            const editor = document.getElementById("postContentEditor");
            editor.innerHTML = escapeHtml(blog?.content || "");
            quill = null;
        } else {
            quill = new Quill("#postContentEditor", {
                theme: "snow",
                placeholder: "Write blog content here...",
                modules: {
                    toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ align: [] }],
                        ["link", "image", "video"],
                        ["clean"]
                    ]
                }
            });
            // set existing content (HTML)
            const initial = blog?.content || "";
            quill.root.innerHTML = initial;
        }
    } catch (err) {
        console.warn("Failed to init Quill:", err);
    }

    // delete post
    if (blog && blog._id) {
        document.getElementById("deletePostBtn")?.addEventListener("click", async () => {
            if (!confirm("Delete this post?")) return;
            try {
                const base = typeof API_BASE !== "undefined" ? API_BASE : "";
                await apiFetch(`${base}/api/blogposts/${blog._id}`, { method: "DELETE" });
                alert("Deleted");
                closeBlogModal();
                // refresh list
                document.getElementById("refreshBlogs")?.click();
            } catch (err) {
                console.error("Delete post failed:", err);
                alert("Failed to delete post.");
            }
        });
    }

    // submit form
    document.getElementById("blogForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("postTitle").value.trim();
        const category = document.getElementById("postCategory").value;
        // get content from quill if initialized, else fallback to innerHTML
        let content = "";
        if (quill) content = quill.root.innerHTML;
        else content = document.getElementById("postContentEditor").innerHTML || "";

        if (!title || !content || !category) {
            alert("Title, content and category are required.");
            return;
        }

        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
        const token = localStorage.getItem("auth_token") || localStorage.getItem("token") || "";

        const fd = new FormData();
        fd.append("title", title);
        fd.append("content", content);
        fd.append("category", category);
        if (selectedFile) fd.append("image", selectedFile);

        try {
            let res;
            if (blog && blog._id) {
                // update
                res = await fetch(`${base}/api/blogposts/${blog._id}`, {
                    method: "PUT",
                    headers: { "Authorization": token ? `Bearer ${token}` : "" },
                    body: fd
                });
            } else {
                // create
                res = await fetch(`${base}/api/blogpost`, {
                    method: "POST",
                    headers: { "Authorization": token ? `Bearer ${token}` : "" },
                    body: fd
                });
            }

            const contentType = res.headers.get("content-type") || "";
            let data = null;
            if (contentType.includes("application/json")) data = await res.json();

            if (!res.ok) {
                console.error("Save post failed:", data ?? await res.text());
                alert(data?.error || data?.message || "Failed to save post");
                return;
            }

            alert(blog && blog._id ? "Post updated" : "Post created");
            closeBlogModal();
            document.getElementById("refreshBlogs")?.click();
        } catch (err) {
            console.error("Save post error:", err);
            alert("Failed to save post");
        }
    });
}

/* populate categories inside modal select (reads from /api/categories again to ensure freshest data) */
async function populateModalCategories(selectedId = "") {
    try {
        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
        const res = await apiFetch(`${base}/api/categories`);
        const cats = Array.isArray(res) ? res : (res.data || res.categories || []);
        const sel = document.getElementById("postCategory");
        if (!sel) return;
        sel.innerHTML = `<option value="">Select category</option>` + cats.map(c => `<option value="${c._id}" ${String(c._id) === String(selectedId) ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("");
    } catch (err) {
        console.warn("Failed to populate modal categories:", err);
    }
}

function closeBlogModal() {
    const container = document.getElementById("blogModalContainer");
    if (container) container.innerHTML = "";
}

/* ----------------------------
   Category manage modal (basic CRUD)
   - GET /api/categories
   - POST /api/categories
   - PUT /api/categories/:id
   - DELETE /api/categories/:id
   ---------------------------- */
function openCategoryManager() {
    const modalId = "categoryModal";
    const html = `
    <div class="modal fade show" id="${modalId}" tabindex="-1" style="display:block; background: rgba(0,0,0,0.45);">
      <div class="modal-dialog modal-md modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Manage Categories</h5>
            <button type="button" class="btn-close" id="${modalId}-close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
                <div class="d-flex gap-2">
                    <input id="newCatName" class="form-control form-control-sm" placeholder="New category name">
                    <button id="addCatBtn" class="btn btn-sm btn-primary">Add</button>
                </div>
            </div>
            <div id="catListWrap">Loading categories...</div>
          </div>
          <div class="modal-footer">
            <button id="${modalId}-close-2" class="btn btn-sm btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
    `;
    const container = document.getElementById("categoryModalContainer");
    container.innerHTML = html;

    document.getElementById(`${modalId}-close`)?.addEventListener("click", () => closeCategoryModal());
    document.getElementById(`${modalId}-close-2`)?.addEventListener("click", () => closeCategoryModal());

    document.getElementById("addCatBtn")?.addEventListener("click", async () => {
        const name = document.getElementById("newCatName").value.trim();
        if (!name) return alert("Name required");
        try {
            const base = typeof API_BASE !== "undefined" ? API_BASE : "";
            await apiFetch(`${base}/api/categories`, {
                method: "POST",
                body: JSON.stringify({ name })
            });
            document.getElementById("newCatName").value = "";
            await refreshCategoryList();
            // refresh global selects on main page
            await reloadFilterCategories();
            alert("Category added");
        } catch (err) {
            console.error("Add category failed:", err);
            alert("Failed to add category");
        }
    });

    refreshCategoryList();
}

async function refreshCategoryList() {
    const wrap = document.getElementById("catListWrap");
    wrap && (wrap.innerHTML = "Loading categories...");
    try {
        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
        const res = await apiFetch(`${base}/api/categories`);
        const cats = Array.isArray(res) ? res : (res.data || res.categories || []);
        if (!cats.length) { wrap.innerHTML = `<div class="text-muted small">No categories</div>`; return; }

        wrap.innerHTML = `
            <ul class="list-group">
                ${cats.map(c => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <input data-id="${c._id}" class="form-control form-control-sm cat-edit-input" value="${escapeHtml(c.name)}" style="width:220px;display:inline-block;"/>
                            <small class="text-muted ms-2">${escapeHtml(c.slug || "")}</small>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-success save-cat-btn" data-id="${c._id}">Save</button>
                            <button class="btn btn-sm btn-outline-danger ms-1 delete-cat-btn" data-id="${c._id}">Delete</button>
                        </div>
                    </li>
                `).join("")}
            </ul>
        `;

        // wire save & delete
        document.querySelectorAll(".save-cat-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                const input = document.querySelector(`.cat-edit-input[data-id="${id}"]`);
                const name = input?.value?.trim();
                if (!name) return alert("Name required");
                try {
                    const base = typeof API_BASE !== "undefined" ? API_BASE : "";
                    await apiFetch(`${base}/api/categories/${id}`, { method: "PUT", body: JSON.stringify({ name }) });
                    alert("Updated");
                    await refreshCategoryList();
                    await reloadFilterCategories();
                } catch (err) {
                    console.error("Update category failed:", err);
                    alert("Failed to update");
                }
            });
        });

        document.querySelectorAll(".delete-cat-btn").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                if (!confirm("Delete this category?")) return;
                try {
                    const base = typeof API_BASE !== "undefined" ? API_BASE : "";
                    await apiFetch(`${base}/api/categories/${id}`, { method: "DELETE" });
                    alert("Deleted");
                    await refreshCategoryList();
                    await reloadFilterCategories();
                } catch (err) {
                    console.error("Delete category failed:", err);
                    alert("Failed to delete (it might be in use).");
                }
            });
        });

    } catch (err) {
        console.error("Failed to fetch categories:", err);
        wrap && (wrap.innerHTML = `<div class="text-danger">Failed to load categories</div>`);
    }
}

async function reloadFilterCategories() {
    try {
        const base = typeof API_BASE !== "undefined" ? API_BASE : "";
        const res = await apiFetch(`${base}/api/categories`);
        const cats = Array.isArray(res) ? res : (res.data || res.categories || []);
        const sel = document.getElementById("filterCategory");
        if (!sel) return;
        sel.innerHTML = `<option value="">All categories</option>${cats.map(c => `<option value="${c._id}">${escapeHtml(c.name)}</option>`).join("")}`;
    } catch (err) {
        console.warn("reloadFilterCategories failed:", err);
    }
}

function closeCategoryModal() {
    const container = document.getElementById("categoryModalContainer");
    if (container) container.innerHTML = "";
}

/* ----------------------------
   Utility helpers
   ---------------------------- */
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
    } catch {
        return "Unknown";
    }
}

function escapeHtml(str = "") {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function stripHTML(html = "") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function loadingUI(text = "Loading...") {
    return `
    <div class="d-flex justify-content-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <span class="ms-2">${escapeHtml(text)}</span>
    </div>`;
}
