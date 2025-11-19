import { isLoggedIn, goTo } from "../../helpers/auth.js";

// ✅ CART PAGE HTML
export function cartPage() {
    return `
    <section class="page-head-section app-section">
        <div class="container page-heading">
            <h2 class="h3 mb-3 text-white text-center">Your Cart</h2>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb flex-lg-nowrap justify-content-center justify-content-lg-star">
                    <li class="breadcrumb-item">
                        <a href="/" data-link><i class="ri-home-line"></i>Home</a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page">Cart</li>
                </ol>
            </nav>
        </div>
    </section>

    <section class="section-b-space">
        <div class="container">
            <div id="cart-items" class="row g-3"></div>

            <div class="mt-4 text-end">
                <h3>Total: $<span id="cart-total">0</span></h3>
            </div>

            <div class="mt-3 text-end">
                <button id="checkout-btn" class="btn theme-btn">Proceed to Checkout</button>
            </div>

            <p id="cart-msg" class="mt-2 text-danger" style="display:none;"></p>
        </div>
    </section>
    `;
}

// ✅ INIT CART PAGE
export function cartInit() {
    renderCart();

    // Checkout button logic
    const checkoutBtn = document.getElementById("checkout-btn");
    checkoutBtn.addEventListener("click", () => {
        if (!isLoggedIn()) {
            alert("You must login to proceed to checkout.");
            goTo("/login");
            return;
        }

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length === 0) {
            const msg = document.getElementById("cart-msg");
            msg.innerText = "Your cart is empty!";
            msg.style.display = "block";
            return;
        }

        goTo("/checkout");
    });
}

// ✅ RENDER CART ITEMS
function renderCart() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("cart-total");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!container) return;

    container.innerHTML = ""; // clear old content

    if (cart.length === 0) {
        container.innerHTML = `<p class="text-center">Your cart is empty.</p>`;
        totalEl.innerText = "0";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.qty;

        const div = document.createElement("div");
        div.classList.add("col-12");

        div.innerHTML = `
        <div class="card d-flex flex-row align-items-center p-2">
            <img src="${item.img}" class="img-fluid" style="width:100px; height:100px; object-fit:cover;" alt="${item.title}">
            <div class="ms-3 flex-grow-1">
                <h5>${item.title}</h5>
                <p>Price: $${item.price} × <span id="qty-${item._id}">${item.qty}</span></p>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary" data-action="decrease" data-id="${item._id}">-</button>
                    <button class="btn btn-sm btn-outline-primary" data-action="increase" data-id="${item._id}">+</button>
                    <button class="btn btn-sm btn-outline-danger" data-action="remove" data-id="${item._id}">Remove</button>
                </div>
            </div>
        </div>
        `;

        container.appendChild(div);
    });

    totalEl.innerText = total.toFixed(2);

    // Add button listeners
    container.querySelectorAll("button").forEach(btn => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        btn.addEventListener("click", () => updateCart(action, id));
    });

    updateCartCount();
}

// ✅ UPDATE CART FUNCTION
function updateCart(action, id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const index = cart.findIndex(item => item._id === id);
    if (index === -1) return;

    if (action === "increase") cart[index].qty += 1;
    if (action === "decrease") cart[index].qty = Math.max(1, cart[index].qty - 1);
    if (action === "remove") cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    // Update quantity in UI
    if (action !== "remove") {
        const qtyEl = document.getElementById(`qty-${id}`);
        if (qtyEl) qtyEl.innerText = cart[index]?.qty || 0;
    }

    // Show toast
    showToast("Cart updated");

    // Re-render to update total and remove empty items
    renderCart();
}

// ✅ UPDATE HEADER CART COUNT
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    const bubble = document.querySelector(".cart-button span");
    if (bubble) bubble.innerText = total;
}

// ✅ TOAST FUNCTION
function showToast(msg) {
    const toast = document.createElement("div");
    toast.innerText = msg;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.background = "#28a745";
    toast.style.color = "#fff";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = 9999;
    toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 1500);
}
