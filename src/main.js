// chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueProgress from 'vue-progress'

import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueProgress)
Vue.use(VueAxios, axios)

Vue.config.productionTip = false

Vue.prototype.$eventHub = new Vue()

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
