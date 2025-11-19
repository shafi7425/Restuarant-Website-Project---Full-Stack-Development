import { isLoggedIn, goTo, getUser } from "../../helpers/auth.js";

// ✅ CHECKOUT PAGE HTML
export function checkoutPage() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    return `
    <section class="page-head-section app-section">
        <div class="container page-heading">
            <h2 class="h3 mb-3 text-white text-center">Checkout</h2>
        </div>
    </section>

    <section class="section-b-space">
        <div class="container">
            <div class="row g-4">

                <!-- LEFT: USER INFO FORM -->
                <div class="col-lg-6">
                    <div class="checkout-box">
                        <h3 class="mb-3">Delivery Information</h3>

                        <form id="checkout-form">
                            <div class="form-group mb-3">
                                <label>Name</label>
                                <input type="text" id="name" class="form-control" required placeholder="Enter your name">
                            </div>

                            <div class="form-group mb-3">
                                <label>Phone</label>
                                <input type="tel" id="phone" class="form-control" required placeholder="Enter phone number">
                            </div>

                            <div class="form-group mb-3">
                                <label>Address</label>
                                <textarea id="address" class="form-control" rows="3" required placeholder="Delivery address"></textarea>
                            </div>

                            <button class="btn theme-btn w-100 mt-2" type="submit">
                                Place Order
                            </button>

                            <p id="checkout-msg" class="mt-3 fw-bold text-success" style="display:none;">
                                ✅ Order placed successfully!
                            </p>
                        </form>
                    </div>
                </div>

                <!-- RIGHT: CART SUMMARY -->
                <div class="col-lg-6">
                    <div class="checkout-box">
                        <h3 class="mb-3">Your Order</h3>
                        <div id="checkout-items"></div>

                        <h4 class="mt-3">
                            Total: $<span id="checkout-total">
                                ${cart.reduce((sum, item) => sum + item.qty * item.price, 0).toFixed(2)}
                            </span>
                        </h4>
                    </div>
                </div>

            </div>
        </div>
    </section>
    `;
}

// ✅ INIT CHECKOUT PAGE
export function checkoutInit() {

    // ✅ User must be logged in
    if (!isLoggedIn()) {
        alert("You must login to access checkout.");
        goTo("/login");
        return;
    }

    // ✅ Redirect if cart empty
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
        goTo("/");
        return;
    }

    // ✅ Load user info from localStorage
    const user = getUser() || {};

    // Auto-fill checkout fields
    document.getElementById("name").value = user.username || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("address").value = user.address || "";

    // Render cart items
    renderCheckoutItems();

    // Form submit event
    document.getElementById("checkout-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        await handleCheckout(user.id); 
    });
}

// ✅ RENDER CART ITEMS
function renderCheckoutItems() {
    const container = document.getElementById("checkout-items");
    const totalBox = document.getElementById("checkout-total");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        container.innerHTML = `<p>Your cart is empty.</p>`;
        totalBox.innerText = "0";
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach(item => {
        html += `
        <div class="d-flex align-items-center mb-3 border p-2 rounded">
            <img src="${item.img}" width="70" height="70" class="rounded me-3">
            <div>
                <h5 class="m-0">${item.title}</h5>
                <p class="m-0">Qty: ${item.qty}</p>
                <strong>$${(item.price * item.qty).toFixed(2)}</strong>
            </div>
        </div>
        `;
        total += item.price * item.qty;
    });

    container.innerHTML = html;
    totalBox.innerText = total.toFixed(2);
}

// ✅ HANDLE CHECKOUT ORDER
async function handleCheckout(user_id) {

    const token = localStorage.getItem("auth_token");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    // Updated user info from form
    const userInfo = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        address: document.getElementById("address").value.trim(),
    };

    // ✅ Update local auth_user before checkout
    const storedUser = getUser() || {};
    const updatedUser = { ...storedUser, ...userInfo };
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));

    const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

    const body = {
        user_id,
        user_info: userInfo,
        items: cart,
        total
    };

    try {
        const res = await fetch(`${API_BASE}/api/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Checkout failed");
            return;
        }

        // ✅ Show success message
        document.getElementById("checkout-msg").style.display = "block";

        // ✅ Clear cart
        localStorage.removeItem("cart");

        // ✅ Redirect to Thank You page
        setTimeout(() => {
            const url = `/thank-you?order=${data.order_id}`;
            history.pushState(null, null, url);
            import("/src/router.js").then(m => m.router(url));
        }, 1500);

    } catch (err) {
        console.error(err);
        alert("Server error!");
    }
}
