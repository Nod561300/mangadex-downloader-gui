import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import PrimeVue from 'primevue/config'
import theme from '@primevue/themes/lara'
import 'primevue/button/style'
import 'primevue/inputtext/style'
import 'primevue/dropdown/style'
import 'primevue/checkbox/style'
import { UI_LIBRARY } from './config/uiLibrary'
import { createPrimeVueTheme, PrimeVueThemePalette } from './utils/primevueTheme'

const app = createApp(App)
const defaultPrimeVuePalette: PrimeVueThemePalette = 'orange'

if (UI_LIBRARY === 'primevue') {
  const uiTheme = createPrimeVueTheme(theme, defaultPrimeVuePalette)
  app.use(PrimeVue, { theme: { preset: uiTheme } })
}

app.mount('#app')