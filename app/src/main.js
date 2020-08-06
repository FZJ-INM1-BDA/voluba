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

Vue.config.productionTip = false

const initVue = ({user} = {}) => {
  new Vue({
    router,
    store: getStore({ user }),
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