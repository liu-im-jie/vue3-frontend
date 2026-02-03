import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.css'
import 'virtual:uno.css'
import 'virtual:svg-icons-register'

import { setupRouter } from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

setupRouter(app)

app.mount('#app')
