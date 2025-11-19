
export function blogs() {
    return `
        <section class="page-head-section app-section">
            <div class="container page-heading">
                <h2 class="h3 mb-3 text-white text-center">Blogs</h2>
                <nav aria-label="breadcrumb"> 
                    <ol class="breadcrumb flex-lg-nowrap justify-content-center justify-content-lg-star">
                        <li class="breadcrumb-item">
                            <a href="/"><i class="ri-home-line"></i> Home</a>
                        </li>
                        <li class="breadcrumb-item active" aria-current="page">
                            Our Blogs
                        </li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="section-b-space">
            <div class="container">
                <div class="row g-4">
                    <!-- Blog List -->
                    <div class="col-lg-12">
                        <div class="row g-4 ratio2_3" id="blogs-container">
                            <div class="col-12 text-center">
                                <p>Loading blogs...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}


export async function blogsInit() {
    const blogContainer = document.getElementById("blogs-container");
    const catContainer = document.getElementById("blog-categories");

    let currentPage = 1;
    const limit = 2;

    async function loadBlogs(page = 1) {
        blogContainer.innerHTML = `<p class="text-center">Loading blogs...</p>`;

        try {
            const res = await fetch(`${API_BASE}/api/blogpost?page=${page}&limit=${limit}`);
            const data = await res.json();

            if (!res.ok || !data.posts) {
                blogContainer.innerHTML = `<p class="text-danger text-center">Failed to load blogs.</p>`;
                return;
            }

            const blogs = data.posts;
            const totalPages = data.pages;

            // --- Render blogs ---
            blogContainer.innerHTML = blogs.map(blog => `
                <div class="col-12">
                    <div class="blog-box list-box">
                        <div class="blog-image">
                            <div class="bg-size" style="
                                background-image: url('${API_BASE}${blog.image}');
                                background-size: cover;
                                background-position: center;
                                background-repeat: no-repeat;
                            ">
                                <img class="bg-img img" src="${API_BASE}${blog.image}" alt="${blog.title}" style="display:none;">
                            </div>
                        </div>
                        <div class="blog-details border-0">
                            <div class="d-flex gap-3 text-muted mb-4">
                                <span><i class="ri-user-line"></i> ${blog.author_name || "Admin"}</span>
                                <span><i class="ri-calendar-line"></i> ${formatDate(blog.created_at)}</span>
                            </div>
                            <a href="/blogs/${blog.slug}">
                                <h5>${blog.title}</h5>
                            </a>
                            <p class="mb-2">${stripHTML(blog.content).slice(0, 200)}...</p>
                            <a href="/blogs/${blog.slug}" class="btn btn-sm theme-btn mt-0 align-content-center">Read More</a>

                        </div>
                    </div>
                </div>
            `).join('');

            // --- Pagination controls ---
            renderPagination(totalPages);

            // --- Render categories ---

        } catch (err) {
            console.error("Blog Load Error:", err);
            blogContainer.innerHTML = `<p class="text-danger text-center">Error loading blogs.</p>`;
        }
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.createElement("div");
        paginationContainer.className = "pagination d-flex justify-content-center mt-4";
        paginationContainer.innerHTML = `
            <button class="btn btn-sm theme-btn mt-0 d-flex align-content-center" ${currentPage === 1 ? "disabled" : ""}>Prev</button>
            <span class="mx-2 p-2">Page ${currentPage} of ${totalPages}</span>
            <button class="btn btn-sm theme-btn mt-0 d-flex align-content-center" ${currentPage === totalPages ? "disabled" : ""}>Next</button>
        `;

        blogContainer.appendChild(paginationContainer);

        const [prevBtn, , nextBtn] = paginationContainer.children;
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                loadBlogs(currentPage);
            }
        });
        nextBtn.addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadBlogs(currentPage);
            }
        });
    }


    // --- Helper functions ---
    function stripHTML(html) {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    function formatDate(dateObj) {
        if (!dateObj) return "Unknown date";
        try {
            const d = new Date(dateObj.$date || dateObj);
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return "Unknown date";
        }
    }

    // --- Initial load ---
    await loadBlogs(currentPage);
}
