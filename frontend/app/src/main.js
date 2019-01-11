// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

// Bootstrap
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Vuex
import Vuex from 'vuex'

Vue.use(BootstrapVue)
Vue.use(Vuex)

library.add(faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    steps: [
      "Data Selection & 3D Anchoring",
      "Entering Landmark-Pairs",
      "Save & Export Results"
    ],
    activeStepIndex: 0,
    sidebarCollapse: false,
    referenceTemplate: null,
    incomingTemplate: null,
    incomingTransformMatrix: null,
    incomingScale: [1, 1, 1],
    // in nm
    viewerNavigationPosition: [0, 0, 0],
    viewerMousePosition: [0, 0, 0],
    viewerSliceOrientation: [0, 0, 0, 1],
    layers: null,
    mouseoverUserlayer: null
  },
  mutations: {
    selectReferenceTemplate (state, refTemplate) {
      state.referenceTemplate = refTemplate
    },
    selectIncomingTemplate (state, incomingTemplate) {
      state.incomingTemplate = incomingTemplate
    },
    setIncomingTransformMatrix (state, array) {
      state.incomingTransformMatrix = array
    },
    setViewerNavigationPosition (state, array) {
      state.viewerNavigationPosition = array
    },
    setViewerMousePosition (state, array) {
      state.viewerMousePosition = array
    },
    setViewerSliceOrientation (state, array) {
      state.viewerSliceOrientation = array
    },
    setIncomingTemplateScale (state, array) {
      state.incomingScale = array
    },
    setLayers (state, obj) {
      state.layers = obj
    },
    setMouseoverUserlayer (state, bool) {
      state.mouseoverUserlayer = bool
    },
    selectStep (state, index) {
      state.activeStepIndex = index
    },
    toggleSidebar (state) {
      state.sidebarCollapse = !state.sidebarCollapse
    }
  },
  actions: {
    viewerSliceOrientationChanged ({commit}, array) {
      commit('setViewerSliceOrientation', array)
    },
    incomingTransformMatrixChanged ({commit}, array) {
      commit('setIncomingTransformMatrix', array)
    },
    mouseOverIncmoingLayer ({commit}) {
      commit('setMouseoverUserlayer', true)
    },
    mouseOutIncomingLayer ({commit}) {
      commit('setMouseoverUserlayer', false)
    },
    viewerNavigationPositionChanged ({commit}, array) {
      commit('setViewerNavigationPosition', array)
    },
    viewerMousePositionChanged ({commit}, array) {
      commit('setViewerMousePosition', array)
    },
    alignReference () {
      /**
       * required for vuex event dispatch
       */
    },
    alignIncoming () {
      /**
       * required for vuex event dispatch
       */
    },
    nextStep ({state, commit}) {

    },
    previousStep ({state, commit}) {

    },
    selectStep ({commit}, index) {
      commit('selectStep', index)
    },
    toggleSidebar ({commit}) {
      commit('toggleSidebar')
    }
  }
})

/* eslint-disable no-new */
new Vue({
  store,
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
