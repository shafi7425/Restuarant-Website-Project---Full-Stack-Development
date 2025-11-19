export function blogSingle() {
    return `
        <section class="page-head-section app-section">
            <div class="container page-heading">
                <h1 id="blog-post-title" class="h3 mb-3 text-white text-center">Loading...</h1>
                <nav aria-label="breadcrumb">
                <ol class="breadcrumb flex-lg-nowrap justify-content-center justify-content-lg-star">
                    <li class="breadcrumb-item">
                        <a href="/" data-link><i class="ri-home-line"></i>Home</a>
                    </li>
                    <li id="blog-post-title" class="breadcrumb-item active" aria-current="page">Loading...</li>
                </ol>
            </nav>
            </div>
        </section>

        <section class="section-b-space">
            <div class="container">
                <div id="single-blog-container" class="row g-4">
                    <div class="col-12 text-center">
                        <p>Loading blog...</p>
                    </div>
                </div>
            </div>
        </section>
    `;
}

export async function blogSingleInit(params) {
    const blogId = params.id; // coming from route /blog/:id
    const blogContainer = document.getElementById("single-blog-container");

    try {
        const res = await fetch(`${API_BASE}/api/singleblogpost/${blogId}`);
        const blog = await res.json();    
        document.title = `${blog.title}`;
        
        document.querySelectorAll("#blog-post-title")
        .forEach(el => el.innerText = blog.title);

        if (!res.ok || !blog._id) {
            blogContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Blog post not found.</p>
                </div>
            `;
            return;
        }

        blogContainer.innerHTML = `
            <div class="col-lg-8 mx-auto">
                <div class="blog-box">
                    <div class="blog-image mb-4">
                        <img 
                            src="${blog.image}" 
                            class="img-fluid rounded" 
                            alt="${blog.title}">
                    </div>

                    <h2 class="mb-3">${blog.title}</h2>

                    <div class="d-flex gap-3 text-muted mb-4">
                        <span><i class="ri-user-line"></i> ${blog.author_name || "Admin"}</span>
                        <!-- <span><i class="ri-price-tag-3-line"></i> ${blog.category || "General"}</span> -->
                        <span><i class="ri-calendar-line"></i> ${formatDate(blog.created_at)}</span>
                    </div>

                    <div class="blog-content">
                        ${blog.content}
                    </div>

                    <hr class="my-4">

                    <a href="/blogs" class="btn btn-sm theme-btn mt-0 align-content-center">← Back to Blogs</a>
                </div>
            </div>
        `;
    } catch (err) {
        console.error("Single Blog Error:", err);
        blogContainer.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Error loading blog post.</p>
            </div>
        `;
    }
}

// Helper
function formatDate(dateObj) {
    try {
        const d = new Date(dateObj.$date || dateObj);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    } catch {
        return "Unknown date";
    }
}
