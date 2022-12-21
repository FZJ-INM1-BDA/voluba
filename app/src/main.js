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
import '!!file-loader?context=third_party&name=draco.bundle.js!export-nehuba/dist/min/draco.bundle.js'
import '!!file-loader?context=third_party&name=async_computation.bundle.js!export-nehuba/dist/min/async_computation.bundle.js'

Vue.config.productionTip = false

let experimentalFeatures = {}

try {
  experimentalFeatures = JSON.parse(process.env.VUE_APP_ENABLE_EXPERIMENTAL_FEATURES || '{}')
} catch (e) {
  console.error(`process.env.VUE_APP_ENABLE_EXPERIMENTAL_FEATURES ${process.env.VUE_APP_ENABLE_EXPERIMENTAL_FEATURES} cannot be parsed a JSON dictionary`, e)
}

const initVue = ({user} = {}) => {
  new Vue({
    router,
    store: getStore({ user, experimentalFeatures }),
    render: h => h(App),
  }).$mount('#app')
}

axios.get('user')
  .then(({data: user}) => {
    initVue({ user })
  })
  .catch(e => {
    initVue()
  })