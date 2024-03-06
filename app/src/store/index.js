
import { saveToFile, convertNmToVoxel, convertVoxelToNm, multiplyXforms, flattenMat } from '@//constants'
import Vuex from 'vuex'
import { AGREE_COOKIE_KEY, openInNewWindow, EXPORT_TRANSFORM_TYPE, _EXPORT_TRANSFORM_TYPE } from '@/constants';


import nonLinearStore from './nonLinearStore'
import linearStore from './linearStore'
import viewerPreferenceStore from './viewerPreferenceStore'
import undoStore from './undoStore'
import landmarksStore from './landmarksStore'
import dataSelectionStore from './dataSelectionStore'
import nehubaStore from './nehubaStore'
import getAuthStore from './authStore'

const ALLOW_UPLOAD = process.env.VUE_APP_ALLOW_UPLOAD

function deepEqual(arr1, arr2){
  if (typeof arr1 !== typeof arr2) {
    return false
  }
  switch (typeof arr1) {
    case "boolean":
    case "string":
    case "number":
    case "undefined":
    case "bigint": {
      return arr1 === arr2
    }
    case "object": { break }
    default: {
      throw new Error(`Cannot compare type ${typeof arr1}`)
    }
  }
  const arr1IsArray = Array.isArray(arr1)
  const arr2IsArray = Array.isArray(arr2)
  if (arr1IsArray !== arr2IsArray) {
    return false
  }
  if (arr1IsArray) {
    return arr1.every((item, idx) => deepEqual(item, arr2[idx]))
  }
  return Object.keys(arr1).every(key => deepEqual(arr1[key], arr2[key]))
}

export function getExportJson({ state, getters }){

  const { nehubaStore, dataSelectionStore } = state

  const { incTransformMatrix } = nehubaStore
  const { coordinateSpace } = dataSelectionStore

  const selectedIncomingVolume = getters['dataSelectionStore/selectedIncomingVolume']
  const selectedReferenceVolume = getters['dataSelectionStore/selectedReferenceVolume']

  const incomingVolume = (selectedIncomingVolume && selectedIncomingVolume.name) || 'Unknown incoming volume'
  const referenceVolume = (selectedReferenceVolume && selectedReferenceVolume.name) || 'Unknown reference volume'
  
  const contentHash = (() => {
    try {
      return selectedIncomingVolume['extra']['contentHash']
    } catch (e) {
      return null
    }
  })()
  const json = {
    incomingVolume,
    contentHash,
    referenceVolume,
    version: 1.02,
    ['@type']: EXPORT_TRANSFORM_TYPE,
    transform: incTransformMatrix,
    coordinateSpace
  }
  return json
}

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
    loadXformJsonFile: function ({ dispatch, commit, state }, { json }) {
      /**
       * TODO check incoming/ref volume
       * TODO sanitize transformMatrixInNm. string? NaN?
       */
      try {
        const { transformMatrixInNm, version, ['@type']: type, transform, coordinateSpace: jsonCoordinateSpace } = json
        let matrix
        if (type && type !== EXPORT_TRANSFORM_TYPE && type !== _EXPORT_TRANSFORM_TYPE) {
          throw new Error(`JSON is not a transform json file!`)
        }
        switch (version) {
          case 1:
          case 1.01: {
            const { mat4 } = window.export_nehuba
            const { dataSelectionStore } = state
            const { coordinateSpace } = dataSelectionStore
            const { x, y, z } = coordinateSpace

            const xformMat = mat4.fromValues(...flattenMat(transformMatrixInNm))
            mat4.transpose(xformMat, xformMat)
            matrix = Array.from(xformMat)
            dispatch('modalMessage', {
              title: `Earlier version of transform`,
              variant: `warning`,
              body: `You supplied a transform json with version number < v1.02. This version of transform is quite unstable, and is prone to breakage. Please consider generate newer versions.`
            })
            const [nx, ny, nz] = convertNmToVoxel(coordinateSpace, matrix.slice(12,15), "vec3")
            matrix[12] = nx
            matrix[13] = ny
            matrix[14] = nz
            break
          }
          case 1.02: {
            const { dataSelectionStore } = state
            const { coordinateSpace } = dataSelectionStore
            if (!deepEqual(coordinateSpace, jsonCoordinateSpace)) {

              dispatch('modalMessage', {
                title: `CoordinateSpace mismatch`,
                variant: `warn`,
                body: `Current coordinate space ${JSON.stringify(coordinateSpace)} does not match to that of transform file ${JSON.stringify(jsonCoordinateSpace)}`
              })
            }
            matrix = transform
            break
          }
          default: {
            throw new Error(`type with value ${version} cannot be parsed.`)
          }
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
    viewInSiibraExplorer: async function({ state, getters }, payload){

      const { nehubaStore, dataSelectionStore } = state
      const { incTransformMatrix } =  nehubaStore
      const { coordinateSpace } = dataSelectionStore

      const selectedReferenceVolume = getters['dataSelectionStore/selectedReferenceVolume']

      const ivHost = process.env.IV_HOST || 'https://atlases.ebrains.eu/viewer/#'
      let url = ivHost + selectedReferenceVolume.siibra_explorer_url

      const { origin, pathname } = window.location
      const pluginUrl = new URL(`${origin}${pathname.replace(/\/$/, '')}/viewerPlugin/template.html`)
      if (payload.length !== 1) {
        throw new Error(`payload needs to be exactly 1, but the supplid is ${payload.length}`)
      }
      pluginUrl.searchParams.set("precomputed", payload[0].imageSource)
      const output = [...incTransformMatrix]
      const nm = convertVoxelToNm(coordinateSpace, output.slice(12,15), "vec3")
      
      output[12] = nm[0]
      output[13] = nm[1]
      output[14] = nm[2]

      pluginUrl.searchParams.set(
        "transform", 
        [0,1,2].map(r => [0,1,2,3].map(c => output[ c * 4 + r ])).reduce((acc, curr) => [...acc, ...curr], []).join(",")
      )

      const pluginUrlString = pluginUrl.toString()
      
      url += `?pl=${encodeURIComponent(JSON.stringify([pluginUrlString]))}`

      console.log(`Navigating to: ${url}`)

      openInNewWindow(url)

    },
    downloadXformResult: function ({ state, getters }) {
      const json = getExportJson({ state, getters })
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