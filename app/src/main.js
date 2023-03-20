// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

// Vuex
import router from './router'
import Vuex from 'vuex'
Vue.use(Vuex)
import getStore from './store'

import axios from 'axios'

import './dep'

import '!!file-loader?context=third_party&name=main.bundle.js!export-nehuba/dist/min/main.bundle.js'
import '!!file-loader?context=third_party&name=chunk_worker.bundle.js!export-nehuba/dist/min/chunk_worker.bundle.js'
import './assets/main.css'

Vue.config.productionTip = false

let experimentalFeatures = {}

try {
  experimentalFeatures = JSON.parse(process.env.VUE_APP_ENABLE_EXPERIMENTAL_FEATURES || '{}')
} catch (e) {
  // eslint-disable-next-line
  console.error(`process.env.VUE_APP_ENABLE_EXPERIMENTAL_FEATURES ${process.env.VUE_APP_ENABLE_EXPERIMENTAL_FEATURES} cannot be parsed a JSON dictionary`, e)
}


const initVue = ({user} = {}) => {
  const store = getStore({ user, experimentalFeatures })
  
  const vueApp = new Vue({
    router,
    store,
    render: h => h(App),
  }).$mount('#app')

  window.voluba = vueApp
  window.store = store
}

axios.get('user')
  .then(({data: user}) => {
    initVue({ user })
  })
  .catch(() => {
    initVue()
  })