export function renderHeader() {
    return `
    <header>
        <div class="container">
            <nav class="navbar navbar-expand-lg p-0">

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#offcanvasNavbar">
                    <span class="navbar-toggler-icon">
                        <i class="ri-menu-line"></i>
                    </span>
                </button>

                <a href="/" data-link>
                    <img class="img-fluid logo" src="assets/images/svg/logo.svg" alt="logo">
                </a>

                <a href="#!" data-bs-toggle="modal" data-bs-target="#location"
                    class="btn btn-sm theme-btn location-btn mt-0 ms-3 d-flex align-content-center gap-1">
                    <i class="ri-map-pin-line"></i> Location
                </a>

                <div class="nav-option order-md-2">
                    <div class="dropdown-button">
                        <div class="cart-button">
                            <span>5</span>
                            <i class="ri-shopping-cart-line text-white cart-bag"></i>
                        </div>

                        <div class="onhover-box">
                            <ul class="cart-list">

                                <li class="product-box-contain">
                                    <div class="drop-cart">
                                        <a href="#!" class="drop-image">
                                            <img src="assets/images/product/vp-3.png" alt="">
                                        </a>

                                        <div class="drop-contain">
                                            <a href="#!"><h5>Egg Sandwich</h5></a>
                                            <h6><span>1 x </span> $80.58</h6>
                                            <button class="close-button close_button">
                                                <i class="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    </div>
                                </li>

                                <li class="product-box-contain">
                                    <div class="drop-cart">
                                        <a href="#!" class="drop-image">
                                            <img src="assets/images/product/vp-2.png" alt="">
                                        </a>

                                        <div class="drop-contain">
                                            <a href="#!"><h5>Grilled Chicken Quesadilla</h5></a>
                                            <h6><span>1 x </span> $25.64</h6>
                                            <button class="close-button close_button">
                                                <i class="fa-solid fa-xmark"></i>
                                            </button>
                                        </div>
                                    </div>
                                </li>

                                <!-- Add rest items as you had them -->
                            
                            </ul>

                            <div class="price-box">
                                <h5>Total :</h5>
                                <h4 class="theme-color fw-semibold">$155.00</h4>
                            </div>

                            <div class="button-group">
                                <a href="checkout.html" class="btn btn-sm theme-btn w-100 d-block rounded-2">
                                    View Cart
                                </a>
                            </div>
                        </div>
                    </div>

                    <a href="/login" data-link class="btn btn-sm theme-btn">Login</a>
                </div>

                <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title">Menu</h5>
                        <button class="navbar-toggler btn-close" id="offcanvas-close"></button>
                    </div>

                    <div class="offcanvas-body">
                        <ul class="navbar-nav justify-content-center flex-grow-1">

                            <li class="nav-item dropdown mega-menu">
                                <a class="nav-link dropdown-toggle" href="#!" data-bs-toggle="dropdown">
                                    Home
                                </a>

                                <div class="dropdown-menu mt-0 border-0">
                                    <div class="row row-cols-lg-5 row-cols-1 g-xl-4 g-3">

                                        <div class="col">
                                            <a href="index-2.html" class="demo-box" target="_blank">
                                                <img src="landing/assets/images/demo/1.png" class="img-fluid demo-img">
                                                <h5 class="dropdown-item">Classic</h5>
                                            </a>
                                        </div>

                                        <!-- ADD other variants same as your code -->
                                    </div>
                                </div>
                            </li>

                            <!-- Order menu -->
                            <li class="nav-item">
                                <a class="nav-link dropdown-toggle" href="#!" data-bs-toggle="dropdown">Order</a>
                                <ul class="dropdown-menu mt-0 border-0">
                                    <li><a class="dropdown-item" href="menu-listing.html">Menu listing</a></li>
                                    <li><a class="dropdown-item" href="menu-grid.html">Menu grid</a></li>
                                </ul>
                            </li>

                            <!-- Other pages same as your original HTML -->
                            
                        </ul>
                    </div>
                </div>

            </nav>
        </div>
    </header>
    `;
}

// Helper to navigate without page reload
export function navigate(e, path) {
    e.preventDefault();
    history.pushState({}, '', path);
    import('/src/router.js').then(module => module.router(path));
}