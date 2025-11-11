import { saveAuth, hasCartItems, goTo, isLoggedIn } from "../../helpers/auth.js";

export function render() {
    // Prevent access if already logged in
    if (isLoggedIn()) {
        const user = JSON.parse(localStorage.getItem("user_info")) || {};
        if (user.role === "admin") goTo("/dashboard");
        else if (hasCartItems()) goTo("/checkout");
        else goTo("/");
        return "";
    }

    return `
        <!-- signup page -->
        <section class="page-head-section app-section">
            <div class="container page-heading">
                <h2 class="h3 mb-3 text-white text-center">Create Account</h2>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb flex-lg-nowrap justify-content-center justify-content-lg-star">
                        <li class="breadcrumb-item">
                            <a href="/" data-link><i class="ri-home-line"></i>Home</a>
                        </li>
                        <li class="breadcrumb-item active" aria-current="page">Signup</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="login-hero-section section-b-space">
            <div class="container">
                <div class="row">
                    <div class="col-xl-5 col-lg-6 col-md-10 m-auto">
                        <div class="login-data">
                            <form id="regForm" class="auth-form">
                                <h2>Sign up</h2>
                                <h5>
                                    or
                                    <a href="/login" data-link>
                                        <span class="theme-color">Login to your account</span>
                                    </a>
                                </h5>
                                <div class="form-input">
                                    <input id="username" type="text" class="form-control" placeholder="Enter your name" required>
                                    <i class="ri-user-3-line"></i>
                                </div>
                                <div class="form-input">
                                    <input id="email" type="email" class="form-control" placeholder="Enter your email" required>
                                    <i class="ri-mail-line"></i>
                                </div>
                                <div class="form-input">
                                    <input id="phone" type="tel" class="form-control" placeholder="Enter your number">
                                    <i class="ri-phone-line"></i>
                                </div>
                                <div class="form-input">
                                    <input id="address" type="text" class="form-control" placeholder="Enter your address">
                                    <i class="ri-map-pin-line"></i>
                                </div>
                                <div class="form-input">
                                    <input id="password" type="password" class="form-control" placeholder="Create a strong password" required>
                                    <i class="ri-lock-password-line"></i>
                                </div>
                                <button type="submit" class="btn theme-btn submit-btn w-100 rounded-2">
                                    CONTINUE
                                </button>
                                <p class="fw-normal content-color mt-2">
                                    By creating an account, I accept the 
                                    <span class="fw-semibold">Terms & Conditions & Privacy Policy</span>
                                </p>
                                <p id="reg-error" class="text-danger mt-2" style="display:none;"></p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

export function init() {
    if (isLoggedIn()) return;

    const form = document.querySelector("#regForm");
    const errorBox = document.getElementById("reg-error");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = {
            username: document.querySelector("#username").value.trim(),
            email: document.querySelector("#email").value.trim().toLowerCase(),
            phone: document.querySelector("#phone").value.trim(),
            address: document.querySelector("#address").value.trim(),
            password: document.querySelector("#password").value
        };

        try {
            const res = await fetch("http://127.0.0.1:5000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });

            const data = await res.json();

            if (!res.ok) {
                errorBox.innerText = data.error || "Registration failed";
                errorBox.style.display = "block";
                return;
            }

            errorBox.style.display = "none";

            // ✅ Save JWT + minimal user info
            saveAuth(data.token, {
                id: data.user.id,
                username: data.user.username,
                role: data.user.role,
                phone: data.user.phone || "",
                address: data.user.address || ""
            });

            // ✅ Redirect user
            if (hasCartItems()) goTo("/checkout");
            else goTo("/");

        } catch (err) {
            console.error(err);
            errorBox.innerText = "Server error, try again later.";
            errorBox.style.display = "block";
        }
    });
}
