import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Settings from '../views/Settings.vue';
import Keys from '../views/Keys.vue';
import Device from '../views/Device.vue';

// 1. Define your routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
  },
  {
    path: '/keys',
    name: 'Keys',
    component: Keys,
  },
  {
    path: '/device/:id',
    name: 'Device',
    component: Device,
    props: true,
  },
  {
    // Catch-all for 404s
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    props: { error: '404' },
    component: () => import('../views/NotFound.vue'), // Lazy load
  },
];

// 2. Create the router instance
const router = createRouter({
  // Use HTML5 History mode (removes the # from URLs)
  history: createWebHistory(),
  routes,
});

export default router;
