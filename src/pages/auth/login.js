export function render() {
    return `
        <!-- page head section starts -->
    <section class="page-head-section app-section">
        <div class="container page-heading">
            <h2 class="h3 mb-3 text-white text-center">Login</h2>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb flex-lg-nowrap justify-content-center justify-content-lg-star">
                    <li class="breadcrumb-item">
                        <a href="/"><i class="ri-home-line"></i>Home</a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page">Login</li>
                </ol>
            </nav>
        </div>
    </section>
    <!-- page head section end -->

    <!-- signin page start -->
    <section class="login-hero-section section-b-space">
        <div class="container">
            <div class="row">
                <div class="col-xl-5 col-lg-6 col-md-10 m-auto">
                    <div class="login-data">
                        <form class="auth-form">
                            <h2>Sign in</h2>
                            <h5>
                                or
                                <a href="/register" data-link><span class="theme-color">create an a account</span></a>
                            </h5>
                            <div class="form-input">
                                <input type="tel" class="form-control" placeholder="Enter your number">
                                <i class="ri-phone-line"></i>
                            </div>
                            <div class="form-input">
                                <input type="password" class="form-control" placeholder="Enter your password">
                                <i class="ri-lock-password-line"></i>
                            </div>
                            <a href="index-2.html" class="btn theme-btn submit-btn w-100 rounded-2">CONTINUE</a>
                            <p class="fw-normal content-color">
                                By creating an account, I accept the
                                <span class="fw-semibold">
                                    Terms & Conditions & Privacy Policy</span>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- signin page end -->
    `;
}

export function init() {
    document.querySelector("#loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        const res = await fetch("http://127.0.0.1:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error);

        localStorage.setItem("token", data.token);
        alert("Login Successful!");
    });
}
