
import { saveToFile, reverseTransposeMat4, multiplyXforms, flattenMat, packMat4 } from '@//constants'
import Vuex from 'vuex'
import { AGREE_COOKIE_KEY, openInNewWindow, EXPORT_TRANSFORM_TYPE } from '@/constants';


import nonLinearStore from './nonLinearStore'
import linearStore from './linearStore'
import viewerPreferenceStore from './viewerPreferenceStore'
import undoStore from './undoStore'
import landmarksStore from './landmarksStore'
import dataSelectionStore from './dataSelectionStore'
import nehubaStore from './nehubaStore'
import getAuthStore from './authStore'

const ALLOW_UPLOAD = process.env.VUE_APP_ALLOW_UPLOAD

const getStore = ({ user = null, experimentalFeatures = {} } = {}) => new Vuex.Store({
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

    agreedToCookie: window && window.localStorage && window.localStorage.getItem(AGREE_COOKIE_KEY),

    landmarkControlVisible: false,

    _step2Mode: 'overlay',
    _step2OverlayFocus: 'reference',

    // in nm
    viewerMousePosition: [0, 0, 0],

    viewerSliceOrientation: [0, 0, 0, 1],
    viewerNavigationStateString: null,

    mouseoverUserlayer: null,

    experimentalFeatures,
    corticalAlignmentVisible: false,

    backendURL: process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000/api',

  },
  mutations: {
    sudoSetState (state, newState) {
      const keys = Object.keys(newState)
      for (const key of keys) {
        state[key] = newState[key]
      }
    },
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
        window && window.localStorage && window.localStorage.setItem(key, payload[key])
      }
    },
    loadXformJsonFile: function ({ dispatch, commit, getters }, { json }) {
      /**
       * TODO check incoming/ref volume
       * TODO sanitize transformMatrixInNm. string? NaN?
       */
      try {
        const { transformMatrixInNm, version, ['@type']: type } = json
        let matrix
        
        if (type && type !== EXPORT_TRANSFORM_TYPE) {
          throw new Error(`JSON is not a transform json file!`)
        }
        if (version >= 1) {
          const { mat4 } = window.export_nehuba
          const ngAffine = getters['dataSelectionStore/selectedIncomingVolumeNgAffine']
          const ngAffineMat = mat4.fromValues(...flattenMat(ngAffine))
          const xformMat = mat4.fromValues(...flattenMat(transformMatrixInNm))
          const out = mat4.mul(mat4.create(), ngAffineMat, xformMat)
          mat4.transpose(out, out)
          matrix = Array.from(out)
        } else {
          matrix = reverseTransposeMat4(transformMatrixInNm)
        }

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
    viewInSiibraExplorer: async function({ state, dispatch, getters }, payload){

      const { nehubaStore, viewerPreferenceStore } = state
      const { incTransformMatrix } =  nehubaStore

      const selectedReferenceVolume = getters['dataSelectionStore/selectedReferenceVolume']
      const incRotQuat = getters['nehubaStore/incRotQuat']
      const dim = getters['nehubaStore/dim']
      const { vec3, quat } = export_nehuba
      const translationFromCorner = vec3.fromValues(...dim)
      vec3.scale(translationFromCorner, translationFromCorner, 0.5)
      vec3.transformQuat(translationFromCorner, translationFromCorner, quat.invert(quat.create(), quat.fromValues(...incRotQuat)))

      const selectedIncomingVolumes = []
      for (const incVol of payload) {
        const { xforms, ...rest } = incVol
        selectedIncomingVolumes.push({
          ...rest,
          xform: await multiplyXforms(xforms)
        })
      }

      const json = {
        selectedReferenceVolume,
        selectedIncomingVolumes,

        incTransformMatrix,
        translationFromCorner: Array.from(translationFromCorner),
      }

      const ivHost = process.env.IV_HOST || 'https://atlases.ebrains.eu/viewer/#'
      let url = ivHost + selectedReferenceVolume.siibra_explorer_url

      const { origin, pathname } = window.location
      const pluginUrl = new URL(`${origin}${pathname.replace(/\/$/, '')}/viewerPlugin/template.html`)
      if (selectedIncomingVolumes.length !== 1) {
        throw new Error(`selectedIncomingVolumes needs to be exactly 1, but the supplid is ${selectedIncomingVolumes.length}`)
      }
      pluginUrl.searchParams.set("precomputed", selectedIncomingVolumes[0].imageSource)
      pluginUrl.searchParams.set(
        "transform", 
        [0,1,2].map(r => [0,1,2,3].map(c => incTransformMatrix[ c * 4 + r ])).reduce((acc, curr) => [...acc, ...curr], []).join(",")
      )

      const pluginUrlString = pluginUrl.toString()
      
      url += `?pl=${encodeURIComponent(JSON.stringify([pluginUrlString]))}`

      console.log(`Navigating to: ${url}`)

      openInNewWindow(url)

    },
    downloadXformResult: function ({ state, getters }) {
      
      const { nehubaStore } = state
      const { incTransformMatrix } = nehubaStore

      const selectedIncomingVolume = getters['dataSelectionStore/selectedIncomingVolume']
      const selectedReferenceVolume = getters['dataSelectionStore/selectedReferenceVolume']

      const incomingVolume = (selectedIncomingVolume && selectedIncomingVolume.name) || 'Unknown incoming volume'
      const referenceVolume = (selectedReferenceVolume && selectedReferenceVolume.name) || 'Unknown reference volume'
      
      const ngAffine = getters['dataSelectionStore/selectedIncomingVolumeNgAffine']
      const { mat4 } = window.export_nehuba
      const ngAffineMat4 = mat4.fromValues(
        ...ngAffine.reduce((acc, curr) => acc.concat(curr), [])
      )

      mat4.invert(ngAffineMat4, ngAffineMat4)
      const incXformMat4 = mat4.fromValues(...incTransformMatrix)
      mat4.transpose(incXformMat4, incXformMat4)
      const out = mat4.mul(
        mat4.create(),
        ngAffineMat4,
        incXformMat4
      )
      const transformMatrixInNm = packMat4(Array.from(out))

      const json = {
        incomingVolume,
        referenceVolume,
        version: 1,
        ['@type']: EXPORT_TRANSFORM_TYPE,
        transformMatrixInNm
      }
      saveToFile({
        data: JSON.stringify(json, null, 2),
        mimeType: 'application/json',
        filename: 'transformMatrix.json'
      })
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
    uploadVolume () {
      // dispatch('openModal', {modalId: 'uploadModal'})
    },
    openModal () {
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