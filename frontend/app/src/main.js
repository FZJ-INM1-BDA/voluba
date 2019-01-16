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
import {  faMapMarkerAlt, faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle, faTimes, faTrashAlt, faThumbtack, faPlus, faFileUpload, faFileDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Vuex
import Vuex from 'vuex'

Vue.use(BootstrapVue)
Vue.use(Vuex)

library.add(faMapMarkerAlt, faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle, faTimes, faTrashAlt, faThumbtack, faPlus, faFileUpload, faFileDownload)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    referenceURLs: [
      { id: '1', text: 'BigBrain (2015)', value: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image' }
    ],
    templateURLs: [
      { id: '1', text: 'Nucleus subthalamicus (B20)', value: 'precomputed://https://neuroglancer-dev.humanbrainproject.org/precomputed/landmark-reg/B20_stn_l/v10' },
      { id: '2', text: 'Hippocampus unmasked', value: 'precomputed://https://neuroglancer-dev.humanbrainproject.org/precomputed/landmark-reg/hippocampus-unmasked' }
    ],
    transformationTypes: [
      { id: '1', text: 'Rigid', value: 'rigid' },
      { id: '2', text: 'Rigid (allow reflection)', value: 'rigid+reflection' },
      { id: '3', text: 'Similarity', value: 'similarity' },
      { id: '4', text: 'Similarity (allow reflection)', value: 'similarity+reflection' },
      { id: '5', text: 'Affine', value: 'affine' }
    ],

    /**
     * NYI. TODO, use reference url instead
     */
    selectReference: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image',

    selectTemplate: null,
    selectTransformation: 'rigid',
    selectedTransformationIndex: 0,

    steps: [
      'Data Selection & 3D Anchoring',
      'Entering Landmark-Pairs',
      'Save & Export Results'
    ],
    activeStepIndex: 0,
    sidebarCollapse: false,
    sidebarWidth: 350,
    referenceTemplate: null,
    incomingTemplate: null,
    incomingTransformMatrix: null,
    incomingScale: [1, 1, 1],
    incomingColor: [252, 200, 0, 0.5],

    defaultOverlayColor: '#FCDC00',
    // in nm
    viewerNavigationPosition: [0, 0, 0],
    viewerMousePosition: [0, 0, 0],
    viewerSliceOrientation: [0, 0, 0, 1],
    layers: null,
    mouseoverUserlayer: null,

    referenceLandmarks: [{
      id: 'uniqueIdRefLm1',
      name: 'Reference Point 1',
      coord: [
        12.282029,
        0.325772375,
        -9.724908
      ]
    }, {
      id: 'uniqueIdRefLm2',
      name: 'Reference Point 2',
      coord: [
        6.4210755,
        0.325772375,
        -16.609202
      ]
    }, {
      id: 'uniqueIdRefLm3',
      name: 'Reference Point 3',
      coord: [
        9.398068,
        -2.74425175,
        -14.748581
      ]
    }],

    incomingLandmarks: [{
      id: 'uniqueIdIncLm1',
      name: 'Incoming Point 1',
      coord: [
        11.087669,
        6.56,
        9.320814
      ]
    }, {
      id: 'uniqueIdIncLm2',
      name: 'Incoming Point 2',
      coord: [
        7.4451575,
        6.56,
        1.111573875
      ]
    }, {
      id: 'uniqueIdIncLm3',
      name: 'Incoming Point 3',
      coord: [
        8.505292,
        5.0921215,
        5.6511205
      ]
    }],

    pairs: [
      [0, 0],
      [1, 1],
      [2, 2]
    ]
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
    setIncomingTemplateRGBA (state, {color, opacity}) {
      const oldColor = state.incomingColor
      const oldRGB = [
        oldColor[0],
        oldColor[1],
        oldColor[2]
      ]
      const oldOpacity = oldColor[3]
      const newColor = [
        ...(color ? color : oldRGB),
        opacity ? opacity : oldOpacity
      ]
      state.incomingColor = newColor
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
    hideSidebar (state) {
      state.sidebarCollapse = true
    },
    showSidebar (state) {
      state.sidebarCollapse = false
    },
    selectMethodIndex (state, index) {
      state.selectedTransformationIndex = index
    },
    changeSidebarWidth (state, size) {
      state.sidebarWidth = size
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
    redrawNehuba () {
      /**
       * required for vuex event dispatch
       * used for nehuba to lsiten to layout changes
       */
    },
    nextStep ({state, commit}) {

    },
    previousStep ({state, commit}) {

    },
    selectStep ({commit}, index) {
      commit('selectStep', index)
    },
    toggleSidebar ({dispatch, commit, state}) {
      commit(state.sidebarCollapse
        ? 'showSidebar'
        : 'hideSidebar')
      setTimeout(() => dispatch('redrawNehuba'))
    },
    setSidebarCollapseState ({dispatch, commit}, bool) {
      commit(bool
        ? 'hideSidebar'
        : 'showSidebar')
      setTimeout(() => dispatch('redrawNehuba'))
    },
    changeSidebarWidth ({commit}, size) {
      commit('changeSidebarWidth', size)
    },
    selectMethodIndex (store, index) {
      store.commit('selectMethodIndex', index)
    },
    changeScale ({commit}, newScale) {
      commit('setIncomingTemplateScale', newScale)
    },
    changeOpacity ({commit}, opacity) {
      commit('setIncomingTemplateRGBA', { opacity })
    },
    changeOverlayColor ({commit}, newOverlayColor) {
      const color = [
        newOverlayColor.r,
        newOverlayColor.g,
        newOverlayColor.b
      ]
      commit('setIncomingTemplateRGBA', { color })
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
