import { getFoods } from "./api.js";
import { createFoodCard, $, addToCart } from "./utils.js";

async function init() {
    const container = $("#food-container"); 
    // Make sure your HTML has: <div id="food-container"></div>

    if (!container) {
        console.warn("food-container not found on this page.");
        return;
    }

    // Fetch menu from backend
    const foods = await getFoods();

   

    // Add to cart listener
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-cart")) {
            const id = e.target.getAttribute("data-id");
            const item = foods.find(f => f._id === id);

            if (item) {
                addToCart(item);
                alert(`${item.name} added to cart`);
            }
        }
    });
}

// Run when page loads
init();
