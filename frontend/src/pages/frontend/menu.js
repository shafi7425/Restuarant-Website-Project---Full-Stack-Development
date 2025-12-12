// pages/frontend/menu.js


export function menu() {
    return `
    <!-- title section start -->
    <section class="page-head-section app-section">
        <div class="container page-heading">
            <h2 class="h3 mb-3 text-white text-center">Menu</h2>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb flex-lg-nowrap justify-content-center justify-content-lg-star">
                    <li class="breadcrumb-item">
                        <a href="/"><i class="ri-home-line"></i>Home</a>
                    </li>
                    <li class="breadcrumb-item active" aria-current="page">Menu</li>
                </ol>
            </nav>
        </div>
    </section>
    <!-- title section end -->

    <!-- Featured Restaurants section starts -->
    <section class="restaurant-list section-b-space banner-section ratio3_2">
        <div class="container">
            <div class="title restaurant-title w-border pb-0">
                <h2 id="today-heading">Featured Restaurants</h2>
                <div class="loader-line"></div>
            </div>
            <div class="tab-content restaurant-content" id="TabContent">
                <div class="tab-pane fade show active" id="delivery-tab">
                    <div class="row g-lg-4 g-3" id="dishes-container">
                        <!-- Dishes will be loaded here dynamically -->
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- featured Restaurants section end -->
    `;
}

// Function to load dishes dynamically
export async function loadDishes() {
    const container = document.getElementById('dishes-container');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/api/fdishes`);
        const data = await res.json();
        const dishes = data.dishes || [];

        document.getElementById("today-heading").innerHTML = `
            <span style="color:#f2a93e;">${data.today}</span>'s Dishes
        `;


        if (dishes.length === 0) {
            container.innerHTML = `<p>No dishes available today.</p>`;
            return;
        }

        container.innerHTML = dishes.map(dish => `
            <div class="col-xl-3 col-lg-3 col-sm-6 col-6">
                <div class="vertical-product-box">
                    <div class="vertical-product-box-img">
                        <a href="/dish?id=${dish._id}" data-link>
                            <img class="vertical-product-img-top w-100 bg-img" src="${dish.img}" alt="${dish.title}">
                        </a>
                    </div>
                    <div class="vertical-product-body">
                        <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                            <a href="/dish?id=${dish._id}" data-link>
                                <h4 class="vertical-product-title">${dish.title}</h4>
                            </a>
                        
                        </div>
                           <span>Price: €${dish.price}</span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error loading dishes:', err);
        container.innerHTML = `<p>Failed to load dishes.</p>`;
    }
}
