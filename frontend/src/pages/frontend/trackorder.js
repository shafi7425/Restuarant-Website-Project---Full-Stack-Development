// trackorder.js
export function trackorder() {
    return `
    <section class="page-head-section app-section">
        <div class="container page-heading">
            <h2 class="h3 mb-3 text-white text-center">Track Your Order</h2>
        </div>
    </section>

    <section class="section-b-space">
        <div class="container text-center">
            <div class="track-box bg-white p-4 shadow rounded mx-auto" style="max-width:600px;">
                <p class="mb-3">Enter your Order ID to view order status and details.</p>
                
                <div class="input-group mb-3">
                    <input type="text" id="orderIdInput" class="form-control" placeholder="Enter Order ID" />
                    <button id="trackBtn" class="btn theme-btn">Track</button>
                </div>

                <div id="orderResult" class="mt-4"></div>
            </div>
        </div>
    </section>
    `;
}

// helper: parse possibly wrapped MongoDB dates into a JS Date
function parseCreatedAt(raw) {
    if (!raw) return null;

    // already a string
    if (typeof raw === "string") {
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
    }

    // object with $date: can be string or object with $numberLong
    if (typeof raw === "object") {
        // common case: { "$date": "2025-..." }
        if (raw.$date) {
            if (typeof raw.$date === "string") {
                const d = new Date(raw.$date);
                return isNaN(d.getTime()) ? null : d;
            }
            // case: { "$date": { "$numberLong": "169..." } }
            if (typeof raw.$date === "object" && raw.$date.$numberLong) {
                const n = Number(raw.$date.$numberLong);
                const d = new Date(n);
                return isNaN(d.getTime()) ? null : d;
            }
        }

        // older drivers might use { "$numberLong": "..." } directly
        if (raw.$numberLong) {
            const n = Number(raw.$numberLong);
            const d = new Date(n);
            return isNaN(d.getTime()) ? null : d;
        }

        // if it's a plain object that already has ISO string somewhere, try JSON stringify fallback
        try {
            const s = JSON.stringify(raw);
            const maybeIso = s.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
            if (maybeIso) {
                const d = new Date(maybeIso[0]);
                return isNaN(d.getTime()) ? null : d;
            }
        } catch (e) { /* noop */ }
    }

    return null;
}

// safe number formatter
function fmtMoney(v) {
    const n = Number(v) || 0;
    return n.toFixed(2);
}

// robust getter for item fields (title, qty, price)
function normalizeItem(item) {
    if (!item || typeof item !== "object") return { title: "Unknown item", qty: 1, price: 0 };

    const title = item.title || item.name || item.product_name || item.product || "Untitled";
    const qty = (item.qty ?? item.quantity ?? item.count ?? item.q ?? item.quantity_ordered ?? 1);
    const price = (item.price ?? item.unit_price ?? item.amount ?? item.cost ?? 0);

    return { title, qty: Number(qty) || 0, price: Number(price) || 0 };
}

export function trackorderInit() {
    const btn = document.getElementById("trackBtn");
    const result = document.getElementById("orderResult");

    btn?.addEventListener("click", async () => {
        const orderId = document.getElementById("orderIdInput").value.trim();
        if (!orderId) {
            result.innerHTML = `<p class="text-danger">Please enter an order ID.</p>`;
            return;
        }

        result.innerHTML = `<p>Loading order details...</p>`;

        try {
            const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
                // you can include credentials or headers here if needed
            });

            // defensive parsing: server might return HTML (error page) instead of JSON
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                // Not JSON -> show useful message and put server response in console
                console.error("Track order returned non-JSON response:", text);
                result.innerHTML = `<p class="text-danger">Server returned an unexpected response. Check console for details.</p>`;
                return;
            }

            if (!res.ok) {
                result.innerHTML = `<p class="text-danger">${data.error || 'Order not found.'}</p>`;
                return;
            }

            // API returns { order: { ... } }
            const order = data.order || data; // support both shapes
            if (!order) {
                result.innerHTML = `<p class="text-danger">Order not found.</p>`;
                return;
            }

            // parse created_at robustly
            const createdAtDate = parseCreatedAt(order.created_at || order.createdAt || order.created_at_raw);
            const createdAtStr = createdAtDate ? createdAtDate.toLocaleString() : "N/A";

            // normalize items array
            const itemsArr = Array.isArray(order.items) ? order.items : (order.items_list || order.order_items || []);
            const itemsHTML = (itemsArr.length > 0)
                ? itemsArr.map(it => {
                    const n = normalizeItem(it);
                    return `<li>${escapeHtml(n.title)} × ${escapeHtml(String(n.qty))} - $${fmtMoney(n.price)}</li><br>`;
                }).join("")
                : "<li>No items found</li>";

            // total fallback
            const total = (order.total ?? order.amount ?? order.order_total ?? 0);

            // show result
            result.innerHTML = `
                <div class="order-info text-start border p-3 rounded bg-light">
                    <h5>Order ID: ${escapeHtml(order._id || order.id || order.order_id || orderId)}</h5>
                    <p>Status: <strong class="text-primary">${escapeHtml(order.status || "unknown")}</strong></p>
                    <p>Total: <strong>$${fmtMoney(total)}</strong></p>
                    <p>Order Date: ${escapeHtml(createdAtStr)}</p>

                    <h6 class="mt-3">Items:</h6>
                    <ul>${itemsHTML}</ul>
                </div>
            `;
        } catch (err) {
            console.error("Track Order Error:", err);
            result.innerHTML = `<p class="text-danger">Failed to fetch order details. Try again later.</p>`;
        }
    });
}

// very small HTML escaper for safety
function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
