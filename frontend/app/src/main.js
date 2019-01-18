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
import { faTimesCircle, faSearch, faEyeSlash, faMapMarkerAlt, faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle, faTimes, faTrashAlt, faThumbtack, faPlus, faFileUpload, faFileDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { randomColor, generateId } from '@/components/constants'

// Vuex
import Vuex from 'vuex'

Vue.use(BootstrapVue)
Vue.use(Vuex)

library.add(faTimesCircle, faSearch, faEyeSlash, faMapMarkerAlt, faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle, faTimes, faTrashAlt, faThumbtack, faPlus, faFileUpload, faFileDownload)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    referenceURLs: [
      {
        id: '1',
        text: 'BigBrain (2015)',
        value: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image'
      }
    ],
    referenceTemplateTransform: null,

    selectedIncomingVolumeIndex: null,
    incomingVolumes: [
      {
        id: 'inc-1',
        text: 'Nucleus subthalamicus (B20)',
        // value: 'precomputed://http://imedv02.ime.kfa-juelich.de:8287/precomputed/B20_stn_l/v10'
        value: 'precomputed://https://neuroglancer-dev.humanbrainproject.org/precomputed/landmark-reg/B20_stn_l/v10'
      },
      {
        id: 'inc-2',
        text: 'Hippocampus unmasked',
        value: 'precomputed://https://neuroglancer-dev.humanbrainproject.org/precomputed/landmark-reg/hippocampus-unmasked'
      }
    ],

    selectedTransformationIndex: 0,
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
    mouseoverUserlayer: null,

    referenceLandmarks: [],
    incomingLandmarks: [],
    landmarkPairs: [],

    synchronizeZoom: false,
    synchronizeCursor: false,
    previewMode: false,
    backendURL: 'http://localhost:5000/api',
    landmarkTransformationMatrix: null,
    landmarkInverseMatrix: null,
    landmarkDeterminant: null,
    landmarkRMSE: null
  },
  mutations: {
    selectReferenceTemplate (state, refTemplate) {
      state.referenceTemplate = refTemplate
    },
    setReferenceTemplateTransform (state, {transform}) {
      state.referenceTemplateTransform = transform
    },
    selectIncomingVolume (state, index) {
      state.selectedIncomingVolumeIndex = index
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
    },
    enableSynchronizeZoom (state, synchronizeZoom) {
      state.synchronizeZoom = synchronizeZoom
    },
    enableSynchronizeCursor (state, synchronizeCursor) {
      state.synchronizeCursor = synchronizeCursor
    },
    enablePreviewMode (state, previewMode) {
      state.previewMode = previewMode
    },
    changeLandmarkTransformationMatrix (state, transformationMatrix) {
      state.landmarkTransformationMatrix = transformationMatrix
    },
    changeLandmarkInverseMatrix (state, inverseMatrix) {
      state.landmarkInverseMatrix = inverseMatrix
    },
    changeLandmarkDeterminant (state, determinant) {
      state.landmarkDeterminant = determinant
    },
    changeLandmarkRMSE (state, newRMSE) {
      state.landmarkRMSE = newRMSE
    },
    commitReferenceLandmark (state, { newReferenceLandmark }) {
      state.referenceLandmarks.push(newReferenceLandmark)
    },
    removeReferenceLandmark (state, { id }) {
      for (var i = 0; i < state.referenceLandmarks.length; i++) {
        var landmark_pair = state.referenceLandmarks[i]
        if (landmark_pair.id == id) {
          state.referenceLandmarks.splice(i, 1)
          break
        }
      }
    },
    commitReferenceLandmarks (state, { newReferenceLandmarks }) {
      state.referenceLandmarks = newReferenceLandmarks
    },
    removeReferenceLandmarks (state) {
      state.referenceLandmarks = []
    },
    commitIncomingLandmark (state, { newIncomingLandmark }) {
      state.incomingLandmarks.push(newIncomingLandmark)
    },
    removeIncomingLandmark (state, { id }) {
      for (var i = 0; i < state.incomingLandmarks.length; i++) {
        var landmark_pair = state.incomingLandmarks[i]
        if (landmark_pair.id == id) {
          state.incomingLandmarks.splice(i, 1)
          break
        }
      }
    },
    commitIncomingLandmarks (state, { newIncomingLandmarks }) {
      state.incomingLandmarks = newIncomingLandmarks
    },
    removeIncomingLandmarks (state) {
      state.incomingLandmarks = []
    },
    commitLandmarkPair (state, { newLandmarkPair }) {
      state.landmarkPairs.push(newLandmarkPair)
    },
    removeLandmarkPair (state, { id }) {
      for (var i = 0; i < state.landmarkPairs.length; i++) {
        var landmark_pair = state.landmarkPairs[i]
        if (landmark_pair.id == id) {
          state.landmarkPairs.splice(i, 1)
          break
        }
      }
    },
    commitLandmarkPairs (state, { newLandmarkPairs }) {
      state.landmarkPairs = newLandmarkPairs
    },
    removeLandmarkPairs (state) {
      state.landmarkPairs = []
    },
    enableLandmarkPairs (state, { enable }) {
      for (var i = 0; i < state.landmarkPairs.length; i++) {
        var landmarkPair = state.landmarkPairs[i]
        landmarkPair.active = enable
      }
    },
    setLandmarkPairVisibility (state, {id, visibility}) {
      const pair = state.landmarkPairs.find(pair => pair.id === id)
      pair.visible = visibility
    },
    setLandmarkPairActive (state, {id, active}) {
      const pair = state.landmarkPairs.find(pair => pair.id === id)
      pair.active = active
    }
  },
  actions: {
    selectIncomingVolume ({commit, state}, id) {
      const index = id === null
        ? null
        : state.incomingVolumes.findIndex(v => v.id === id)
      commit('selectIncomingVolume', index)
    },
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
    },
    enableSynchronizeZoom ({commit}, synchronizeZoom) {
      commit('enableSynchronizeZoom', synchronizeZoom)
    },
    enableSynchronizeCursor ({commit}, synchronizeCursor) {
      commit('enableSynchronizeCursor', synchronizeCursor)
    },
    enablePreviewMode ({commit}, previewMode) {
      commit('enablePreviewMode', previewMode)
      commit(previewMode
        ? 'hideSidebar'
        : 'showSidebar')
    },
    changeLandmarkTransformationMatrix ({commit}, transformationMatrix) {
      commit('changeLandmarkTransformationMatrix', transformationMatrix)
    },
    changeLandmarkInverseMatrix ({commit}, inverseMatrix) {
      commit('changeLandmarkInverseMatrix', inverseMatrix)
    },
    changeLandmarkDeterminant ({commit}, determinant) {
      commit('changeLandmarkDeterminant', determinant)
    },
    changeLandmarkRMSE ({commit}, newRMSE) {
      commit('changeLandmarkRMSE', newRMSE)
    },
    addLandmarkPair ({commit, state}) {
      var refId = generateId(state.referenceLandmarks).toString()
      var newReferenceLandmark = {
        id: refId,
        name: refId,
        coord: [0,0,0]
      }
      var incId = generateId(state.incomingLandmarks).toString()
      var newIncomingLandmark = {
        id: incId,
        name: incId,
        coord: [0,0,0]
      }
      var lpId = generateId(state.landmarkPairs).toString()
      var newLandmarkPair = {
        id: lpId,
        refId: refId,
        incId: incId,
        color: randomColor(),
        name: lpId,
        active: true,
        visible: true
      }

      commit('commitReferenceLandmark', { newReferenceLandmark })
      commit('commitIncomingLandmark', { newIncomingLandmark })
      commit('commitLandmarkPair', { newLandmarkPair })
    },
    removeReferenceLandmark ({commit, state}, {id}) {
      commit('removeReferenceLandmark', { id })
    },
    removeIncomingLandmark ({commit, state}, {id}) {
      commit('removeIncomingLandmark', { id })
    },
    removeLandmarkPair ({commit, state}, {id}) {
      commit('removeLandmarkPair', { id })
    },
    removeLandmarkPairs ({commit, state}) {
      commit('removeReferenceLandmarks')
      commit('removeIncomingLandmarks')
      commit('removeLandmarkPairs')
    },
    enableLandmarkPairs ({commit, state}, {enable}) {
      commit('enableLandmarkPairs', { enable })
    },
    toggleLandmarkPairVisibility ({commit, state}, {id}) {
      const landmarkPair = state.landmarkPairs.find(pair => pair.id === id)
      if (landmarkPair) {
        commit('setLandmarkPairVisibility', {
          id,
          visibility: !landmarkPair.visible
        })
      }
    },
    toggleLandmarkPairActive ({commit, state}, {id}) {
      const landmarkPair = state.landmarkPairs.find(pair => pair.id === id)
      if (landmarkPair) {
        commit('setLandmarkPairActive', {
          id,
          active: !landmarkPair.active
        })
      }
    },
    loadOldJson ({commit, state}, {json, config}) {
      const { fixCenterTranslation } = config
      const arrayMat4 = state.referenceTemplateTransform
        ? state.referenceTemplateTransform.flatMap((arr, i) => arr.map((v, idx) => (i === 3 || idx !== 3) ? v : v / 1e6))
        : null
      const transformRef = (coord) => {
        if (fixCenterTranslation && arrayMat4) {
          const { mat4, vec3 } = window.export_nehuba
          const oldCoord = vec3.fromValues(...coord)
          const transformMat4 = mat4.fromValues(...arrayMat4)
          mat4.transpose(transformMat4, transformMat4)
          vec3.transformMat4(oldCoord, oldCoord, transformMat4)
          return Array.from(oldCoord)
        } else {
          return coord
        }
      }
      const newReferenceLandmarks = json.map(pair => {
        return {
          id: `${pair.name}_ref`,
          name: `${pair.name}`,
          coord: transformRef(pair.target_point)
        }
      })
      const newIncomingLandmarks = json.map(pair => {
        return {
          id: `${pair.name}_inc`,
          name: `${pair.name}`,
          coord: pair.source_point
        }
      })
      const newLandmarkPairs = json.map(pair => {
        return {
          id: `${pair.name}_pair`,
          refId: `${pair.name}_ref`,
          incId: `${pair.name}_inc`,
          color: pair.colour,
          name: pair.name,
          active: true,
          visible: true
        }
      })

      commit('commitReferenceLandmarks', { newReferenceLandmarks })
      commit('commitIncomingLandmarks', { newIncomingLandmarks })
      commit('commitLandmarkPairs', { newLandmarkPairs })
    },
    // eslint-disable-next-llne
    focusLandmarkPair ({commit, state}, {id}) {
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
