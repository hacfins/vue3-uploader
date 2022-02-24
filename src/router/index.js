import {createRouter, createWebHistory, createWebHashHistory} from 'vue-router'
const uploader = () => import(/* webpackChunkName: "index-main" */ '@/pages/uploader/children/uploader')
const routes = [
    {
        path     : '/',
        component: uploader,
        name     : ''
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes: routes
});


export default router;

