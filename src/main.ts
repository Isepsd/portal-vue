import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// 🔹 Initialize Pinia BEFORE creating app
const pinia = createPinia()

// Create vue app
const app = createApp(App)

// 🔹 Register Pinia
app.use(pinia)

// Register plugins
registerPlugins(app)

// Mount vue app
app.mount('#app')
