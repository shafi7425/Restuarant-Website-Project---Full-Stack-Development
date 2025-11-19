import { render as loginPage, init as loginInit } from './pages/auth/login.js';
import { render as registerPage, init as registerInit } from './pages/auth/register.js';
import { about } from './pages/frontend/about.js';
import { blogs, blogsInit } from './pages/frontend/blogs.js';
import { cartInit, cartPage } from './pages/frontend/cart.js';
import { checkoutInit, checkoutPage } from './pages/frontend/checkout.js';
import { contact } from './pages/frontend/contact-us.js';
import { home, loadDishes  } from './pages/frontend/index.js';
import { dishPage, dishInit } from './pages/frontend/single-product.js';
import { dashboard, dashboardInit } from './pages/dashboard/dashboard.js';
import { setMeta } from './utils.js';
import { isLoggedIn, getUser } from './helpers/auth.js';
import { thankyou } from './pages/frontend/thank-you.js';
import { API_BASE } from '../public/assets/js/api.js';
import { blogSingle, blogSingleInit } from './pages/frontend/single-blog.js';


export function router(path) {
    const app = document.getElementById('app');
    
    switch(true) {
        // ✅ Login Page
        case path === '/login':
            if (isLoggedIn()) {
                const user = getUser();
                if (user.role === "admin") {
                    goTo("/dashboard");
                    return;
                } else if (JSON.parse(localStorage.getItem("cart"))?.length) {
                    goTo("/checkout");
                    return;
                } else {
                    goTo("/");
                    return;
                }
            }
            app.innerHTML = loginPage();
            loginInit();
            setMeta({
                title: 'Login - Zomo',
                description: 'Login to your Zomo account.',
                keywords: 'login, zomo, account'
            });
            break;

        // ✅ Register Page
        case path === '/register':
            if (isLoggedIn()) {
                const user = getUser();
                if (user.role === "admin") {
                    goTo("/dashboard");
                    return;
                } else if (JSON.parse(localStorage.getItem("cart"))?.length) {
                    goTo("/checkout");
                    return;
                } else {
                    goTo("/");
                    return;
                }
            }
            app.innerHTML = registerPage();
            registerInit();
            setMeta({
                title: 'Register - Zomo',
                description: 'Create a new Zomo account.',
                keywords: 'register, signup, zomo'
            });
            break;

        // ✅ About Us
        case path === '/about-us':
            app.innerHTML = about();
            setMeta({
                title: 'About Us - Zomo',
                description: 'Learn more about Zomo.',
                keywords: 'about, zomo'
            });
            break;

        // ✅ Blogs
        case path === '/blogs':
            app.innerHTML = blogs();
            blogsInit();
            setMeta({
                title: 'Blogs - Zomo',
                description: 'Read the latest articles and updates.',
                keywords: 'blogs, food, zomo'
            });
            break;
            
        case path.startsWith("/blogs/") && path.split("/").length === 3: {
            const blogId = path.split("/")[2];
            app.innerHTML = blogSingle();
            blogSingleInit({ id: blogId });

            setMeta({
                title: 'Blog Details - Zomo',
                description: 'Read this blog article.',
                keywords: 'blog, article, zomo'
            });
            break;
        }


        // ✅ Contact Us
        case path === '/contact-us':
            app.innerHTML = contact();
            setMeta({
                title: 'Contact Us - Zomo',
                description: 'Get in touch with Zomo.',
                keywords: 'contact, zomo'
            });
            break;

        // ✅ Single Dish
        case path.startsWith('/dish'):
            app.innerHTML = dishPage();
            dishInit();
            setMeta({
                title: 'Single Product - Zomo',
                description: 'View details of this dish.',
                keywords: 'dish, zomo, food'
            });
            break;

        // ✅ Cart Page
        case path === '/cart':
            app.innerHTML = cartPage();
            cartInit();
            setMeta({
                title: 'Cart - Zomo',
                description: 'View your shopping cart.',
                keywords: 'cart, zomo, order'
            });
            break;

        // ✅ Checkout Page
        case path === '/checkout':
            if (!isLoggedIn()) {
                alert("You must login to access checkout.");
                goTo("/login");
                return;
            }
            app.innerHTML = checkoutPage();
            checkoutInit();
            setMeta({
                title: 'Checkout - Zomo',
                description: 'Complete your order.',
                keywords: 'checkout, zomo, order'
            });
            break;

        // ✅ Thank You Page
        case path.startsWith('/thank-you'):
            app.innerHTML = thankyou(); 
            setMeta({
                title: 'Thank You - Zomo',
                description: 'Order placed successfully.',
                keywords: 'order, thank you, zomo'
            });
            break;

        case path === '/track-order':
            import('/src/pages/frontend/trackorder.js').then(m => {
                app.innerHTML = m.trackorder();
                m.trackorderInit();
            });
            setMeta({
                title: 'Track Your Order - Zomo',
                description: 'Check the status of your recent Zomo order.',
                keywords: 'track order, order status, zomo'
            });
            break;


        // ✅ Dashboard
        case path === '/dashboard':
            if (!isLoggedIn()) {
                alert("You must login to access dashboard.");
                goTo("/login");
                return;
            }
            app.innerHTML = dashboard();
            dashboardInit();
            setMeta({
                title: 'Dashboard - Zomo',
                description: 'Admin Dashboard.',
                keywords: 'dashboard, admin, zomo'
            });
            break;

        // ✅ Home Page
        case path === '/':
        default:
            app.innerHTML = home();
            loadDishes();
            setMeta({
                title: 'Home - Zomo',
                description: 'Zomo online food ordering platform.',
                keywords: 'zomo, food, delivery'
            });
            break;
    }
}

// ✅ Helper SPA redirect
function goTo(path) {
    history.pushState(null, null, path);
    import('./router.js').then(m => m.router(path));
}
