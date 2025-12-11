// src/helpers/auth.js
// ----------------------
// Centralized authentication helpers
// Token storage, decoding, expiration, logout, and authorized fetch wrapper.

import { API_BASE } from "../../public/assets/js/api";
import { refreshHeader } from "../app.js";

export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";

/**
 * Save auth token + user object
 */
export function saveAuth(token, user) {
    if (!token) return;

    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Clear saved authentication data
 */
export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Decode JWT payload safely
 */
export function decodeToken(token) {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

/**
 * Check if the token is expired
 */
export function isTokenExpired(token = null) {
    const t = token || localStorage.getItem(TOKEN_KEY);
    if (!t) return true;

    const payload = decodeToken(t);
    if (!payload?.exp) return true;

    return Date.now() / 1000 >= payload.exp;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? !isTokenExpired(token) : false;
}

/**
 * Get stored user object
 */
export function getUser() {
    try {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch {
        clearAuth();
        return null;
    }
}

/**
 * SPA navigation
 */
export function goTo(path) {
    history.pushState(null, null, path);
    import("/src/router.js").then((m) => m.router(path));
}

/**
 * Logout: clear storage + optional backend logout
 */
export async function logout(redirectTo = "/login", callBackend = true) {
    const token = localStorage.getItem(TOKEN_KEY);

    if (callBackend && token) {
        try {
            await fetch(`${API_BASE}/api/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
        } catch (e) {
            console.warn("Logout backend failed (ignored)");
        }
    }

    // Clear auth
    clearAuth();

    // Update header immediately
    refreshHeader();

    // Redirect SPA
    goTo(redirectTo);
}

/**
 * Fetch wrapper with auth + auto logout
 */
export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token && isTokenExpired(token)) {
        await logout("/login", false);
        throw new Error("Token expired");
    }

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        await logout("/login", false);
        throw new Error("Unauthorized");
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("json")) {
        const data = await response.json();
        if (!response.ok) {
            const error = new Error(data.error || "Request failed");
            error.response = data;
            throw error;
        }
        return data;
    } else {
        const text = await response.text();
        throw new Error(`Non-JSON response: ${text}`);
    }
}

/**
 * Check if cart has items
 */
export function hasCartItems() {
    try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        return cart.length > 0;
    } catch {
        return false;
    }
}
