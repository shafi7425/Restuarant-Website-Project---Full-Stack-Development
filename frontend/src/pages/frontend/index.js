// pages/frontend/index.js

export function home() {
    return `
    <!-- home section start -->
    <section class="pt-4 home3">
        <div class="custom-container">
            <div class="position-relative">
                <img src="assets/images/home-bg2.png" class="img-fluid bg-home-img" alt="">
                <div class="home-content">
                    <div class="row w-100 h-100">
                        <div class="col-sm-6 col-12">
                            <div class="home-left-content">
                                <label>50% off on First delivery</label>
                                <h2>Discover restaurants that food deliver near you</h2>
                                <p>Foodie Store bring you a new variety of delicious meals daily.
                                Order online, explore our changing menu, and enjoy freshly prepared dishes delivered right to your doorstep.
                                </p>
                                <div class="search-section">
                                    <a class="btn theme-btn mt-0" href="#" role="button">Order Now</a>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-6 d-sm-block d-none">
                            <div class="home-right position-relative">
                                <img src="assets/images/mobile.png" class="img-fluid base-phone" alt="">
                                <div class="animated-img">
                                    <div class="food1">
                                        <img src="assets/images/food1.png" data-aos="fade-down" data-aos-easing="linear" data-aos-anchor-placement="top-center" data-aos-duration="1200" class="img-fluid aos-init aos-animate" alt="">
                                    </div>
                                    <div class="food2">
                                        <img src="assets/images/food2.png" data-aos-duration="1200" data-aos="fade-down" data-aos-anchor-placement="bottom-center" class="img-fluid aos-init aos-animate" alt="">
                                    </div>
                                    <div class="food3">
                                        <img src="assets/images/food3.png" data-aos="fade-down" data-aos-easing="linear" data-aos-anchor-placement="bottom-bottom" data-aos-duration="1000" class="img-fluid aos-init aos-animate" alt="">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- home section end -->

    <!-- Featured Restaurants section starts -->
    <section class="restaurant-list section-b-space banner-section ratio3_2">
        <div class="container">
            <div class="title restaurant-title w-border pb-0">
                <h2>Featured Restaurants</h2>
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

    <!-- What is Foodie Store section -->
    <section class="section-b-space">
        <div class="container">
            <div class="row g-3">
                <div class="col-xl-7">
                    <div class="title animated-title">
                        <div class="loader-line"></div>
                        <h2 class="mb-sm-3 mb-2">Who We Are?</h2>
                        <p class="content-color">
                            Foodie Store is your go-to online food destination, 
                            offering a unique menu that changes every day.
                            We focus on fresh ingredients, great taste, and convenience so you can enjoy different flavors without repeating the same meals.
                        </p>

                        <p class="pt-2 content-color">
                            From comfort classics to modern flavors, 
                            our rotating menu ensures there’s always something new to try, 
                            prepared with care and delivered with love.
                        </p>

                    </div>
                    <div class="about-image-part">
                        <div class="row g-sm-3 g-2">
                            <div class="col-xl-3 col-lg-3 col-sm-6 col-6">
                                <div class="about-images ratio_square">
                                    <img class="bg-size img" src="assets/images/service/1.jpg" alt="1">
                                </div>
                            </div>
                            <div class="col-xl-3 col-lg-3 col-sm-6 col-6">
                                <div class="about-images ratio_square">
                                    <img class="bg-size img" src="assets/images/service/2.jpg" alt="2">
                                </div>
                            </div>
                            <div class="col-xl-3 col-lg-3 col-sm-6 col-6">
                                <div class="about-images ratio_square">
                                    <img class="bg-size img" src="assets/images/service/3.jpg" alt="3">
                                </div>
                            </div>
                            <div class="col-xl-3 col-lg-3 col-sm-6 col-6">
                                <div class="about-images ratio_square">
                                    <img class="bg-size img" src="assets/images/service/4.jpg" alt="4">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-5 d-xl-inline-block d-none">
                    <div class="about-images h-100">
                        <img class="img-fluid img h-100" src="assets/images/service/5.jpg" alt="2">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Services section start -->
    <section class="service-box-section section-b-space">
        <div class="container">
            <div class="row g-3">
                <div class="col-xl-3 col-lg-6 col-sm-6 col-12">
                    <div class="service-box">
                        <div class="service-img">
                            <img class="img-fluid icon" src="assets/images/svg/routing.svg" alt="routing">
                        </div>
                        <h5 class="service-name">Easiest Way To Order</h5>
                        <div class="dot"></div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-sm-6 col-12">
                    <div class="service-box">
                        <div class="service-img">
                            <img class="img-fluid icon" src="assets/images/svg/3d-rotate.svg" alt="3d-rotate">
                        </div>
                        <h5 class="service-name">Easy Refund Policies</h5>
                        <div class="dot"></div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-sm-6 col-12">
                    <div class="service-box">
                        <div class="service-img">
                            <img class="img-fluid icon" src="assets/images/svg/truck.svg" alt="truck">
                        </div>
                        <h5 class="service-name">Free Fast Deliveries</h5>
                        <div class="dot"></div>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-6 col-sm-6 col-12">
                    <div class="service-box">
                        <div class="service-img">
                            <img class="img-fluid icon" src="assets/images/svg/medal.svg" alt="medal">
                        </div>
                        <h5 class="service-name">Premium Options</h5>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Services section end -->

    <!-- App section start -->
    <section class="app-section">
        <div class="container">
            <div class="d-flex align-items-center">
                <div class="app-img">
                    <img class="img-fluid phone" src="assets/images/service-phone.png" alt="app-phone">
                </div>
                <div class="app-content">
                    <h2>Foodie Store App : Online &amp; Mobile Ordering</h2>
                    <h5>
                        Get the app for free and place takeout orders online whenever you
                        want.
                    </h5>
                    <div class="app-buttons d-flex align-items-center gap-3">
                        <a href="https://www.apple.com/in/app-store/">
                            <img class="img-fluid app-btn" src="assets/images/svg/app-store.svg" alt="app-store">
                        </a>
                        <a href="https://play.google.com/store/apps">
                            <img class="img-fluid app-btn" src="assets/images/svg/google-play.svg" alt="google-play">
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- App section end -->
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
                console.log('Today:', data.today);

        if (dishes.length === 0) {
            container.innerHTML = `<p>No dishes available today.</p>`;
            return;
        }

        container.innerHTML = dishes.map(dish => `
            <div class="col-xl-3 col-lg-4 col-sm-6">
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
                            <span>Price: €${dish.price}</span>
                        </div>
                        
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error loading dishes:', err);
        container.innerHTML = `<p>Failed to load dishes.</p>`;
    }
}
