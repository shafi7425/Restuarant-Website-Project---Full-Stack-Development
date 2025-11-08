import { render as loginPage, init as loginInit } from './pages/auth/login.js';
import { render as registerPage, init as registerInit } from './pages/auth/register.js';
import { home } from './pages/frontend/index.js';
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

        case '/':
            app.innerHTML = home();
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
