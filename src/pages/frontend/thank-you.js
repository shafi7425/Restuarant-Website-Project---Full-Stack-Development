export function thankyou() {
    // ✅ get order id from URL
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order") || null;

    return `
    <section class="page-head-section app-section">
        <div class="container page-heading">
            <h2 class="h3 mb-3 text-white text-center">Thank You!</h2>
        </div>
    </section>

    <section class="section-b-space">
        <div class="container text-center">
            
            <div class="thank-you-box p-4 shadow rounded bg-white mx-auto" style="max-width:600px;">
                <img src="/assets/images/gif/confirm.gif" width="90" class="mb-3" />

                <h2 class="mb-2">Your Order is Confirmed!</h2>

                ${
                    orderId
                        ? `<p class="lead">Order ID: <strong>${orderId}</strong></p>`
                        : `<p class="lead text-danger">Order ID not found.</p>`
                }

                <p class="mt-3">
                    We’re preparing your order. You will receive a confirmation soon.
                </p>

                <a href="/" class="btn theme-btn mt-4" data-link>Back to Home</a>
            </div>
        </div>
    </section>
    `;
}
