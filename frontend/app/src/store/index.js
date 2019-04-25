
import { randomColor, generateId, UPLOAD_URL, computeDeterminant, saveToFile } from '@//constants'
import { incompatibleBrowserText } from '@/text'
import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'
import { AGREE_COOKIE_KEY, DEFAULT_INCOMING_VOLUMES, processImageMetaData, openInNewWindow, getShader } from '../constants';

Vue.use(Vuex)

const getStateSnapshot = ({ addLandmarkMode, incTransformMatrix, referenceLandmarks, incomingLandmarks, landmarkPairs }) => {
  return {
    incTransformMatrix: Array.from(incTransformMatrix),
    referenceLandmarks,
    incomingLandmarks,
    landmarkPairs,
    addLandmarkMode
  }
}

const restoreState = ({commit}, {addLandmarkMode = false, incTransformMatrix, referenceLandmarks, incomingLandmarks, landmarkPairs}) => {
  if ( incTransformMatrix ) {
    commit('setIncTransformMatrix', { matrix: incTransformMatrix })
  }
  if ( referenceLandmarks ) {
    commit('setReferenceLandmarks', {
      referenceLandmarks
    })
  }
  if ( incomingLandmarks ) {
    commit('setIncomingLandmarks', {
      incomingLandmarks
    })
  }
  if ( landmarkPairs ) {
    commit('setLandmarkPairs', {
      landmarkPairs
    })
  }
  commit('setLandmarkMode', {
    mode: addLandmarkMode
  })
}

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

const store = new Vuex.Store({
  state: {
    production: process.env.NODE_ENV === 'production',

    uploadUrl: UPLOAD_URL, 
    user: null,
    pairLandmarkStartDragging: false,
    agreedToCookie: localStorage.getItem(AGREE_COOKIE_KEY),

    flippedState: [1, 1, 1],

    undoStack: [],
    redoStack: [],

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
    incomingVolumes: DEFAULT_INCOMING_VOLUMES,

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

    overlayColor: {hex: '#FCDC00', rgba: {r: 252, g: 220, b: 0, a: 1}},
    // in nm
    primaryNehubaNavigationPosition: [0, 0, 0],
    secondaryNehubaNavigationPosition: [0, 0, 0],
    viewerMousePosition: [0, 0, 0],

    viewerSliceOrientation: [0, 0, 0, 1],
    viewerNavigationStateString: null,

    mouseoverUserlayer: null,

    addLandmarkMode: false,
    landmarkControlVisible: false,
    referenceLandmarks: [],
    incomingLandmarks: [],
    landmarkPairs: [],

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
    setIncVolLoc (state, { incVolTranslationLock, incVolRotationLock }) {
      state.incVolRotationLock = incVolRotationLock
      state.incVolTranslationLock = incVolTranslationLock
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
    setUndoStack (state, { undoStack }) {
      state.undoStack = undoStack
    },
    setRedoStack (state, { redoStack }) {
      state.redoStack = redoStack
    },
    /**
     * TODO
     * fix inconsistency
     */
    setLandmarkMode (state, { mode }) {
      state.addLandmarkMode = mode
    },
    setLandmarkControlVisibility (state, { visible }) {
      state.landmarkControlVisible = visible
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

    /**
     * Landmarks mutation
     */

    setReferenceLandmarks (state, { referenceLandmarks }) {
      state.referenceLandmarks = referenceLandmarks
    },
    setIncomingLandmarks (state, { incomingLandmarks }) {
      state.incomingLandmarks = incomingLandmarks
    },
    setLandmarkPairs (state, { landmarkPairs }) {
      state.landmarkPairs = landmarkPairs
    },

    resetReferenceLandmark (state, { id }) {
      const lm = state.referenceLandmarks.find(lm => lm.id === id)
      lm.coord = state.primaryNehubaNavigationPosition.map(v => v / 1e6)
    },
    resetIncomingLandmark (state, { id }) {
      const lm = state.incomingLandmarks.find(lm => lm.id === id)
      lm.coord = state.secondaryNehubaNavigationPosition.map(v => v / 1e6)
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
    setRefLandmark (state, { id, lm: newLm }) {
      state.referenceLandmarks = state.referenceLandmarks.map(lm => lm.id === id ? newLm : lm)
    },
    setIncLandmark (state, {id, lm: newLm}) {
      state.incomingLandmarks = state.incomingLandmarks.map(lm => lm.id === id ? newLm : lm)
    }
  },
  actions: {
    setLocalStorage: function (store, payload) {
      for (let key in payload) {
        localStorage.setItem(key, payload[key])
      }
    },
    viewInInteractiveViewer: function ({ state, getters }) {
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
        .catch(e => {
          console.error(e)
        })
    },
    downloadXformResult: function ({ state, getters }) {
      const {selectedIncomingVolume, selectedReferenceVolume} = getters
      const incomingVolume = selectedIncomingVolume && selectedIncomingVolume.name
      const referenceVolume = selectedReferenceVolume && selectedReferenceVolume.name
      const transformMatrixInNm = [
        state.incTransformMatrix.slice(0,4),
        state.incTransformMatrix.slice(4,8),
        state.incTransformMatrix.slice(8,12),
        state.incTransformMatrix.slice(12)
      ]
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
    changeLandmarkMode: function ({ state, commit, dispatch }, { mode }) {
      if (!mode) {
        const pairedRefLmId = new Set(state.landmarkPairs.map(lm => lm.refId))
        const pairedIncLmId = new Set(state.landmarkPairs.map(lm => lm.incId))
        const refLmTobePruned = state.referenceLandmarks.filter(lm => !pairedRefLmId.has(lm.id))
        const incLmTobePruned = state.incomingLandmarks.filter(lm => !pairedIncLmId.has(lm.id))
        if(refLmTobePruned.length > 0 || incLmTobePruned.length > 0) {
          dispatch('pushUndo', {
            name: 'pruning unpaired landmarks'
          })
          if (incLmTobePruned.length > 0) {
            const incLmSet = new Set(incLmTobePruned.map(lm => lm.id))
            commit('setIncomingLandmarks', {
              incomingLandmarks: state.incomingLandmarks.filter(lm => !incLmSet.has(lm.id))
            })
          }
          if (refLmTobePruned.length > 0) {
            const refLmSet = new Set(refLmTobePruned.map(lm => lm.id))
            commit('setReferenceLandmarks', {
              referenceLandmarks: state.referenceLandmarks.filter(lm => !refLmSet.has(lm.id))
            })
          }
        }
      }
      commit('setLandmarkMode', { mode })
    },
    lockIncVol: function ({ commit, state }, { incVolTranslationLock = null, incVolRotationLock = null }) {
      commit('setIncVolLoc', {
        incVolTranslationLock : incVolTranslationLock !== null ? incVolTranslationLock : state.incVolTranslationLock,
        incVolRotationLock: incVolRotationLock !== null ? incVolRotationLock : state.incVolRotationLock
      })
    },
    addLmp: function ({commit, dispatch, state}, { refId, incId }) {
      const id = generateId(state.landmarkPairs)
      dispatch('pushUndo', {
        name: 'link landmark pair'
      })
      commit('setLandmarkPairs', {
        landmarkPairs: state.landmarkPairs.concat({
          refId,
          incId,
          id,
          name: id,
          color: randomColor()
        })
      })
    },
    gotoLm: function ({dispatch, state}, {volume, id}) {
      const payload = {}
      if (volume === 'reference') {
        const refLm = state.referenceLandmarks.find(lm => lm.id === id)
        if (!refLm)
          return
        payload.coord = refLm.coord
      }
      if (volume === 'incoming') {
        const {vec3, mat4} = window.export_nehuba
        const incLm = state.incomingLandmarks.find(lm => lm.id === id)
        if (!incLm)
          return
        const incXform = mat4.fromValues(...state.incTransformMatrix)
        const coord = vec3.fromValues(...incLm.coord.map(v => v * 1e6))
        vec3.transformMat4(coord, coord, incXform)
        payload.coord = Array.from(coord).map(v => v / 1e6)
      }

      if (payload.coord) {
        if (state._step2Mode === 'overlay' || volume === 'reference') {
          dispatch('setPrimaryNehubaNavigation', payload)
        } 
        if (state._step2Mode === 'classic' && volume === 'incoming') {
          dispatch('setSecondaryNehubaNavigation', payload)
        }
      }
        
    },
    removeLmp: function ({commit, dispatch, state}, { id, incId, refId }) {
      dispatch('pushUndo', {
        name: `unlink landmark pair`
      })
      const landmarkPairs = state.landmarkPairs.filter(lmp => !(
        id && lmp.id === id ||
        incId && lmp.incId === incId ||
        refId && lmp.refId === refId
      ))

      commit('setLandmarkPairs', { landmarkPairs })

      /**
       * also prune the ref/inc lmp
       */
      const pairedRefLmId = new Set(state.landmarkPairs.map(lm => lm.refId))
      const pairedIncLmId = new Set(state.landmarkPairs.map(lm => lm.incId))
      const refLmTobePruned = state.referenceLandmarks.filter(lm => !pairedRefLmId.has(lm.id))
      const incLmTobePruned = state.incomingLandmarks.filter(lm => !pairedIncLmId.has(lm.id))

      if (incLmTobePruned.length > 0) {
        const incLmSet = new Set(incLmTobePruned.map(lm => lm.id))
        commit('setIncomingLandmarks', {
          incomingLandmarks: state.incomingLandmarks.filter(lm => !incLmSet.has(lm.id))
        })
      }
      if (refLmTobePruned.length > 0) {
        const refLmSet = new Set(refLmTobePruned.map(lm => lm.id))
        commit('setReferenceLandmarks', {
          referenceLandmarks: state.referenceLandmarks.filter(lm => !refLmSet.has(lm.id))
        })
      }
    },
    removeAllLm: function ({ commit, dispatch }, { volume }) {
      dispatch('pushUndo', {
        name: `remove all ${volume} landmark`
      })
      if (volume === 'reference') {
        commit('setReferenceLandmarks', { referenceLandmarks: [] })
      }
      if (volume === 'incoming') {
        commit('setIncomingLandmarks', { incomingLandmarks: [] })
      }
      commit('setLandmarkPairs', { landmarkPairs: [] })
    },
    removeAllLmp: function ({ dispatch, commit }) {
      dispatch('pushUndo', {
        name: 'remove all landmark pairs'
      })
      commit('setLandmarkPairs', { landmarkPairs: [] })
      /**
       * removing all lmp also removes all ref and inc lms
       * 
       */
      commit('setReferenceLandmarks', {
        referenceLandmarks: []
      })
      commit('setIncomingLandmarks', {
        incomingLandmarks: []
      })
    },
    removeLm: function ({commit, dispatch, state}, {volume, id}) {
      let lmPair = {}
      dispatch('pushUndo', {
        name: `remove ${volume} landmark`
      })
      if (volume === 'reference') {
        const referenceLandmarks = state.referenceLandmarks.filter(lm => lm.id !== id)
        commit('setReferenceLandmarks', { referenceLandmarks })
        lmPair.refId = id
      }
      if (volume === 'incoming') {
        const incomingLandmarks = state.incomingLandmarks.filter(lm => lm.id !== id)
        commit('setIncomingLandmarks', { incomingLandmarks })
        lmPair.incId = id
      }

      const landmarkPairs = state.landmarkPairs.filter(lm => 
        !(
          (lmPair.refId && lm.refId === lmPair.refId) || 
          (lmPair.incId && lm.incId === lmPair.incId)
        ))
      commit('setLandmarkPairs', { landmarkPairs })
    },
    setLmsActive: function ({ commit, state }, { volume, active }) {
      if (volume === 'reference') {
        commit('setReferenceLandmarks', 
          { referenceLandmarks : state.referenceLandmarks.map(lm => {
            return {
              ...lm,
              active
            }
          }) 
        })
      }
      if (volume === 'incoming') {
        commit('setIncomingLandmarks', 
          { incomingLandmarks : state.incomingLandmarks.map(lm => {
            return {
              ...lm,
              active
            }
          }) 
        })

      }
    },
    toggleLmActive: function ({commit, state}, { volume, id }) {
      if (volume === 'reference') {
        const referenceLandmarks = state.referenceLandmarks.map(lm => {
          return {
            ...lm,
            active: lm.id === id ? !lm.active : lm.active
          }
        })
        commit('setReferenceLandmarks', { referenceLandmarks })
      }
      if (volume === 'incoming') {
        const incomingLandmarks = state.incomingLandmarks.map(lm => {
          return {
            ...lm,
            active: lm.id === id ? !lm.active : lm.active
          }
        })
        commit('setIncomingLandmarks', { incomingLandmarks })
      }
    },
    pushUndo: function ({ commit, state }, { name, desc, collapse, overwrite = {} }) {
      /**
       * items with the same collapseId will not generate a new undo stack 
       */

      if (collapse && state.undoStack.length > 0 && state.undoStack.slice(-1)[0].collapse === collapse)
        return
      const stateSnapshot = getStateSnapshot({
        ...state,
        ...overwrite
      })
      const undoItem = {
        id: Date.now(),
        name,
        desc,
        collapse,
        state: stateSnapshot
      }
      /**
       * older undo items, remove collapseid. when new item is added on top, they should have no collapsability
       */
      const undoStack = state.undoStack
        .map(({ collapse, ...rest }) => rest)
        .concat(undoItem)
      commit('setUndoStack', { undoStack })
      commit('setRedoStack', { redoStack: [] })
    },
    undo: function ({commit, state}) {
      if (state.undoStack.length === 0) {
        /**
         * nothing in the undo stack
         */
        return
      }

      /**
       * collapse state is not to be pushed onto the redo stack
       */
      const {id, state: _state, collapse, ...rest} = state.undoStack.slice(-1)[0]

      const stateSnapshot = getStateSnapshot(state)

      const newRedoItem = {
        id: Date.now(),
        state: stateSnapshot,
        ...rest
      }

      const redoStack = state.redoStack.concat(newRedoItem)
      const undoStack = state.undoStack.slice(0, -1)

      restoreState({commit}, _state)
      
      commit('setUndoStack', { undoStack })
      commit('setRedoStack', { redoStack })
    },
    redo: function ({commit, state}) {
      if (state.redoStack.length === 0) {
        return
      }

      const {id, state: _state, ...rest} = state.redoStack.slice(-1)[0]

      const stateSnapshot = getStateSnapshot(state)

      const newUndoItem = {
        id: Date.now(),
        state: stateSnapshot,
        ...rest
      }

      const undoStack = state.undoStack.concat(newUndoItem)
      const redoStack = state.redoStack.slice(0, -1)

      restoreState({commit}, _state)

      commit('setUndoStack', { undoStack })
      commit('setRedoStack', { redoStack })
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
      if (state.landmarkPairs.length < 3) {
        return
      }
      
      if (state.backendQueryInProgress) {
        return
      }
      
      const lmPairs = state.landmarkPairs
        .map(pair => {
          const refLm = state.referenceLandmarks.find(rLm => rLm.id === pair.refId)
          const incLm = state.incomingLandmarks.find(iLm => iLm.id === pair.incId)
          return refLm && incLm
            ? {
              active: pair.active,
              colour: pair.active,
              name: pair.name,
              'source_point': refLm.coord,
              'target_point': incLm.coord
            }
            : null
        })
        .filter(lm => lm !== null)
      
      const data = {
        'source_image': state.selectReference, // TODO update
        'target_image': state.selectTemplate, // TODO update
        'transformation_type': state.transformationTypes[state.selectedTransformationIndex].value,
        'landmark_pairs': lmPairs
      }

      commit('setBackendQueryInProgress', { backendQueryInProgress : true })
      if (errorTimeoutId) clearTimeout(errorTimeoutId)
      commit('setBackendQueryError', { error: null })

      console.log('sending data to backend...', {data})
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
    translateLandmarkPosBy ({commit, dispatch, state}, { volume, id, value}) {

      const lm = volume === 'reference'
        ? state.referenceLandmarks.find(lm => lm.id === id)
        : volume === 'incoming'
          ? state.incomingLandmarks.find(lm => lm.id === id)
          : null
      if (!lm)
        return

      dispatch('pushUndo', {
        name: `translating ${lm.name} in ${volume}`,
        collapse: `translating ${lm.name} in ${volume}`
      })

      const commitSignature = volume === 'reference'
        ? 'setRefLandmark'
        : 'setIncLandmark'
      commit(commitSignature, {
        id: id,
        lm: {
          ...lm,
          coord: lm.coord.map((v, idx) => v + value[idx])
        }
      })
    },
    deleteIncomingVolume ({ state, dispatch }, { id, incomingVolume}) {
      /**
       * TODO
       * check endpoint still valid
       */
      const idToken = state.user && state.user.idToken
      const config = idToken
        ? { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + idToken } }
        : { method: 'DELETE' }
      console.log(config)
      const { payload } = incomingVolume
      const link = payload && payload.links && payload.links.normalized

      console.log(id, incomingVolume, link)
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
          dispatch('updateIncVolumes', {
            message: 'Delete incoming volume complete.'
          })
        }).catch(error => {
          /**
           * error during delete (?)
           */
          dispatch('updateIncVolumes', {
            error,
            message: 'Delete incoming volume error.'
          })
        })
    },
    updateIncVolumesResult (store, {error, message}) {
      /**
       * required for subscribe action
       */
    },
    updateIncVolumes ({ commit, state, dispatch }, {error, message} = {error:null, message: null}) {
      const idToken = (state.user && state.user.idToken) || process.env.VUE_APP_ID_TOKEN
      const config = idToken
        ? { headers: { 'Authorization': 'Bearer ' + idToken } }
        : {}
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
          const newVolumes = DEFAULT_INCOMING_VOLUMES.concat(volumes)

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
    saveLandmarks ({ state }) {
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
      console.log('saving landmarks', data)
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
    addLandmark ({commit, dispatch, state}, {landmark = {}}) {
      dispatch('pushUndo', {
        name: `add ${state.addLandmarkMode} landmark`,
        /**
         * otherwise, when user undo the adding of reference lm,
         * addlandmarkmode will continue to be 'reference'
         */
        overwrite: state.addLandmarkMode === 'reference'
          ? { addLandmarkMode: false }
          : state.addLandmarkMode === 'incoming'
            ? { addLandmarkMode: 'incoming' }
            : {}
      })
      if (state.addLandmarkMode === 'reference') {
        const refId = generateId(state.referenceLandmarks).toString()
        const newReferenceLandmark = {
          id: refId,
          name: refId,
          /**
           * position in nm
           */
          coord: state.primaryNehubaNavigationPosition.map(v => v / 1e6),
          active: true,
          ...landmark
        }
        commit('setLandmarkMode', {
          mode: 'incoming'
        })
        commit('setReferenceLandmarks', {
          referenceLandmarks: state.referenceLandmarks.concat(newReferenceLandmark)
        })
      } else if (state.addLandmarkMode === 'incoming') {
        /**
         * currently, only way addLandmark action is triggered is in overlay mode
         * as a result, we need to calculate the actual coord, from primary nehuba navigation to inc vol space
         */
        const {mat4, vec3 } = window.export_nehuba

        const coord = (landmark.coord && landmark.coord.map(v => v * 1e6)) || state.primaryNehubaNavigationPosition
        const xform = mat4.fromValues(...state.incTransformMatrix)
        mat4.invert(xform, xform)
        const pos = vec3.fromValues(...coord)
        vec3.transformMat4(pos, pos, xform)

        const incId = generateId(state.incomingLandmarks).toString()
        const newIncomingLandmark = {
          id: incId,
          name: incId,
          active: true,
          coord: Array.from(pos).map(v => v / 1e6)
        }
        const refLm = state.referenceLandmarks.find(lm => state.landmarkPairs.findIndex(lmp => lmp.refId === lm.id) < 0)
        if (refLm) {
          const id = generateId(state.landmarkPairs)
          const newLmp = {
            id,
            refId: refLm.id,
            incId,
            name: id,
            active: true,
            color: randomColor()
          }
          commit('setLandmarkPairs', {
            landmarkPairs: state.landmarkPairs.concat(newLmp)
          })
        }
        commit('setLandmarkMode', {
          mode: false
        })
        commit('setIncomingLandmarks', {
          incomingLandmarks: state.incomingLandmarks.concat(newIncomingLandmark)
        })
      }
    },
    hoverLandmarkPair ({ commit, state }, { id, refId, incId, hover}){
      const lmp = state.landmarkPairs.find(lmp => lmp.id === id || lmp.refId === refId || lmp.incId === incId)
      if (lmp)
        commit('setLandmarkPairs', {
          landmarkPairs: state.landmarkPairs.map(pair => pair.id === lmp.id
            ? {
              ...pair,
              hover
            }
            : pair)
        })
    },
    addLandmarkPair ({ commit, dispatch, state }) {
      dispatch('pushUndo', {
        name: `add ref inc landmark pair`
      })
      /**
       * TODO deprecated. old 2 way split method
       */
      const refId = generateId(state.referenceLandmarks).toString()
      const newReferenceLandmark = {
        id: refId,
        name: refId,
        active: true,
        /**
         * position in nm
         */
        coord: state.primaryNehubaNavigationPosition.map(v => v / 1e6)
      }
      const incId = generateId(state.incomingLandmarks).toString()

      const { mat4, vec3 } = window.export_nehuba
      const xform = mat4.fromValues(...state.incTransformMatrix)
      mat4.invert(xform, xform)
      const newv = vec3.transformMat4(vec3.create(), vec3.fromValues(...state.secondaryNehubaNavigationPosition), xform)
      vec3.scale(newv, newv, 1e-6)
      const newCoord = Array.from(newv)
      
      const newIncomingLandmark = {
        id: incId,
        name: incId,
        active: true,
        coord: newCoord
      }
      const lpId = generateId(state.landmarkPairs).toString()
      const newLandmarkPair = {
        id: lpId,
        refId: refId,
        incId: incId,
        color: randomColor(),
        name: lpId,
        active: true
      }

      commit('setReferenceLandmarks', {
        referenceLandmarks: state.referenceLandmarks.concat(newReferenceLandmark)
      })
      commit('setIncomingLandmarks', {
        incomingLandmarks: state.incomingLandmarks.concat(newIncomingLandmark)
      })
      commit('setLandmarkPairs', {
        landmarkPairs: state.landmarkPairs.concat(newLandmarkPair)
      })
    },
    removeLmsLmp ({commit, dispatch, state}, { id }) {

      const lmp = state.landmarkPairs.find(lm => lm.id === id)

      if (!lmp)
        return
      
      dispatch('pushUndo', {
        name: `remove landmark pairs ${lmp.name}`
      })
      
      const landmarkPairs = state.landmarkPairs.filter(lmp => lmp.id !== id)
      const referenceLandmarks = state.referenceLandmarks.filter(lm => lm.id !== lmp.refId)
      const incomingLandmarks = state.incomingLandmarks.filter(lm => lm.id !== lmp.incId)

      commit('setLandmarkPairs', { landmarkPairs })
      commit('setReferenceLandmarks', { referenceLandmarks })
      commit('setIncomingLandmarks', { incomingLandmarks })
    },
    removeAllLmsLmps ({ commit, dispatch }) {
      dispatch('pushUndo', {
        name: 'remove all landmarks and landmark pairs'
      })
      commit('setReferenceLandmarks', {
        referenceLandmarks: []
      })
      commit('setIncomingLandmarks', {
        incomingLandmarks: []
      })
      commit('setLandmarkPairs', {
        landmarkPairs: []
      })
    },
    removeReferenceLandmark ({commit, state}, {id}) {
      commit('setReferenceLandmarks', {
        referenceLandmarks: state.referenceLandmarks.filter(lm => lm.id !== id)
      })
    },
    removeIncomingLandmark ({commit, state}, {id}) {
      commit('setIncomingLandmarks', {
        incomingLandmarks: state.incomingLandmarks.filter(lm => lm.id !== id)
      })
    },
    removeLandmarkPair ({commit, state}, { id }) {
      commit('setLandmarkPairs', {
        landmarkPairs: state.landmarkPairs.filter(lm => lm.id !== id)
      })
    },
    enableLandmarkPairs ({commit, state}, {enable}) {
      commit('setLandmarkPairs', {
        landmarkPairs: state.landmarkPairs.map(lmp => {
          return {
            ...lmp,
            active: enable
          }
        })
      })
    },

    toggleLandmarkPairActive ({ commit, state }, { id }) {
      commit('setLandmarkPairs', {
        landmarkPairs: state.landmarkPairs.map(lmp => {
          return {
            ...lmp,
            active: lmp.id === id ? !lmp.active : lmp.active
          }
        })
      })
    },
    changeLandmarkName ({commit, dispatch, state}, {id, name, volume}) {
      dispatch('pushUndo', {
        name: `change ${volume} landmark name`,
        collapse: `change ${volume} landmark name ${id}`
      })
      if (volume === 'reference') {
        commit('setReferenceLandmarks', {
          referenceLandmarks: state.referenceLandmarks.map(lm => lm.id === id 
            ? {
              ...lm,
              name
            }
            : lm)
        })
      }
      if (volume === 'incoming') {
        commit('setIncomingLandmarks', {
          incomingLandmarks: state.incomingLandmarks.map(lm => lm.id === id
            ? {
              ...lm,
              name
            }
            : lm)
        })
      }
    },
    changeLandmarkPairName ({commit, state, dispatch}, { id, refId, incId, name }) {
      dispatch('pushUndo', {
        name: `change landmark pair name`,
        collapse: `change landmark pair name ${id} ${refId} ${incId}`
      })
      commit('setLandmarkPairs', {
        landmarkPairs: state.landmarkPairs.map(lmp => {
          return {
            ...lmp,
            name: lmp.id === id
              || refId === lmp.refId
              || incId === lmp.incId
                ? name
                : lmp.name
          }
        })
      })
    },

    /**
     * TODO perhaps temporary solution
     * temporary 
     */
    
     loadOldJson ({ commit, dispatch, state }, { json, config }) {
      const { fixCenterTranslation } = config
      const { vec3, mat4 } = window.export_nehuba
      const arrayMat4 = state.referenceTemplateTransform
        ? state.referenceTemplateTransform.flatMap((arr, i) => arr.map((v, idx) => (i === 3 || idx !== 3) ? v : v / 1e6))
        : null
      const transformRef = (coord) => {
        if (fixCenterTranslation && arrayMat4) {
          const oldCoord = vec3.fromValues(...coord)
          const transformMat4 = mat4.fromValues(...arrayMat4)
          mat4.transpose(transformMat4, transformMat4)
          vec3.transformMat4(oldCoord, oldCoord, transformMat4)
          return Array.from(oldCoord)
        } else {
          return coord
        }
      }

      dispatch('pushUndo', {
        name: 'loaded old landmark json'
      })
      
      const referenceLandmarks = json.map(pair => {
        return {
          id: `${pair.name}_ref`,
          name: `${pair.name}_ref`,
          active: true,
          coord: transformRef(pair.target_point)
        }
      })
      const incomingLandmarks = json.map(pair => {
        return {
          id: `${pair.name}_inc`,
          name: `${pair.name}_inc`,
          active: true,
          coord: pair.source_point
        }
      })
      const landmarkPairs = json.map(pair => {
        return {
          id: `${pair.name}_pair`,
          refId: `${pair.name}_ref`,
          incId: `${pair.name}_inc`,
          color: pair.colour,
          name: `${pair.name}_pair`,
          active: true
        }
      })

      commit('setReferenceLandmarks', { referenceLandmarks })
      commit('setIncomingLandmarks', { incomingLandmarks })
      commit('setLandmarkPairs', { landmarkPairs })
    },
    resetLandmark ({ commit, state }, { id }) {
      const pair = state.landmarkPairs.find(pair => pair.id === id)
      if (pair) {
        commit('resetReferenceLandmark', { id: pair.refId })
        commit('resetIncomingLandmark', { id: pair.incId })
      }
    },
    gotoLandmark ({ dispatch, state }, { pairId }) {
      const pair = state.landmarkPairs.find(pair => pair.id === pairId)
      if (pair) {
        const inc = state.incomingLandmarks.find(incLm => incLm.id === pair.incId)
        const ref = state.referenceLandmarks.find(refLm => refLm.id === pair.refId)
        console.log(ref, inc)
        dispatch('setPrimaryNehubaNavigation', ref)
        dispatch('setSecondaryNehubaNavigation', inc)
      }
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
      commit('setReferenceLandmarks', { referenceLandmarks: [] })
      commit('setIncomingLandmarks', { incomingLandmarks: [] })
      commit('setLandmarkPairs', { landmarkPairs: [] })
      dispatch('selectIncomingVolumeWithId', null)
      commit('setUndoStack', { undoStack: [] })
      commit('setRedoStack', { redoStack: [] })
      commit('setLandmarkMode', { mode: false })
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
    selectedIncomingVolume: state => state.incomingVolumes.find(v => v.id === state.selectedIncomingVolumeId),
    selectedReferenceVolume: state => state.referenceVolumes.find(v => v.id === state.selectedReferenceVolumeId)
  }
})

export default store