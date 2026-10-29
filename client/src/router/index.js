// ─── ROUTER ──────────────────────────────────────────────────────────────────
// Maps URLs to pages.
//
// What it is:
//   A list of routes. Each one says "when the address bar shows this path,
//   render this component".
//
// What it is for:
//   Three separate screens that the user can navigate between, bookmark and
//   reload. /study/4 reopens topic 4 from the database — that only works
//   because the id is in the URL rather than hidden in a variable.
//
// What it talks to:
//   - main.js, which installs it with app.use(router)
//   - App.vue, whose <router-view /> is the hole the matched page fills
//   - the three page components
// ─────────────────────────────────────────────────────────────────────────────

import { createRouter, createWebHistory } from 'vue-router';

import HomePage    from '../pages/HomePage.vue';
import StudyPage   from '../pages/StudyPage.vue';
import HistoryPage from '../pages/HistoryPage.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage
    },
    {
        // ':id' is a parameter. /study/4 and /study/97 both match, and the
        // page reads the number from route.params.id.
        path: '/study/:id',
        name: 'study',
        component: StudyPage
    },
    {
        path: '/history',
        name: 'history',
        component: HistoryPage
    }
];

const router = createRouter({
    // Web history mode gives clean URLs (/history, not /#/history).
    history: createWebHistory(),
    routes
});

export default router;
