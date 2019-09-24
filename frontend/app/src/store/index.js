
import { randomColor, generateId, UPLOAD_URL, computeDeterminant, saveToFile, reverseTransposeMat4 } from '@//constants'
import { incompatibleBrowserText } from '@/text'
import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'
import { AGREE_COOKIE_KEY, openInNewWindow, getTransformMatrixInNm } from '@/constants';


import nonLinearStore from './nonLinearStore'
import linearStore from './linearStore'
import viewerPreferenceStore from './viewerPreferenceStore'
import undoStore from './undoStore'
import landmarksStore from './landmarksStore'
import dataSelectionStore from './dataSelectionStore'
import nehubaStore from './nehubaStore'
import getAuthStore from './authStore'

Vue.use(Vuex)

const ALLOW_UPLOAD = process.env.VUE_APP_ALLOW_UPLOAD

const getStore = ({ user = null } = {}) => new Vuex.Store({
  modules: {
    nonLinearStore,
    linearStore,
    viewerPreferenceStore,
    undoStore,
    landmarksStore,
    dataSelectionStore,
    nehubaStore,
    authStore: getAuthStore({ user })
  },
  state: {
    allowUpload: process.env.NODE_ENV !== 'production' || ALLOW_UPLOAD,
    production: process.env.NODE_ENV === 'production',

    agreedToCookie: localStorage.getItem(AGREE_COOKIE_KEY),

    landmarkControlVisible: false,

    _step2Mode: 'overlay',
    _step2OverlayFocus: 'reference',

    // in nm
    viewerMousePosition: [0, 0, 0],

    viewerSliceOrientation: [0, 0, 0, 1],
    viewerNavigationStateString: null,

    mouseoverUserlayer: null,


    corticalAlignmentVisible: false,

    backendURL: process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000/api',

  },
  mutations: {
    setLandmarkControlVisibility (state, { visible }) {
      state.landmarkControlVisible = visible
    },
    setProduction (state, { production }){
      state.production = production
    },
    setViewerNavigationStateString (state, string) {
      state.viewerNavigationStateString = string
    },
    setErrorMessage ( state, {}) {
      /**
       * TODO, UI feedback on error
       */
    },
    setCorticalAlignmentVisibility (state, { visible }) {
      state.corticalAlignmentVisible = visible
    },
    _setStep2Mode (state, { mode }) {
      state._step2Mode = mode
    },
    _setStep2OverlayFocus (state, {mode}) {
      state._step2OverlayFocus = mode
    },
    setViewerMousePosition (state, array) {
      state.viewerMousePosition = array
    },
    setViewerSliceOrientation (state, array) {
      state.viewerSliceOrientation = array
    },
    setMouseoverUserlayer (state, bool) {
      state.mouseoverUserlayer = bool
    },

  },
  actions: {
    log: function ({state}, payload) {
      if (!state.production) console.log(payload)
    },
    setLocalStorage: function (store, payload) {
      for (let key in payload) {
        localStorage.setItem(key, payload[key])
      }
    },
    loadXformJsonFile: function ({ dispatch, commit }, { json }) {
      /**
       * TODO check incoming/ref volume
       * TODO sanitize transformMatrixInNm. string? NaN?
       */
      try {
        const { transformMatrixInNm } = json
        const matrix = reverseTransposeMat4(transformMatrixInNm)

        dispatch('pushUndo', {
          name: 'load transform json file'
        })
        
        commit('nehubaStore/setIncTransformMatrix', {
          matrix
        })
      }catch(e) {
        dispatch('modalMessage', {
          title: `Loading JSON file error!`,
          variant: `danger`,
          body: `Converting matrix error, ${e.toString()}`
        })
      }
    },
    viewInInteractiveViewer: function ({ state, dispatch, getters }) {
      const { nehubaStore, viewerPreferenceStore } = state

      const { incTransformMatrix } =  nehubaStore
      const { incomingColor } = viewerPreferenceStore

      const selectedReferenceVolume = getters['dataSelectionStore/selectedReferenceVolume']
      const selectedIncomingVolume = getters['dataSelectionStore/selectedIncomingVolume']
      const incRotQuat = getters['nehubaStore/incRotQuat']
      const dim = getters['nehubaStore/dim']
      const fragmentShader = getters['viewerPreferenceStore/fragmentShader']

      const shader = fragmentShader
      const opacity = incomingColor[3]

      const { vec3, quat } = export_nehuba
      const translationFromCorner = vec3.fromValues(...dim)
      vec3.scale(translationFromCorner, translationFromCorner, 0.5)
      vec3.transformQuat(translationFromCorner, translationFromCorner, quat.invert(quat.create(), quat.fromValues(...incRotQuat)))

      const json = {
        selectedIncomingVolume,
        selectedReferenceVolume,
        incTransformMatrix,
        opacity,
        translationFromCorner: Array.from(translationFromCorner),
        shader
      }

      const host = process.env.VUE_APP_OVERWRITE_TRANSFORM_RESULT_HOST || ''
      axios.post(`${host}transformResult`, json)
        .then(({ data }) => {
          const { id, url } = data
          if (url) {
            openInNewWindow(url)
          } else {
            throw new Error('url not defined')
          }
        })
        .catch(e => dispatch('log', ['store#actions#viewInInteractiveViewer', { error: e }]))
    },
    downloadXformResult: function ({ state, getters }) {
      
      const { nehubaStore } = state
      const { incTransformMatrix } = nehubaStore

      const selectedIncomingVolume = getters['dataSelectionStore/selectedIncomingVolume']
      const selectedReferenceVolume = getters['dataSelectionStore/selectedReferenceVolume']
      
      const incomingVolume = (selectedIncomingVolume && selectedIncomingVolume.name) || 'Unknown incoming volume'
      const referenceVolume = (selectedReferenceVolume && selectedReferenceVolume.name) || 'Unknown reference volume'
      
      const transformMatrixInNm = getTransformMatrixInNm(incTransformMatrix)
      
      const json = {
        incomingVolume,
        referenceVolume,
        transformMatrixInNm
      }
      saveToFile(JSON.stringify(json, null, 2), 'application/json', 'transformMatrix.json')
    },
    modalMessage: function () {
      /**
       * required for subscribe action
       */
    },
    landmarkControlVisibilityChanged ({ commit }, { visible }) {
      commit('setLandmarkControlVisibility', { visible })
    },
    corticalAlignmentVisibilityChanged ({ commit }, { visible }) {
      commit('setCorticalAlignmentVisibility', { visible })
    },
    uploadVolume ({ dispatch }) {
      // dispatch('openModal', {modalId: 'uploadModal'})
    },
    openModal (store, { modalId }) {
      /**
       * required for subscribe action
       */
    },
    viewerSliceOrientationChanged ({ commit }, array) {
      /**
       * TODO probably should combine mutations into viewerNavigationStateChanged
       */
      commit('setViewerSliceOrientation', array)
    },
    mouseOverIncomingLayer ({ commit }) {
      commit('setMouseoverUserlayer', true)
    },
    mouseOutIncomingLayer ({ commit }) {
      commit('setMouseoverUserlayer', false)
    },
    viewerMousePositionChanged ({ commit }, array) {
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

    setPrimaryNehubaNavigation () {
      /**
       * required for subscribe action
       */
    },
    setSecondaryNehubaNavigation () {
      /**
       * required for subscribe action
       */
    },

    startFromScratch ({dispatch, state, commit}) {
      commit('landmarksStore/setReferenceLandmarks', { referenceLandmarks: [] })
      commit('landmarksStore/setIncomingLandmarks', { incomingLandmarks: [] })
      commit('landmarksStore/setLandmarkPairs', { landmarkPairs: [] })
      dispatch('dataSelectionStore/selectIncomingVolumeWithId', null)

      /**
       * TODO maybe move to undoStore? subscribe to root actions?
       */
      commit('undoStore/setUndoStack', { undoStack: [] })
      commit('undoStore/setRedoStack', { redoStack: [] })
      commit('landmarksStore/setLandmarkMode', { mode: false })
      commit('_setStep2Mode', { mode: 'overlay' })

      if (!state.nehubaStore.appendNehubaFlag) return
      const { mat4 } = window.export_nehuba
      const matrix = Array.from(mat4.create())
      commit('nehubaStore/setIncTransformMatrix', { matrix })
    }
  }
})

export default getStore