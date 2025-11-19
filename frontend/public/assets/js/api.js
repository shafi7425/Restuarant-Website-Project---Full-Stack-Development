// Change this to your Flask backend URL
export const API_BASE = "http://localhost:5000";
window.API_BASE = API_BASE;

// --- GET: Fetch full menu list ---
export async function getFoods() {
    try {
        const res = await fetch(`${API_BASE}/api/fdishes`);
        const data = await res.json();
        console.log("Foods:", data);   // ✅ Now this will run
        return data;
    } catch (err) {
        console.error("Error fetching foods:", err);
        return [];
    }
}

// --- GET: Fetch single food item by ID ---
export async function getFoodById(id) {
    try {
        const res = await fetch(`${API_BASE}/api/foods/${id}`);
        return await res.json();
    } catch (err) {
        console.error("Error fetching food item:", err);
        return null;
    }
}

// --- POST: Create order ---
export async function createOrder(orderData) {
    try {
        const res = await fetch(`${API_BASE}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        return await res.json();
    } catch (err) {
        console.error("Order error:", err);
        return { error: true };
    }
}
