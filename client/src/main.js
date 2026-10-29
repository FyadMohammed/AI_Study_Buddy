// ─── ENTRY POINT ─────────────────────────────────────────────────────────────
// Boots the Vue app and installs the router.
// This is the only file that runs before anything is on screen.
// ─────────────────────────────────────────────────────────────────────────────

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App)
    .use(router)      // makes RouterLink / RouterView and useRoute() available everywhere
    .mount('#app')
