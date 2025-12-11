// Simple selector short form
export function $(selector) {
    return document.querySelector(selector);
}

// Create a reusable card element (adjust according to your HTML template)
export function createFoodCard(item) {
    const div = document.createElement("div");
    div.className = "food-card";

    div.innerHTML = `
        <img src="${item.image || 'assets/images/placeholder.jpg'}" alt="${item.name}" class="food-img">
        <h3>${item.name}</h3>
        <p>${item.description || ''}</p>
        <p><strong>$${item.price}</strong></p>
        <button class="add-to-cart" data-id="${item._id}">Add to Cart</button>
    `;

    return div;
}

// Add item to localStorage cart
export function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
}

// Read all cart items
export function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}
