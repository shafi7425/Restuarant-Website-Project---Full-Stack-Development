import { saveAuth, hasCartItems, goTo, isLoggedIn } from "../../helpers/auth.js";

export function render() {
    // Prevent logged-in users from seeing login page
    if (isLoggedIn()) {
        // Redirect immediately; no need to fetch user from backend
        const user = JSON.parse(localStorage.getItem("user_info")) || {};
        if (user.role === "admin") goTo("/dashboard");
        else if (hasCartItems()) goTo("/checkout");
        else goTo("/");
        return "";
    }

    return `
        <!-- page head section -->
        <section class="page-head-section app-section">
            <div class="container page-heading">
                <h2 class="h3 mb-3 text-white text-center">Login</h2>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb flex-lg-nowrap justify-content-center justify-content-lg-star">
                        <li class="breadcrumb-item">
                            <a href="/" data-link><i class="ri-home-line"></i>Home</a>
                        </li>
                        <li class="breadcrumb-item active" aria-current="page">Login</li>
                    </ol>
                </nav>
            </div>
        </section>

        <section class="login-hero-section section-b-space">
            <div class="container">
                <div class="row">
                    <div class="col-xl-5 col-lg-6 col-md-10 m-auto">
                        <div class="login-data">
                            <form id="loginForm" class="auth-form">
                                <h2>Sign in</h2>
                                <h5>
                                    or
                                    <a href="/register" data-link>
                                        <span class="theme-color">Create an account</span>
                                    </a>
                                </h5>
                                <div class="form-input">
                                    <input id="email" type="email" class="form-control" placeholder="Enter your email" required>
                                    <i class="ri-mail-line"></i>
                                </div>
                                <div class="form-input">
                                    <input id="password" type="password" class="form-control" placeholder="Enter your password" required>
                                    <i class="ri-lock-password-line"></i>
                                </div>
                                <button type="submit" class="btn theme-btn submit-btn w-100 rounded-2">
                                    CONTINUE
                                </button>
                                <p class="fw-normal content-color mt-2">
                                    By creating an account, I accept the
                                    <span class="fw-semibold">Terms & Conditions & Privacy Policy</span>
                                </p>
                                <p id="login-error" class="text-danger mt-2" style="display:none;"></p>
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

    const form = document.querySelector("#loginForm");
    const errorBox = document.getElementById("login-error");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value;

        try {
            const res = await fetch("http://127.0.0.1:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                errorBox.innerText = data.error || "Login failed";
                errorBox.style.display = "block";
                return;
            }

            errorBox.style.display = "none";

            // ✅ Save JWT + minimal user info in localStorage
            saveAuth(data.token, {
                id: data.user.id,
                username: data.user.username,
                role: data.user.role,
                phone: data.user.phone || "",
                address: data.user.address || ""
            });

            // ✅ Redirect based on role / cart
            if (data.user.role === "admin") goTo("/dashboard");
            else if (hasCartItems()) goTo("/checkout");
            else goTo("/");

        } catch (err) {
            console.error(err);
            errorBox.innerText = "Server error, try again later.";
            errorBox.style.display = "block";
        }
    });
}
