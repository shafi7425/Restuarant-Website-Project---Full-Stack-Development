export function renderHeader() {
    return `
    <marquee 
    class="bg-dark py-1 text-center"
    behavior="scroll"
    direction="right"
    scrollamount="5"
>
    <span class="white">Free Delivery on orders over $50!</span>
</marquee>
    <header class="header-light">
        <div class="container">
            <nav class="navbar navbar-expand-lg p-0">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#offcanvasNavbar">
                    <span class="navbar-toggler-icon">
                        <i class="ri-menu-line"></i>
                    </span>
                </button>
                <a href="/" class="text-black" data-link>
                    <b> Foodie Web</b>
                </a>
                <a target="_blank" href="#!" data-bs-toggle="modal" data-bs-target="#location" class="btn btn-sm theme-btn location-btn mt-0 ms-3 d-flex align-content-center gap-1">
                    <i class="ri-map-pin-line"></i> Location
                </a>
                <div class="nav-option order-md-2">
                    <div class="dropdown-button">
                        <div class="cart-button">
                            <span>0</span>
                            <i class="ri-shopping-cart-line cart-bag"></i>
                        </div>
                    </div>
                    <div class="profile-part dropdown-button order-md-2">
                        <img class="img-fluid profile-pic" src="/assets/images/icons/p5.png" alt="profile">
                        <div>
                            <h6 class="fw-normal">Hi, Mark Jecno</h6>
                            <h5 class="fw-medium">My Account</h5>
                        </div>
                        <div class="onhover-box onhover-sm">
                            <ul class="menu-list">
                                <li>
                                    <a class="dropdown-item" href="/profile" data-link>Profile</a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="/my-order" data-link>My orders</a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="/saved-address" data-link>Saved Address</a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="/saved-card" data-link>Saved cards</a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="/setting" data-link>Settings</a>
                                </li>
                            </ul>
                            <div class="bottom-btn">
                                <a href="/" class="theme-color fw-medium d-flex"><i class="ri-login-box-line me-2" data-link></i>Logout</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar">
                    <div class="offcanvas-header">
                        <button class="navbar-toggler btn-close" id="offcanvas-close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <ul class="navbar-nav justify-content-center flex-grow-1">
                             <li class="nav-item">
                                <a class="nav-link" href="/" data-link>Home</a>
                            </li>
                             <li class="nav-item">
                                <a class="nav-link" href="/about-us" data-link>About Us</a>
                            </li>
                             <li class="nav-item">
                                <a class="nav-link" href="/blogs" data-link>Blogs</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/cart" data-link>Cart</a>
                            </li>
                             <li class="nav-item">
                                <a class="nav-link" href="/contact-us" data-link>Contact Us</a>
                            </li>
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