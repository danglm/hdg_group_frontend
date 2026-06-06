import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import LoginView from "@/components/auth/LoginView.vue";
import Dashboard from "@/views/dashboard/Dashboard.vue";
import NotFound from "@/views/error/NotFound.vue";

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { requiresAuth: false }
    },
    {
        path: '/',
        name: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true },
        children: []
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: NotFound
    }
]

import { authService } from "@/api/auth";

const router = createRouter({
    history: createWebHistory(), // Using HTML5 History Mode
    routes
})

// router.beforeEach((to, from, next) => {
//     const isAuthenticated = authService.isAuthenticated();

//     if (to.meta.requiresAuth && !isAuthenticated) {
//         next({ name: 'login' });
//     } else if (to.name === 'login' && isAuthenticated) {
//         next({ name: 'dashboard' });
//     } else {
//         next();
//     }
// });

export default router