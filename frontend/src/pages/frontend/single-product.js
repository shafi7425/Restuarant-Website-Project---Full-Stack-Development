// ✅ FULL SINGLE PRODUCT PAGE (UI + Logic) with Queueable Toasts

export function dishPage() {
    return `
    <section class="page-head-section app-section">
        <div class="container page-heading">
            <h1 id="dish-title" class="h3 mb-3 text-white text-center">Loading...</h1>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb flex-lg-nowrap justify-content-center justify-content-lg-star">
                    <li class="breadcrumb-item">
                        <a href="/" data-link><i class="ri-home-line"></i>Home</a>
                    </li>
                    <li id="dish-title" class="breadcrumb-item active" aria-current="page">Loading...</li>
                </ol>
            </nav>
        </div>
    </section>

    <section class="section-b-space">
        <div class="container">
            <div class="row g-3">

                <!-- LEFT IMAGE -->
                <div class="col-xl-6 d-xl-inline-block d-none">
                    <div class="about-images h-100">
                        <img id="dish-img" class="img-fluid img h-100" src="" alt="Dish Image">
                    </div>
                </div>

                <!-- RIGHT CONTENT -->
                <div class="col-xl-6">
                    <div class="title animated-title">
                        <div class="loader-line"></div>

                        <h1 id="dish-name" class="mb-sm-3 mb-2">Loading...</h1>
                        <p id="dish-description" class="content-color">Please wait...</p>

                        <h3 id="dish-price" class="mt-3"></h3>

                        <!-- ✅ ADD TO CART BUTTON -->
                        <button id="add-to-cart" class="btn theme-btn mt-3">
                            <i class="ri-shopping-cart-line"></i> Add to Cart
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <!-- ✅ Toast Container -->
    <div id="toast-container" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 9999;
    "></div>
    `;
}

// ✅ Initialize Dish Page
export function dishInit() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        redirectHome();
        return;
    }

    loadDish(id);
}

// ✅ Fetch dish details
async function loadDish(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/dish/${id}`);
        const data = await res.json();

        if (!res.ok || !data.dish) {
            redirectHome();
            return;
        }

        const dish = data.dish;

        // ✅ Update UI
        document.getElementById("dish-title").innerText = dish.title;
        document.getElementById("dish-name").innerText = dish.title;
        document.getElementById("dish-img").src = dish.img;
        document.getElementById("dish-description").innerText = dish.description || "No description available.";
        document.getElementById("dish-price").innerText = `Price: $${dish.price}`;

        // ✅ Add to Cart Functionality
        document.getElementById("add-to-cart").addEventListener("click", () => {
            addToCart(dish);
        });

        // ✅ Update meta title
        document.title = `${dish.title}`;
    }
    catch (err) {
        console.error(err);
        redirectHome();
    }
}

// ✅ Add to Cart (LocalStorage + Toast)
function addToCart(dish) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // If dish exists, increase qty
    const exists = cart.find(item => item._id === dish._id);
    if (exists) {
        exists.qty += 1;
    } else {
        cart.push({
            _id: dish._id,
            title: dish.title,
            price: dish.price,
            img: dish.img,
            qty: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // ✅ Show toast notification
    showToast(`${dish.title} added to cart`);

    // ✅ Update header cart bubble
    updateCartCount();
}

// ✅ Show Toast (Queueable)
function showToast(message) {
    const container = document.getElementById("toast-container");

    // Create toast element
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.background = "#28a745";
    toast.style.color = "#fff";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "6px";
    toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "transform 0.4s ease, opacity 0.4s ease";

    container.appendChild(toast);

    // Slide in
    requestAnimationFrame(() => {
        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";
    });

    // Remove after 2s
    setTimeout(() => {
        toast.style.transform = "translateX(100%)";
        toast.style.opacity = "0";
        toast.addEventListener("transitionend", () => {
            toast.remove();
        });
    }, 2000);
}

// ✅ Update Header Cart Counter
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + item.qty, 0);

    const bubble = document.querySelector(".cart-button span");
    if (bubble) bubble.innerText = total;
}

// ✅ Redirect Home (SPA — no page reload)
function redirectHome() {
    history.pushState(null, null, '/');
    import('/src/router.js').then(m => m.router('/'));
}
