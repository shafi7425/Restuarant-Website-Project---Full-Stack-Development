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
import { ordersPage } from './pages/dashboard/orders.js';
import { dishesPage } from './pages/dashboard/dishes.js';
import { dishcategoriesPage } from './pages/dashboard/dish-categories.js';
import { blogsPage } from './pages/dashboard/blogs.js';
import { announcementsPage } from './pages/dashboard/announcements.js';
import { menu } from './pages/frontend/menu.js';



export function router(path) {
    const app = document.getElementById('app');
    
    switch(true) {
        // ✅ Login Page
        case path === '/login':
            if (isLoggedIn()) {
                const user = getUser();
                if (user.role === "admin") {
                    goTo("/admin/dashboard");
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
                title: 'Login - Foodie Web',
                description: 'Login to your Foodie Web account.',
                keywords: 'login, Foodie Web, account'
            });
            break;

        // ✅ Register Page
        case path === '/register':
            if (isLoggedIn()) {
                const user = getUser();
                if (user.role === "admin") {
                    goTo("/admin/dashboard");
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
                title: 'Register - Foodie Web',
                description: 'Create a new Foodie Web account.',
                keywords: 'register, signup, Foodie Web'
            });
            break;

        // ✅ About Us
        case path === '/about-us':
            app.innerHTML = about();
            setMeta({
                title: 'About Us - Foodie Web',
                description: 'Learn more about Foodie Web.',
                keywords: 'about, Foodie Web'
            });
            break;

        // ✅ Blogs
        case path === '/blogs':
            app.innerHTML = blogs();
            blogsInit();
            setMeta({
                title: 'Blogs - Foodie Web',
                description: 'Read the latest articles and updates.',
                keywords: 'blogs, food, Foodie Web'
            });
            break;

        // ✅ Blogs
        case path === '/menu':
            app.innerHTML = menu();
            loadDishes();
            setMeta({
                title: 'Blogs - Foodie Web',
                description: 'Read the latest articles and updates.',
                keywords: 'blogs, food, Foodie Web'
            });
            break;
            
        case path.startsWith("/blogs/") && path.split("/").length === 3: {
            const blogId = path.split("/")[2];
            app.innerHTML = blogSingle();
            blogSingleInit({ id: blogId });

            setMeta({
                title: 'Blog Details - Foodie Web',
                description: 'Read this blog article.',
                keywords: 'blog, article, Foodie Web'
            });
            break;
        }


        // ✅ Contact Us
        case path === '/contact-us':
            app.innerHTML = contact();
            setMeta({
                title: 'Contact Us - Foodie Web',
                description: 'Get in touch with Foodie Web.',
                keywords: 'contact, Foodie Web'
            });
            break;

        // ✅ Single Dish
        case path.startsWith('/dish'):
            app.innerHTML = dishPage();
            dishInit();
            setMeta({
                title: 'Single Product - Foodie Web',
                description: 'View details of this dish.',
                keywords: 'dish, Foodie Web, food'
            });
            break;

        // ✅ Cart Page
        case path === '/cart':
            app.innerHTML = cartPage();
            cartInit();
            setMeta({
                title: 'Cart - Foodie Web',
                description: 'View your shopping cart.',
                keywords: 'cart, Foodie Web, order'
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
                title: 'Checkout - Foodie Web',
                description: 'Complete your order.',
                keywords: 'checkout, Foodie Web, order'
            });
            break;

        // ✅ Thank You Page
        case path.startsWith('/thank-you'):
            app.innerHTML = thankyou(); 
            setMeta({
                title: 'Thank You - Foodie Web',
                description: 'Order placed successfully.',
                keywords: 'order, thank you, Foodie Web'
            });
            break;

        case path === '/track-order':
            import('/src/pages/frontend/trackorder.js').then(m => {
                app.innerHTML = m.trackorder();
                m.trackorderInit();
            });
            setMeta({
                title: 'Track Your Order - Foodie Web',
                description: 'Check the status of your recent Foodie Web order.',
                keywords: 'track order, order status, Foodie Web'
            });
            break;

        // ✅ Dashboard
        case path === '/admin/dashboard':
            app.innerHTML = dashboard();
            dashboardInit();
            setMeta({
                title: 'Dashboard - Foodie Web',
                description: 'Your account overview.',
                keywords: 'dashboard, Foodie Web, account'
            });
            break;
           
        // ✅ Orders
        case path === '/admin/orders':
            app.innerHTML = ordersPage();
            
            setMeta({
                title: 'Orders - Foodie Web',
                description: 'Your account overview.',
                keywords: 'dashboard, Foodie Web, account'
            });
            break;

        // ✅ Dishes
        case path === '/admin/dishes':
            if (isLoggedIn()) {
                const user = getUser();
                if (user.role !== "admin") {
                    goTo("/admin/dashboard");
                    return
                }
            }
            app.innerHTML = dishesPage();
            
            setMeta({
                title: 'Dishes - Foodie Web',
                description: 'Your account overview.',
                keywords: 'dashboard, Foodie Web, account'
            });
            break;
            // ✅ Dishes
        case path === '/admin/dishcategories':
             if (isLoggedIn()) {
                const user = getUser();
                if (user.role !== "admin") {
                    goTo("/admin/dashboard");
                    return
                }
            }
            app.innerHTML = dishcategoriesPage();
            
            setMeta({
                title: 'Dish Categories - Foodie Web',
                description: 'Your account overview.',
                keywords: 'dashboard, Foodie Web, account'
            });
            break;
        
        case path === '/admin/blogs':
             if (isLoggedIn()) {
                const user = getUser();
                if (user.role !== "admin") {
                    goTo("/admin/dashboard");
                    return
                }
            }
            blogsPage();
            
            setMeta({
                title: 'Blogs - Foodie Web',
                description: 'Your account overview.',
                keywords: 'dashboard, Foodie Web, account'
            });
            break;

        case path === '/admin/announcements':
             if (isLoggedIn()) {
                const user = getUser();
                if (user.role !== "admin") {
                    goTo("/admin/dashboard");
                    return
                }
            }
            announcementsPage();
            
            setMeta({
                title: 'Announcements - Foodie Web',
                description: 'Announcements.',
                keywords: 'Announcements, notices'
            });
            break;


        // ✅ Home Page
        case path === '/':
        default:
            app.innerHTML = home();
            loadDishes();
            setMeta({
                title: 'Home - Foodie Web',
                description: 'Foodie Web online food ordering platform.',
                keywords: 'Foodie Web, food, delivery'
            });
            break;
    }
}

// ✅ Helper SPA redirect
function goTo(path) {
    history.pushState(null, null, path);
    import('./router.js').then(m => m.router(path));
}
