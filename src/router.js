import { render as loginPage, init as loginInit } from './pages/auth/login.js';
import { render as registerPage, init as registerInit } from './pages/auth/register.js';
import { about } from './pages/frontend/about.js';
import { blogs } from './pages/frontend/blogs.js';
import { contact } from './pages/frontend/contact-us.js';
import { home, loadDishes  } from './pages/frontend/index.js';
import { setMeta } from './utils.js';

export function router(path) {
    const app = document.getElementById('app');

    switch(path) {
        case '/login':
            app.innerHTML = loginPage();
            loginInit(); // attach event listeners
            setMeta({
                title: 'Login - Zomo',
                description: 'Login to your Zomo account.',
                keywords: 'login, zomo, account'
            });
            break;

        case '/register':
            app.innerHTML = registerPage();
            registerInit(); // attach event listeners
            setMeta({
                title: 'Register - Zomo',
                description: 'Create a new Zomo account.',
                keywords: 'register, signup, zomo'
            });
            break;

        case '/about-us':
            app.innerHTML = about();
            setMeta({
                title: 'About Us - Zomo',
                description: 'Create a new Zomo account.',
                keywords: 'register, signup, zomo'
            });
            break;  
        
        case '/blogs':
        app.innerHTML = blogs();
        setMeta({
            title: 'Blogs - Zomo',
            description: 'Create a new Zomo account.',
            keywords: 'register, signup, zomo'
        });
        break;  
        
        case '/contact-us':
        app.innerHTML = contact();
        setMeta({
            title: 'Contact Us - Zomo',
            description: 'Create a new Zomo account.',
            keywords: 'register, signup, zomo'
        });
        break;  

        case '/':
            app.innerHTML = home();  // render home page
            loadDishes();            // dynamically render featured restaurants
            setMeta({
                title: 'Home - Zomo',
                description: 'Zomo online food ordering platform.',
                keywords: 'zomo, food, delivery'
            });
            break;

        default:
            app.innerHTML = home();
            setMeta({
                title: 'Home - Zomo',
                description: 'Zomo online food ordering platform.',
                keywords: 'zomo, food, delivery'
            });
    }
}
