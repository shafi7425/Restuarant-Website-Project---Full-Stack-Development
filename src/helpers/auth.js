// helpers/auth.js
// ----------------------
// Store token and user info locally. User info comes from backend on login/register.

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

/**
 * Save auth token and user info after login or registration
 * @param {string} token
 * @param {object} user
 */
export function saveAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Remove auth token and user info (logout)
 */
export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is logged in by verifying token exists
 */
export function isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY);
}

/**
 * Get logged-in user details from localStorage
 */
export function getUser() {
    const user = localStorage.getItem(USER_KEY);
    if (!user) return null;
    try {
        return JSON.parse(user);
    } catch (err) {
        console.error("Failed to parse user:", err);
        clearAuth();
        return null;
    }
}

/**
 * Redirect helper
 */
export function goTo(path) {
    history.pushState(null, null, path);
    import('/src/router.js').then(m => m.router(path));
}

/**
 * Check if cart has items
 */
export function hasCartItems() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    return cart.length > 0;
}
