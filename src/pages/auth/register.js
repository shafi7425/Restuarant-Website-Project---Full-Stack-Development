export function render() {
    return `
       <!-- page head section starts -->
    <section class="page-head-section app-section">
        <div class="container page-heading">
            <h2 class="h3 mb-3 text-white text-center">Create Account</h2>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb flex-lg-nowrap justify-content-center justify-content-lg-star">
                    <li class="breadcrumb-item">
                        <a href="/"><i class="ri-home-line"></i>Home</a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page">Signup</li>
                </ol>
            </nav>
        </div>
    </section>
    <!-- page head section end -->

    <!-- signup page start -->
    <section class="login-hero-section section-b-space">
        <div class="container">
            <div class="row">
                <div class="col-xl-5 col-lg-6 col-md-10 m-auto">
                    <div class="login-data">
                        <form class="auth-form">
                            <h2>Sign up</h2>
                            <h5>
                                or
                                <a href="/login" data-link><span class="theme-color">login to your account</span></a>
                            </h5>
                            <div class="form-input">
                                <input type="text" class="form-control" placeholder="Enter your name">
                                <i class="ri-user-3-line"></i>
                            </div>
                            <div class="form-input">
                                <input type="tel" class="form-control" placeholder="Enter your number">
                                <i class="ri-phone-line"></i>
                            </div>
                            <div class="form-input">
                                <input type="password" class="form-control" placeholder="Enter your password">
                                <i class="ri-lock-password-line"></i>
                            </div>
                            <a href="otp.html" class="btn theme-btn submit-btn w-100 rounded-2">CONTINUE</a>
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
    <!-- signup page end -->
    `;
}

export function init() {
    document.querySelector("#regForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = {
            username: document.querySelector("#username").value,
            email: document.querySelector("#email").value,
            phone: document.querySelector("#phone").value,
            address: document.querySelector("#address").value,
            password: document.querySelector("#password").value
        };

        const res = await fetch("http://127.0.0.1:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error);

        alert("Registration successful!");
        window.location.href = "/login";
    });
}
