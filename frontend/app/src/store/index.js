
import { UPLOAD_URL, computeDeterminant, saveToFile } from '@//constants'
import { incompatibleBrowserText } from '@/text'
import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'
import { AGREE_COOKIE_KEY, DEFAULT_BUNDLED_INCOMING_VOLUMES_0, DEFAULT_BUNDLED_INCOMING_VOLUMES_1, processImageMetaData, openInNewWindow, getShader } from '@/constants';
import { getBackendLandmarkPairs } from '../constants';

import nonLinear from './nonLinear'
import viewerStore from './viewerStore'
import undoStore from './undoStore'
import landmarksStore from './landmarksStore'

Vue.use(Vuex)

let errorTimeoutId = null

const browserCompatible = () => 'WebGL2RenderingContext' in window

const appendNehuba = () => new Promise((resolve, reject) => {
  if (!browserCompatible()) {
    return reject('browser not compatible')
  }
  
  if ('export_nehuba' in window) {
    resolve()
  } else {
    
    /**
     * TODO need to check browser compatibility
     */

    const el = document.createElement('script')
    el.src = 'main.bundle.js'
    el.onload = () => {
      /**
       * patching nehuba/neuroglancer default behaviour of altering hash
       */
      const { UrlHashBinding } = window['export_nehuba'].getNgPatchableObj()
      UrlHashBinding.prototype.setUrlHash = () => {
        // console.log('seturl hash')
        // console.log('setting url hash')
      }
      UrlHashBinding.prototype.updateFromUrlHash = () => {
        // console.log('update hash binding')
      }
      /* TODO find a more permanent fix to disable double click */
      // LayerManager.prototype.invokeAction = (arg) => {
      //   const region = this.regionsLabelIndexMap.get(this.mouseOverSegment)
      //   if (arg === 'select' && region) {
      //     this.regionSelectionEmitter.emit(region)
      //   }
      // }

      resolve()
    }
    el.onerror = reject
    document.head.appendChild(el)
  }
})

const getMirrorMat = (flippedState, dim) => {
  if (! ('export_nehuba' in window))
    return null
  const { vec3, mat4 } = window.export_nehuba
  
  const applyMirror = mat4.create()
  const mirrorVec = vec3.fromValues(...flippedState)

  /**
   * apply mirror
   */
  mat4.fromScaling(applyMirror, mirrorVec)
  /**
   * undo translation
   */
  const undoTranslVec = vec3.fromValues(...flippedState.map(v => v < 0 ? v : 0))
  vec3.mul(undoTranslVec, undoTranslVec, dim)
  mat4.mul(applyMirror, applyMirror, mat4.fromTranslation(mat4.create(), undoTranslVec))

  return {
    applyMirror,
    undoMirror: mat4.invert(mat4.create(), applyMirror)
  }
}

const DEFAULT_BUNDLED_INCOMING_VOLUMES = process.env.NODE_ENV === 'production'
  ? DEFAULT_BUNDLED_INCOMING_VOLUMES_0
  : DEFAULT_BUNDLED_INCOMING_VOLUMES_0.concat(DEFAULT_BUNDLED_INCOMING_VOLUMES_1)

const ALLOW_UPLOAD = process.env.VUE_APP_ALLOW_UPLOAD

const getStore = ({ user = null } = {}) => new Vuex.Store({
  modules: {
    nonLinear,
    viewerStore,
    undoStore,
    landmarksStore
  },
  state: {
    allowUpload: process.env.NODE_ENV !== 'production' || ALLOW_UPLOAD,
    production: process.env.NODE_ENV === 'production',

    uploadUrl: UPLOAD_URL,

    user,
    pairLandmarkStartDragging: false,
    agreedToCookie: localStorage.getItem(AGREE_COOKIE_KEY),

    landmarkControlVisible: false,

    flippedState: [1, 1, 1],

    /**
     * default: false
     * successful append: true
     * error: falsy non-false value (e.g. 0, -1 etc)
     */
    appendNehubaFlag: false,

    selectReferenceVolumeIdx: null,
    selectedReferenceVolumeId: 'ref-1',
    referenceVolumes: [
      {
        id: 'ref-1',
        name: 'BigBrain (2015)',
        imageSource: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image'
      }
    ],
    referenceTemplateTransform: null,

    selectedIncomingVolumeId: null,
    incomingVolumes: DEFAULT_BUNDLED_INCOMING_VOLUMES,

    selectedTransformationIndex: 0,
    transformationTypes: [
      { id: '1', text: 'Rigid', value: 'rigid' },
      { id: '2', text: 'Rigid (allow reflection)', value: 'rigid+reflection' },
      { id: '3', text: 'Similarity', value: 'similarity' },
      { id: '4', text: 'Similarity (allow reflection)', value: 'similarity+reflection' },
      { id: '5', text: 'Affine', value: 'affine' }
    ],

    _step2Mode: 'overlay',
    _step2OverlayFocus: 'reference',

    referenceTemplate: null,
    incomingTemplate: null,
    incomingColor: [252, 200, 0, 0.5],
    incomingVolumeSelected: false,

    /**
     * in nm
     */
    incTransformMatrix: [
      1.0,  0,    0,    0,
      0,    1.0,  0,    0,
      0,    0,    1.0,  0,
      0,    0,    0,    1.0
    ],

    incVolTranslationLock: false,
    incVolRotationLock: false,
    incVolScaleLock: false,

    overlayColor: {hex: '#FCDC00', rgba: {r: 252, g: 220, b: 0, a: 1}},
    // in nm
    primaryNehubaNavigationPosition: [0, 0, 0],
    secondaryNehubaNavigationPosition: [0, 0, 0],
    viewerMousePosition: [0, 0, 0],

    viewerSliceOrientation: [0, 0, 0, 1],
    viewerNavigationStateString: null,

    mouseoverUserlayer: null,


    corticalAlignmentVisible: false,

    backendURL: process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000/api',

    backendQueryInProgress: false,
    backendQueryError: null,
    /**
     * response from landmark-reg server
     */
    landmarkTransformationMatrix: null,
    landmarkInverseMatrix: null,
    landmarkDeterminant: null,
    landmarkRMSE: null
  },
  mutations: {
    setLandmarkControlVisibility (state, { visible }) {
      state.landmarkControlVisible = visible
    },
    setProduction (state, { production }){
      state.production = production
    },
    setUploadUrl (state, { uploadUrl }) {
      state.uploadUrl = uploadUrl
    },
    setViewerNavigationStateString (state, string) {
      state.viewerNavigationStateString = string
    },
    setAppendNehubaFlag ( state, { flag }) {
      state.appendNehubaFlag = flag
    },
    setErrorMessage ( state, {}) {
      /**
       * TODO, UI feedback on error
       */
    },
    setFlippedState (state, { flippedState }) {
      state.flippedState = flippedState
    },
    setPairLandmarkStartDragging (state, { pairLandmarkStartDragging }){
      state.pairLandmarkStartDragging = pairLandmarkStartDragging
    },
    setIncVolLoc (state, { incVolTranslationLock, incVolRotationLock, incVolScaleLock }) {
      state.incVolRotationLock = incVolRotationLock
      state.incVolTranslationLock = incVolTranslationLock
      state.incVolScaleLock = incVolScaleLock
    },
    setUser (state, { user }) {
      state.user = user
    },
    setBackendQueryInProgress (state, { backendQueryInProgress }) {
      state.backendQueryInProgress = backendQueryInProgress
    },
    setBackendQueryError (state, { error }) {
      state.backendQueryError = error

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
    setIncomingVolumes (state, { volumes }) {
      state.incomingVolumes = volumes
    },
    setReferenceTemplateTransform (state, { transform }) {
      state.referenceTemplateTransform = transform
    },
    setSelectedReferenceVolumeWithId (state, id) {
      state.selectedReferenceVolumeId = id
    },
    setSelectedIncomingVolumeId (state, id) {
      state.selectedIncomingVolumeId = id
    },
    setPrimaryNehubaNavigationPosition (state, array) {
      state.primaryNehubaNavigationPosition = array
    },
    setSecondaryNehubaNavigationPosition (state, array) {
      state.secondaryNehubaNavigationPosition = array
    },
    setViewerMousePosition (state, array) {
      state.viewerMousePosition = array
    },
    setViewerSliceOrientation (state, array) {
      state.viewerSliceOrientation = array
    },
    setIncomingVolumeHighlighted (state, bool) {
      state.incomingVolumeSelected = bool
    },
    setIncomingTemplateRGBA (state, { color, opacity }) {
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
    selectMethodIndex (state, index) {
      state.selectedTransformationIndex = index
    },
    updateOverlayColor (state, newOverlayColor) {
      state.overlayColor = newOverlayColor
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


    setIncTransformMatrix (state, { matrix}) {
      state.incTransformMatrix = matrix
    },
    multiplyIncTransmMatrix (state, matrix) {
      // catch when matrix is null (happens occationally?)
      if (!matrix)
        return
      const { mat4, quat, vec3 } = window.export_nehuba
      const incM = mat4.fromValues(...state.incTransformMatrix)
      const mulM = mat4.fromValues(...matrix)
      mat4.mul(incM, incM, mulM)
      const det = mat4.determinant(incM)

      state.incTransformMatrix = Array.from(incM)
    },
  },
  actions: {
    log: function ({state}, payload) {
      if (!state.production)
        console.log(payload)
    },
    setLocalStorage: function (store, payload) {
      for (let key in payload) {
        localStorage.setItem(key, payload[key])
      }
    },
    viewInInteractiveViewer: function ({ state, dispatch, getters }) {
      const { selectedIncomingVolume, selectedReferenceVolume } = getters
      const { incTransformMatrix, incomingColor } = state
      const shader = getShader(incomingColor.map(v => v / 255))
      const opacity = incomingColor[3]

      const { vec3, quat } = export_nehuba
      const translationFromCorner = vec3.fromValues(...getters.dim)
      vec3.scale(translationFromCorner, translationFromCorner, 0.5)
      vec3.transformQuat(translationFromCorner, translationFromCorner, quat.invert(quat.create(), quat.fromValues(...getters.incRotQuat)))

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
      const {selectedIncomingVolume, selectedReferenceVolume } = getters
      const incomingVolume = selectedIncomingVolume && selectedIncomingVolume.name
      const referenceVolume = selectedReferenceVolume && selectedReferenceVolume.name
      
      const transformMatrixInNm = getTransformMatrixInNm(state.incTransformMatrix)
      
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
    appendNehuba: function ({ commit, dispatch }) {
      appendNehuba()
        .then(() => commit('setAppendNehubaFlag', {flag: true}))
        .catch(e => {
          commit('setAppendNehubaFlag', {flag: 0})
          dispatch('modalMessage', { title: 'Incompatible browser', body: incompatibleBrowserText, variant: 'danger' })
        })
    },
    lockIncVol: function ({ commit, state }, { incVolTranslationLock = null, incVolRotationLock = null, incVolScaleLock = null }) {
      commit('setIncVolLoc', {
        incVolTranslationLock : incVolTranslationLock !== null ? incVolTranslationLock : state.incVolTranslationLock,
        incVolRotationLock: incVolRotationLock !== null ? incVolRotationLock : state.incVolRotationLock,
        incVolScaleLock: incVolScaleLock !== null ? incVolScaleLock : state.incVolScaleLock
      })
    },
    applyCalculatedTransform ({ commit, state }) {

      const { mat4 } = window.export_nehuba

      const inverseM = state.landmarkInverseMatrix
      const flattenedMatrix = inverseM.flatMap((arr, arrI) => arr.map((v, elIdx) => elIdx === 3 && arrI !== 3 ? v * 1e6 : v ))
      const transposedM = mat4.transpose(mat4.create(), mat4.fromValues(...flattenedMatrix))

      const matrix = Array.from(transposedM)
      commit('setIncTransformMatrix', { matrix })
    },
    computeXform ({ commit, state, dispatch }) {
      const { landmarksStore } = state
      const { landmarkPairs } = landmarksStore
      if (landmarkPairs.length < 3) {
        return
      }
      
      if (state.backendQueryInProgress) {
        return
      }

      const lmPairs = getBackendLandmarkPairs(landmarksStore)
      
      const data = {
        'source_image': state.selectReference, // TODO update
        'target_image': state.selectTemplate, // TODO update
        'transformation_type': state.transformationTypes[state.selectedTransformationIndex].value,
        'landmark_pairs': lmPairs
      }

      commit('setBackendQueryInProgress', { backendQueryInProgress : true })
      if (errorTimeoutId) clearTimeout(errorTimeoutId)
      commit('setBackendQueryError', { error: null })

      dispatch('log', ['sending data to backend...', {data}])
      axios.post(state.backendURL + '/least-squares', data)
        .then(response => {
          /**
           * TODO catch error
           */
          const { transformation_matrix: transformationMatrix, inverse_matrix: inverseMatrix, RMSE } = response.data
          dispatch('computeTransformResponseReceived', {
            transformationMatrix,
            inverseMatrix,
            RMSE,
            determinant: computeDeterminant(transformationMatrix)
          })

          dispatch('pushUndo', { name: 'apply calculated transform' })
          commit('setBackendQueryInProgress', { backendQueryInProgress : false})
          dispatch('applyCalculatedTransform')          
        }, error => {
          commit('setBackendQueryInProgress', { backendQueryInProgress : false})
          commit('setBackendQueryError', { error })
          errorTimeoutId = setTimeout(() => commit('setBackendQueryError', { error: null }), 5000)
        })
    },
    landmarkControlVisibilityChanged ({ commit }, { visible }) {
      commit('setLandmarkControlVisibility', { visible })
    },
    corticalAlignmentVisibilityChanged ({ commit }, { visible }) {
      commit('setCorticalAlignmentVisibility', { visible })
    },
    deleteIncomingVolume ({ state, dispatch, getters, commit }, { id, incomingVolume}) {
      /**
       * TODO
       * check endpoint still valid
       */
      const config = {
          method: 'DELETE',
          headers: {
            ...getters.authHeader
          }
        }
      
      const { payload } = incomingVolume
      const link = payload && payload.links && payload.links.normalized
      dispatch('log', ['store#actions#deleteIncomingVolume', { config, id, incomingVolume, link }])
      if (!link) {
        /**
         * link does not exist, return
         */
        return
      }
      axios(`${state.uploadUrl}${link}`, config)
        .then(res => {
          /**
           * successful delete
           */
          
          /**
           * deselect incoming volume id
           */
          commit('setSelectedIncomingVolumeId', null)

          dispatch('updateIncVolumes', {
            message: `Delete incoming volume complete.`
          })
        }).catch(error => {
          /**
           * error during delete (?)
           */
          dispatch('updateIncVolumes', {
            error,
            message: `Delete incoming volume error: ${error}`
          })
        })
    },
    updateIncVolumesResult (store, {error, message}) {
      /**
       * required for subscribe action
       */
    },
    updateIncVolumes ({ commit, state, dispatch, getters }, {error, message} = {error:null, message: null}) {
      const config = {
        headers: {
          ...getters.authHeader
        }
      }
      axios(`${state.uploadUrl}/list`, config)
        .then(({data}) => {
          const volumes = data
            .map(raw => {
              return {
                ...raw,
                uploadUrl: state.uploadUrl
              }
            })
            .map(processImageMetaData)
          const newVolumes = DEFAULT_BUNDLED_INCOMING_VOLUMES.concat(volumes)
          
          dispatch('log', ['updateIncVolumes#axios#postprocess', newVolumes])
          
          commit('setIncomingVolumes', {volumes: newVolumes})
          dispatch('updateIncVolumesResult', {
            error: error ? error : null,
            message: message ? message : 'Incoming volumes updated'
          })
        })
        .catch(e => {
          dispatch('updateIncVolumesResult', {
            error: error ? error : e,
            message: error ? message : 'GET /list error'
          })
          /**
           * should the available inc volumes be re-updated?
           */
        })
    },
    uploadVolume ({ dispatch }) {
      // dispatch('openModal', {modalId: 'uploadModal'})
    },
    loadLandmarks ({ dispatch }) {
      dispatch('openModal', {modalId: 'loadLandmarkPairsModal'})
    },
    saveLandmarks ({ state, dispatch }) {
      const { referenceVolumes, selectedReferenceVolumeId, incomingVolumes, selectedIncomingVolumeId } = state
      const refVol = referenceVolumes.find(v => v.id === selectedReferenceVolumeId)
      const incVol = incomingVolumes.find(v => v.id === selectedIncomingVolumeId)

      const data = {
        reference_volume: (refVol && refVol.name) || 'Untitled Reference Volume',
        incoming_volume: (incVol && incVol.name) || 'Untitled Incoming Volume',
        reference_landmarks: state.referenceLandmarks,
        incoming_landmarks: state.incomingLandmarks,
        landmark_pairs: state.landmarkPairs
      }
      dispatch('log', ['store#actions#saveLandMarks', { data }])
      const jsonData = JSON.stringify(data, null, 2)
      saveToFile(jsonData, 'application/json', 'landmark-pairs.json')
    },
    openModal (store, { modalId }) {
      /**
       * required for subscribe action
       */
    },
    flipAxis ({ commit, state }, { axis }) {
      const idx = axis === 0
        ? 0
        : axis === 1
          ? 5
          : axis === 2
            ? 10
            : -1

      if (idx < 0)
        return

      const flippedState = state.flippedState.map((v, id) => id === axis ? v * -1 : v)

      /**
       * translation mat for operations at the center of the volume
       */
      const id = state.selectedIncomingVolumeId
      const vol = state.incomingVolumes.find(v => v.id === id)
      const dim = (vol && vol.dim) || [0, 0, 0]

      const mirrorVec = [1, 1, 1]
      mirrorVec[axis] = -1
      const mirror = getMirrorMat(mirrorVec, dim)
      
      if (!mirror)
        return

      const { applyMirror } = mirror
      
      commit('setFlippedState', { flippedState })
      commit('multiplyIncTransmMatrix', Array.from(applyMirror))
    },
    selectReferenceVolumeWithId ({commit}, id) {
      commit('setSelectedReferenceVolumeWithId', id)
    },
    selectIncomingVolumeWithId ({ commit }, id) {
      commit('setSelectedIncomingVolumeId', id)
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
    highlightIncomingVolume ({ commit }, bool) {
      commit('setIncomingVolumeHighlighted', bool)
    }, 
    primaryNehubaNavigationPositionChanged ({ commit }, array) {
      commit('setPrimaryNehubaNavigationPosition', array)
    },
    secondaryNehubaNavigationPositionChanged ({ commit }, array) {
      commit('setSecondaryNehubaNavigationPosition', array)
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
    redrawNehuba () {
      /**
       * required for vuex event dispatch
       * used for nehuba to lsiten to layout changes
       */
    },
    selectMethodIndex (store, index) {
      store.commit('selectMethodIndex', index)
    },
    changeOpacity ({ commit }, opacity) {
      commit('setIncomingTemplateRGBA', { opacity })
    },
    changeOverlayColor ({ commit }, newOverlayColor) {
      const color = [
        newOverlayColor.rgba.r,
        newOverlayColor.rgba.g,
        newOverlayColor.rgba.b
      ]
      commit('setIncomingTemplateRGBA', { color })
      commit('updateOverlayColor', newOverlayColor)
    },
    computeTransformResponseReceived ({commit}, { transformationMatrix, inverseMatrix, RMSE, determinant} ) {
      commit('changeLandmarkTransformationMatrix', transformationMatrix)
      commit('changeLandmarkInverseMatrix', inverseMatrix)
      commit('changeLandmarkDeterminant', determinant)
      commit('changeLandmarkRMSE', RMSE)
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

    setScaleInc ({commit, state, getters}, {axis, value}) {
      if (axis !== 'x' && axis !== 'y' && axis !== 'z') {
        return
      }
      if (Number.isNaN(value) || !(value > 0)) {
        return
      }
      const idx = axis === 'x'
        ? 0
        : axis === 'y'
          ? 1
          : 2

      const { mat4, vec3 } = window.export_nehuba
      const { dim } = getters
      const dimVec = vec3.fromValues(...dim)

      const cXform = mat4.fromValues(...state.incTransformMatrix)

      /**
       * returning mat
       */
      const xformMat = mat4.create()

      /**
       * apply scale
       */
      const oldScale = mat4.getScaling(vec3.create(), cXform)
      const newScale = vec3.fromValues(1, 1, 1)
      newScale[idx] = value / oldScale[idx]
      const scaleMat = mat4.fromScaling(mat4.create(), newScale)
      mat4.mul(xformMat, scaleMat, xformMat)

      /**
       * apply excess transform
       */
      const xtraScale = vec3.sub(vec3.create(), vec3.fromValues(1,1,1), newScale)
      vec3.scale(xtraScale, xtraScale, 0.5)
      vec3.mul(xtraScale, xtraScale, dimVec)
      mat4.mul(xformMat, mat4.fromTranslation(mat4.create(), xtraScale), xformMat)
      
      /**
       * apply original xform
       */
      mat4.mul(xformMat, cXform, xformMat)

      commit("setIncTransformMatrix", { matrix: Array.from(xformMat) })
    },
    setTranslInc ({commit, state}, {axis, value : uncorrectedValue}) {
      if (axis !== 'x' && axis !== 'y' && axis !== 'z' && axis !== 'xyz') {
        return
      }

      const value = axis === 'xyz'
        ? uncorrectedValue.map(v => v * 1e6)
        : uncorrectedValue * 1e6

      const mIdx = axis === 'x'
        ? 12
        : axis === 'y'
          ? 13
          : axis === 'z'
            ? 14
            : null
      const vIdx = axis === 'x'
        ? 0
        : axis === 'y'
          ? 1
          : axis === 'z'
            ? 2
            : null 
      const {mat4} = window.export_nehuba
      const xformMat = mat4.fromValues(...state.incTransformMatrix)
      if (mIdx !== null) {
        xformMat[mIdx] = value * state.flippedState[vIdx]
      } else {
        xformMat[12] = value[0]
        xformMat[13] = value[1]
        xformMat[14] = value[2]
      }
      const matrix = Array.from(xformMat)
      commit('setIncTransformMatrix', { matrix })
    },
    translIncBy ({commit}, {axis, value}) {
      const idx = axis === 'x'
        ? 0
        : axis === 'y'
          ? 1
          : axis === 'z'
            ? 2
            : axis === 'xyz'
              ? -1
              : null
      if (idx === null) {
        return
      }

      const {mat4, vec3} = window.export_nehuba
      const translVec = vec3.create()
      if (idx >= 0) {
        translVec[idx] = value * 1e6
      } else {
        translVec[0] = value[0] * 1e6
        translVec[1] = value[1] * 1e6
        translVec[2] = value[2] * 1e6
      }
      
      const translM = mat4.fromTranslation(mat4.create(), translVec)
      commit('multiplyIncTransmMatrix', Array.from(translM))
    },
    rotIncBy ({commit, state}, { quaternion }) {
      if (!quaternion) {
        return
      }
      if (quaternion.some(n => Number.isNaN(n))) {
        return
      }
      const {quat, vec3, mat4} = window.export_nehuba
      
      const axis = vec3.create()
      const rotQuat = quat.fromValues(...quaternion)
      const angle = quat.getAxisAngle(axis, rotQuat)
      const rotMat = mat4.fromRotation(mat4.create(), angle, rotQuat)

      /**
       * rotMat may be null if angle is zero
       */
      if (!rotMat)
        return

      const xformMat = mat4.create()

      /**
       * translation mat for operations at the center of the volume
       */
      const id = state.selectedIncomingVolumeId
      const vol = state.incomingVolumes.find(v => v.id === id)
      const dim = vec3.fromValues(...(vol && vol.dim) || [0, 0, 0])

      /**
       * get mirror mats
       */
      const mirror = getMirrorMat(state.flippedState, dim)

      if (!mirror)
        return

      const { undoMirror } = mirror

      /**
       * undo mirror & undo scale
       */
      const cXformMat = mat4.fromValues(...state.incTransformMatrix)
      const cScaling = mat4.getScaling(vec3.create(), cXformMat)
      const ivCScaling = vec3.inverse(vec3.create(), cScaling)
      const cScalingMat = mat4.fromScaling(mat4.create(), ivCScaling)
      mat4.mul(xformMat, undoMirror, cScalingMat)

      /**
       * apply translation correction
       */

      const incTransl = vec3.mul(dim, dim, cScaling)
      vec3.scale(incTransl, incTransl, 0.5)
      const incTranslMat = mat4.fromTranslation(mat4.create(), incTransl)
      mat4.mul(xformMat, xformMat, incTranslMat)

      /**
       * save invert
       */
      const invert = mat4.invert(mat4.create(), xformMat)

      /**
       * apply rotation
       */
      mat4.mul(xformMat, xformMat, rotMat)

      /**
       * apply invert
       */
      mat4.mul(xformMat, xformMat, invert)

      commit('multiplyIncTransmMatrix', Array.from(xformMat))
    },
    startFromScratch ({dispatch, state, commit}) {
      commit('landmarksStore/setReferenceLandmarks', { referenceLandmarks: [] })
      commit('landmarksStore/setIncomingLandmarks', { incomingLandmarks: [] })
      commit('landmarksStore/setLandmarkPairs', { landmarkPairs: [] })
      dispatch('selectIncomingVolumeWithId', null)

      /**
       * TODO maybe move to undoStore? subscribe to root actions?
       */
      commit('undoStore/setUndoStack', { undoStack: [] })
      commit('undoStore/setRedoStack', { redoStack: [] })
      commit('landmarksStore/setLandmarkMode', { mode: false })
      commit('_setStep2Mode', { mode: 'overlay' })

      if (!state.appendNehubaFlag)
        return
      const { mat4 } = window.export_nehuba
      const matrix = Array.from(mat4.create())
      commit('setIncTransformMatrix', { matrix })
    }
  },
  getters: {
    incTransformMatrixReal: state => {
      if (!state.appendNehubaFlag)
        return state.incTransformMatrix
      const { mat4, vec3 } = window.export_nehuba

      /**
       * problematic for now
       */
      const incM = mat4.fromValues(...state.incTransformMatrix)
      const transl = mat4.getTranslation(vec3.create(), incM)
      vec3.negate(transl, transl)
      const translMat = mat4.fromTranslation(mat4.create(), transl)
      mat4.mul(incM, translMat, incM)
      vec3.scale(transl, transl, -1e-6)
      mat4.fromTranslation(translMat, transl)
      mat4.mul(incM, translMat, incM)
      return Array.from(incM)
    },

    incRotQuat: state => {
      if (!state.appendNehubaFlag)
        return [0, 0, 0, 1]
      const { mat4, quat } = window.export_nehuba
      
      const incM = mat4.fromValues(...state.incTransformMatrix)
      const q = mat4.getRotation(quat.create(0), incM)
      quat.invert(q, q)
      return Array.from(q)
    },
    dim: state => {
      const id = state.selectedIncomingVolumeId
      const vol = state.incomingVolumes.find(v => v.id === id)
      return (vol && vol.dim) || [0, 0, 0]
    },
    undoAndTranslate: (state, getters) => {

      const nullReturn = {
        xform: null,
        revvert: null
      }


      if (!state.appendNehubaFlag)
        return nullReturn
      
      const { mat4, vec3 } = window.export_nehuba

      /**
       * value to return
       */
      const xformMat = mat4.create()


      /**
       * undo mirror & undo scale
       */
      mat4.invert(xformMat, mat4.fromValues(...state.incTransformMatrix))

      /**
       * apply translation correction
       */
      const dim = getters.dim
       
      const incTransl = vec3.scale(vec3.create(), dim, -0.5)
      const incTranslMat = mat4.fromTranslation(mat4.create(), incTransl)
      mat4.mul(xformMat, xformMat, incTranslMat)

      const invert = mat4.invert(mat4.create(), xformMat)

      return {
        xform: Array.from(xformMat),
        revert: Array.from(invert)
      }
    },
    authHeader: (state) => {
      const idToken = state.user && state.user.idToken || process.env.VUE_APP_ID_TOKEN
      return idToken
        ? { Authorization: `Bearer ${idToken}` }
        : {}
    },
    selectedIncomingVolume: state => state.incomingVolumes.find(v => v.id === state.selectedIncomingVolumeId),
    selectedReferenceVolume: state => state.referenceVolumes.find(v => v.id === state.selectedReferenceVolumeId),
    selectedIncomingVolumeType: (state, getters) => {
      const volume = getters.selectedIncomingVolume || {}
      const { payload = {} } = volume
      const { extra = {} } = payload
      const { neuroglancer = {} } = extra
      const { type = 'image' } = neuroglancer
      return type
    }
  }
})

export default getStore