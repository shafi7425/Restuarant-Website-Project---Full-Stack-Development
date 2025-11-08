export function home(){
    return `

    <!-- skeleton loader start -->
    <div class="skeleton-loader">
        
        <section class="home-wrapper">
            <div class="container text-center">
                <div class="loader-gif">
                    <img src="assets/images/gif/food.gif" alt="food-gif" class="img-fluid">
                </div>
                <h2>Searching the most delicious dish in your area...</h2>
            </div>
        </section>
        
    </div>
    <!-- skeleton loader end -->
    
    <!-- home section start -->
    <section id="home" class="home-wrapper home2 section-b-space overflow-hidden">
        <div class="container text-center">
            <div class="row">
                <div class="col-lg-7 col-12">
                    <h2>Discover restaurants that food deliver near you</h2>
                    <div class="search-section">
                        <form class="auth-form search-head" target="_blank">
                            <div class="form-group">
                                <div class="form-input mb-0">
                                    <input type="search" class="form-control search" id="inputusername"
                                        placeholder="Search for Restaurant">
                                    <i class="ri-search-line search-icon"></i>
                                </div>
                            </div>
                        </form>
                        <a class="btn theme-btn mt-0" href="#" role="button">Search</a>
                    </div>
                </div>
                <div class="col-lg-5 position-relative">
                    <img src="assets/images/home-vector.png" class="img-fluid right-vector" alt="right-vector">
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
                    <div class="row g-lg-4 g-3">
                        <div class="col-xl-3 col-lg-4 col-sm-6">
                            <div class="vertical-product-box">
                                <div class="vertical-product-box-img">
                                    <a href="menu-listing.html">
                                        <img class="product-img-top w-100 bg-img" src="assets/images/product/vp-9.png"
                                            alt="vp1">
                                    </a>
                                    <div class="offers">
                                        <h6>upto $2</h6>
                                        <div class="d-flex align-items-center justify-content-between">
                                            <h4>50% OFF</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="vertical-product-body">
                                    <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                                        <a href="menu-listing.html">
                                            <h4 class="vertical-product-title">Poultry Palace</h4>
                                        </a>
                                        <h6 class="rating-star">
                                            <span class="star"><i class="ri-star-s-fill"></i></span>3.9
                                        </h6>
                                    </div>
                                    <h5 class="product-items">
                                        Chicken quesadilla, avocado....
                                    </h5>
                                    <div
                                        class="location-distance d-flex align-items-center justify-content-between pt-sm-3 pt-2">
                                        <h5 class="place">New Jsercy</h5>
                                        <ul class="distance">
                                            <li><i class="ri-map-pin-fill icon"></i> 3.2 km</li>
                                            <li><i class="ri-time-fill icon"></i> 25 min</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-3 col-lg-4 col-sm-6">
                            <div class="vertical-product-box">
                                <div class="seller-badge">
                                    <img class="img-fluid badge" src="assets/images/svg/medal-fill.svg" alt="medal">
                                    <h6>Exclusive</h6>
                                </div>
                                <div class="vertical-product-box-img">
                                    <a href="menu-listing.html">
                                        <img class="vertical-product-img-top w-100 bg-img"
                                            src="assets/images/product/vp-10.png" alt="vp-2">
                                    </a>
                                    <div class="offers">
                                        <h6>upto $2</h6>
                                        <div class="d-flex align-items-center justify-content-between">
                                            <h4>50% OFF</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="vertical-product-body">
                                    <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                                        <a href="menu-listing.html">
                                            <h4 class="vertical-product-title">Ribeye Junction</h4>
                                        </a>
                                        <h6 class="rating-star">
                                            <span class="star"><i class="ri-star-s-fill"></i></span>3.2
                                        </h6>
                                    </div>
                                    <h5 class="product-items">
                                        Chicken quesadilla, avocado....
                                    </h5>
                                    <div
                                        class="location-distance d-flex align-items-center justify-content-between pt-sm-3 pt-2">
                                        <h5 class="place">California</h5>
                                        <ul class="distance">
                                            <li><i class="ri-map-pin-fill icon"></i> 1 km</li>
                                            <li><i class="ri-time-fill icon"></i> 10 min</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-3 col-lg-4 col-sm-6">
                            <div class="vertical-product-box">
                                <div class="vertical-product-box-img">
                                    <a href="menu-listing.html">
                                        <img class="product-img-top w-100 bg-img" src="assets/images/product/vp-11.png"
                                            alt="vp3">
                                    </a>
                                </div>
                                <div class="vertical-product-body">
                                    <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                                        <a href="menu-listing.html">
                                            <h4 class="vertical-product-title">
                                                The Grill Master's Cafe
                                            </h4>
                                        </a>
                                        <h6 class="rating-star">
                                            <span class="star"><i class="ri-star-s-fill"></i></span>4.3
                                        </h6>
                                    </div>
                                    <h5 class="product-items">Bread, Eggs, Butter, Fries...</h5>
                                    <div
                                        class="location-distance d-flex align-items-center justify-content-between pt-sm-3 pt-2">
                                        <h5 class="place">New York</h5>
                                        <ul class="distance">
                                            <li><i class="ri-map-pin-fill icon"></i> 5 km</li>
                                            <li><i class="ri-time-fill icon"></i> 40 min</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-3 col-lg-4 col-sm-6">
                            <div class="vertical-product-box">
                                <div class="vertical-product-box-img">
                                    <a href="menu-listing.html">
                                        <img class="product-img-top w-100 bg-img" src="assets/images/product/vp-12.png"
                                            alt="vp-4">
                                    </a>
                                </div>
                                <div class="vertical-product-body">
                                    <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                                        <a href="menu-listing.html">
                                            <h4 class="vertical-product-title">Cozy Cuppa Cafe</h4>
                                        </a>
                                        <h6 class="rating-star">
                                            <span class="star"><i class="ri-star-s-fill"></i></span>3.6
                                        </h6>
                                    </div>
                                    <h5 class="product-items">
                                        cheesecake, waffles, Cakes,...
                                    </h5>
                                    <div
                                        class="location-distance d-flex align-items-center justify-content-between pt-sm-3 pt-2">
                                        <h5 class="place">Dallas</h5>
                                        <ul class="distance">
                                            <li><i class="ri-map-pin-fill icon"></i> 4 km</li>
                                            <li><i class="ri-time-fill icon"></i> 30 min</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-3 col-lg-4 col-sm-6">
                            <div class="vertical-product-box">
                                <div class="vertical-product-box-img">
                                    <a href="menu-listing.html">
                                        <img class="product-img-top w-100 bg-img" src="assets/images/product/vp-13.png"
                                            alt="vp-5">
                                    </a>
                                </div>
                                <div class="vertical-product-body">
                                    <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                                        <a href="menu-listing.html">
                                            <h4 class="vertical-product-title">Mocha Magic Cafe</h4>
                                        </a>
                                        <h6 class="rating-star">
                                            <span class="star"><i class="ri-star-s-fill"></i></span>3.2
                                        </h6>
                                    </div>
                                    <h5 class="product-items">Chinese, Momos, Dumplings,...</h5>
                                    <div
                                        class="location-distance d-flex align-items-center justify-content-between pt-sm-3 pt-2">
                                        <h5 class="place">Seattle</h5>
                                        <ul class="distance">
                                            <li><i class="ri-map-pin-fill icon"></i> 1 km</li>
                                            <li><i class="ri-time-fill icon"></i> 8 min</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-3 col-lg-4 col-sm-6">
                            <div class="vertical-product-box">
                                <div class="vertical-product-box-img">
                                    <a href="menu-listing.html">
                                        <img class="product-img-top w-100 bg-img" src="assets/images/product/vp-14.png"
                                            alt="vp16">
                                    </a>
                                    <div class="offers">
                                        <h6>upto $2</h6>
                                        <div class="d-flex align-items-center justify-content-between">
                                            <h4>50% OFF</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="vertical-product-body">
                                    <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                                        <a href="menu-listing.html">
                                            <h4 class="vertical-product-title">Latte Lounge</h4>
                                        </a>
                                        <h6 class="rating-star">
                                            <span class="star"><i class="ri-star-s-fill"></i></span>3.6
                                        </h6>
                                    </div>
                                    <h5 class="product-items">
                                        Chicken fingers, Chicken goujons,....
                                    </h5>
                                    <div
                                        class="location-distance d-flex align-items-center justify-content-between pt-sm-3 pt-2">
                                        <h5 class="place">Atlanta</h5>
                                        <ul class="distance">
                                            <li><i class="ri-map-pin-fill icon"></i> 3 km</li>
                                            <li><i class="ri-time-fill icon"></i> 25 min</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-3 col-lg-4 col-sm-6">
                            <div class="vertical-product-box">
                                <div class="seller-badge exclusive-badge">
                                    <img class="img-fluid badge" src="assets/images/svg/crown.svg" alt="medal">
                                    <h6>Best seller</h6>
                                </div>
                                <div class="vertical-product-box-img">
                                    <a href="menu-listing.html">
                                        <img class="vertical-product-img-top w-100 bg-img"
                                            src="assets/images/product/vp-15.png" alt="vp-7">
                                    </a>
                                    <div class="offers">
                                        <h6>upto $2</h6>
                                        <div class="d-flex align-items-center justify-content-between">
                                            <h4>50% OFF</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="vertical-product-body">
                                    <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                                        <a href="menu-listing.html">
                                            <h4 class="vertical-product-title">The Burger Barn</h4>
                                        </a>
                                        <h6 class="rating-star">
                                            <span class="star"><i class="ri-star-s-fill"></i></span>3.8
                                        </h6>
                                    </div>
                                    <h5 class="product-items">
                                        Burger, Garlic Bread, Sandwich....
                                    </h5>
                                    <div
                                        class="location-distance d-flex align-items-center justify-content-between pt-sm-3 pt-2">
                                        <h5 class="place">Chicago</h5>
                                        <ul class="distance">
                                            <li><i class="ri-map-pin-fill icon"></i> 2.4 km</li>
                                            <li><i class="ri-time-fill icon"></i> 20 min</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xl-3 col-lg-4 col-sm-6">
                            <div class="vertical-product-box">
                                <div class="seller-badge new-badge">
                                    <img class="img-fluid badge" src="assets/images/svg/star-white.svg" alt="medal">
                                    <h6>Newest</h6>
                                </div>
                                <div class="vertical-product-box-img">
                                    <a href="menu-listing.html">
                                        <img class="vertical-product-img-top w-100 bg-img"
                                            src="assets/images/product/vp-16.png" alt="vp-8">
                                    </a>
                                    <div class="offers">
                                        <h6>upto $2</h6>
                                        <div class="d-flex align-items-center justify-content-between">
                                            <h4>50% OFF</h4>
                                        </div>
                                    </div>
                                </div>
                                <div class="vertical-product-body">
                                    <div class="d-flex align-items-center justify-content-between mt-sm-3 mt-2">
                                        <a href="menu-listing.html">
                                            <h4 class="vertical-product-title">Wing Master</h4>
                                        </a>
                                        <h6 class="rating-star">
                                            <span class="star"><i class="ri-star-s-fill"></i></span>3.2
                                        </h6>
                                    </div>
                                    <h5 class="product-items">
                                        Chicken quesadilla, avocado....
                                    </h5>
                                    <div
                                        class="location-distance d-flex align-items-center justify-content-between pt-sm-3 pt-2">
                                        <h5 class="place">New York</h5>
                                        <ul class="distance">
                                            <li><i class="ri-map-pin-fill icon"></i> 1.8 km</li>
                                            <li><i class="ri-time-fill icon"></i> 12 min</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- featured Restaurants section end -->

    <section class="section-b-space">
        <div class="container">
            <div class="row g-3">
                <div class="col-xl-7">
                    <div class="title animated-title">
                        <div class="loader-line"></div>
                        <h2 class="mb-sm-3 mb-2">What is ZOMO?</h2>
                        <p class="content-color">
                            Welcome to our online order website! Here, you can browse our
                            wide selection of products and place orders from the comfort of
                            your own home. Whether you're looking for groceries,
                            electronics, or gifts, we have you covered. With easy
                            navigation, secure payment options, and fast delivery.
                        </p>

                        <p class="pt-2 content-color">
                            we strive to make your online shopping experience as seamless as
                            possible. Explore our website today and discover the convenience
                            of ordering online!
                        </p>

                        <p class="pt-2 content-color">
                            So why wait? Start shopping on our online order website today
                            and experience the ultimate convenience of online shopping!"
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

    <!-- service section starts -->
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
    <!-- service section end -->

    <!-- App section start -->
    <section class="app-section">
        <div class="container">
            <div class="d-flex align-items-center">
                <div class="app-img">
                    <img class="img-fluid phone" src="assets/images/service-phone.png" alt="app-phone">
                </div>
                <div class="app-content">
                    <h2>Zomo App : Online &amp; Mobile Ordering</h2>
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
     `
}