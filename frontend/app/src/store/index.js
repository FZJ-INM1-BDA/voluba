
import { incompatibleBrowserText, randomColor, generateId, UPLOAD_URL, computeDeterminant, DEBOUNCE_TIMEOUT } from '@//constants'
import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'

Vue.use(Vuex)

const getStateSnapshot = ({ incTransformMatrix, referenceLandmarks, incomingLandmarks, landmarkPairs }) => {
  return {
    incTransformMatrix: Array.from(incTransformMatrix),
    referenceLandmarks,
    incomingLandmarks,
    landmarkPairs
  }
}

const restoreState = ({commit}, {incTransformMatrix, referenceLandmarks, incomingLandmarks, landmarkPairs}) => {
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
}

const appendNehuba = () => new Promise((resolve, reject) => {
    /**
     * debug
     */
    // return reject('Your browser is not supported')
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

const store = new Vuex.Store({
  state: {
    user: null,
    pairLandmarkStartDragging: false,

    flippedState: [1, 1, 1],

    undoStack: [],
    redoStack: [],

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
    incomingVolumes: [
      {
        id: 'inc-1',
        name: 'Nucleus subthalamicus (B20)',
        // value: 'precomputed://http://imedv02.ime.kfa-juelich.de:8287/precomputed/B20_stn_l/v10'
        imageSource: 'precomputed://https://neuroglancer-dev.humanbrainproject.org/precomputed/landmark-reg/B20_stn_l/v10'
      },
      {
        id: 'inc-2',
        name: 'Hippocampus unmasked',
        imageSource: 'precomputed://https://neuroglancer-dev.humanbrainproject.org/precomputed/landmark-reg/hippocampus-unmasked'
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

    _step2Mode: 'overlay',
    _step2OverlayFocus: 'reference',

    referenceTemplate: null,
    incomingTemplate: null,
    incomingColor: [252, 200, 0, 0.5],
    incomingVolumeSelected: false,

    /**
     * read only, depend on state.incTransformMatrix
     */
    incRotQuat: [0, 0, 0, 1],
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
    mouseoverUserlayer: null,

    addLandmarkMode: false,
    landmarkControlVisible: false,
    referenceLandmarks: [],
    incomingLandmarks: [],
    landmarkPairs: [],

    synchronizeZoom: false,
    synchronizeCursor: false,
    backendURL: process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000/api',

    backendQueryInProgress: false,
    /**
     * response from landmark-reg server
     */
    landmarkTransformationMatrix: null,
    landmarkInverseMatrix: null,
    landmarkDeterminant: null,
    landmarkRMSE: null
  },
  mutations: {
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
    setUndoStack (state, { undoStack }) {
      state.undoStack = undoStack
    },
    setRedoStack (state, { redoStack }) {
      state.redoStack = redoStack
    },
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
    enableSynchronizeZoom (state, synchronizeZoom) {
      state.synchronizeZoom = synchronizeZoom
    },
    enableSynchronizeCursor (state, synchronizeCursor) {
      state.synchronizeCursor = synchronizeCursor
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
      const { quat, mat4 } = window.export_nehuba
      const m = mat4.fromValues(...matrix)
      const q = mat4.getRotation(quat.create(), m)
      quat.invert(q, q)
      state.incRotQuat = Array.from(q)
      state.incTransformMatrix = matrix
    },
    multiplyIncTransmMatrix (state, matrix) {
      // catch when matrix is null (happens occationally?)
      if (!matrix)
        return
      const { mat4, quat } = window.export_nehuba
      const incM = mat4.fromValues(...state.incTransformMatrix)
      const mulM = mat4.fromValues(...matrix)
      mat4.mul(incM, incM, mulM)
      const det = mat4.determinant(incM)

      const q = mat4.getRotation(quat.create(), incM)
      quat.invert(q, q)

      state.incRotQuat = Array.from(q)
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
    modalMessage: function () {
      /**
       * required for subscribe action
       */
    },
    appendNehuba: function ({ commit, dispatch }) {
      appendNehuba()
        .then(() => commit('setAppendNehubaFlag', {flag: true}))
        .catch(e => dispatch('modalMessage', { title: 'Incompatible browser', body: incompatibleBrowserText }))
    },
    lockIncVol: function ({ commit, state }, { incVolTranslationLock = null, incVolRotationLock = null }) {
      commit('setIncVolLoc', {
        incVolTranslationLock : incVolTranslationLock !== null ? incVolTranslationLock : state.incVolTranslationLock,
        incVolRotationLock: incVolRotationLock !== null ? incVolRotationLock : state.incVolRotationLock
      })
    },
    addLmp: function ({commit, state}, { refId, incId }) {
      const id = generateId(state.landmarkPairs)
      commit('setLandmarkPairs', {
        landmarkPairs: state.landmarkPairs.concat({
          refId,
          incId,
          id,
          name: id
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

      if (payload.coord)
        dispatch('setPrimaryNehubaNavigation', payload)
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
        name: 'unlink all landmark pairs'
      })
      commit('setLandmarkPairs', { landmarkPairs: [] })
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
    pushUndo: function ({ commit, state }, { name, desc, collapse }) {
      /**
       * items with the same collapseId will not generate a new undo stack 
       */

      if (collapse && state.undoStack.length > 0 && state.undoStack.slice(-1)[0].collapse === collapse)
        return
      const stateSnapshot = getStateSnapshot(state)
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

      console.log('undo')

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

      console.log('redo')

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

      commit('setBackendQueryInProgress', { backendQueryInProgress : true})

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
          console.log(error)
          // TODO: handle error!
        })
    },
    landmarkControlVisibilityChanged ({ commit }, { visible }) {
      commit('setLandmarkControlVisibility', { visible })
    },
    translateLandmarkPosBy ({commit, state}, { volume, id, value}) {
      const lm = volume === 'reference'
        ? state.referenceLandmarks.find(lm => lm.id === id)
        : volume === 'incoming'
          ? state.incomingLandmarks.find(lm => lm.id === id)
          : null
      if (!lm)
        return

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
    deleteIncomingVolume ({ dispatch }, {id}) {
      if (!/^user-/.test(id)) {
        return
      }
      const actualId = /^user-(.*?)$/.exec(id)[1]
      axios(`${UPLOAD_URL}/user/nifti/${actualId}`, {
        method: 'DELETE'
      }).then(res => {
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
      axios(`${UPLOAD_URL}/user/list`)
        .then(({data}) => {
          const volumes = data.map(url => {
            return {
              name: url,
              imageSource: `precomputed://${UPLOAD_URL}/user/nifti/${url}`,
              id: `user-${url}`
            }
          })
          const newVolumes = state.incomingVolumes
            .filter(v => !/^user-/.test(v.id))
            .concat(volumes)

          commit('setIncomingVolumes', {volumes: newVolumes})
          dispatch('updateIncVolumesResult', {
            error: error ? error : null,
            message: message ? message : 'Incoming volumes updated'
          })
        })
        .catch(e => {
          dispatch('updateIncVolumesResult', {
            error: error ? error : e,
            message: error ? message : 'GET /user/list error'
          })
          /**
           * should the available inc volumes be re-updated?
           */
        })
    },
    uploadVolume ({ dispatch }) {
      dispatch('openModal', {modalId: 'uploadModal'})
    },
    loadLandmarks ({ dispatch }) {
      dispatch('openModal', {modalId: 'loadLandmarkPairsModal'})
    },
    openModal (store, { modalId }) {
      /**
       * required for subscribe action
       */
    },
    flipAxis ({ commit, state }, { axis }) {
      const { mat4 } = window.export_nehuba
      const idx = axis === 0
        ? 0
        : axis === 1
          ? 5
          : axis === 2
            ? 10
            : -1

      if (idx < 0)
        return
      
      commit('setFlippedState', {
        flippedState: state.flippedState.map((v, id) => id === axis ? v * -1 : v)
      })
      const mulM = mat4.create()
      mulM[idx] = -1
      commit('multiplyIncTransmMatrix', Array.from(mulM))
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
    enableSynchronizeZoom ({ commit }, synchronizeZoom) {
      commit('enableSynchronizeZoom', synchronizeZoom)
    },
    enableSynchronizeCursor ({ commit }, synchronizeCursor) {
      commit('enableSynchronizeCursor', synchronizeCursor)
    },
    computeTransformResponseReceived ({commit}, { transformationMatrix, inverseMatrix, RMSE, determinant} ) {
      commit('changeLandmarkTransformationMatrix', transformationMatrix)
      commit('changeLandmarkInverseMatrix', inverseMatrix)
      commit('changeLandmarkDeterminant', determinant)
      commit('changeLandmarkRMSE', RMSE)
    },
    addLandmark ({commit, dispatch, state}, {landmark = {}}) {
      dispatch('pushUndo', {
        name: `add ${state.addLandmarkMode} landmark`
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
        commit('setIncomingLandmarks', {
          incomingLandmarks: state.incomingLandmarks.concat(newIncomingLandmark)
        })
      }
    },
    addLandmarkPair ({ commit, state }) {
      /**
       * TODO deprecated. old 2 way split method
       */
      const refId = generateId(state.referenceLandmarks).toString()
      const newReferenceLandmark = {
        id: refId,
        name: refId,
        /**
         * position in nm
         */
        coord: state.primaryNehubaNavigationPosition.map(v => v / 1e6)
      }
      const incId = generateId(state.incomingLandmarks).toString()
      const newIncomingLandmark = {
        id: incId,
        name: incId,
        coord: state.secondaryNehubaNavigationPosition.map(v => v / 1e6)
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
    removeReferenceLandmark ({commit, state}, {id}) {
      commit('setReferenceLandmarks', {
        referenceLandmarks: state.referenceLandmarks.filter(lm => lm.id !== id)
      })
    },
    removeIncomingLandmark ({commit}, {id}) {
      commit('setIncomingLandmarks', {
        incomingLandmarks: state.incomingLandmarks.filter(lm => lm.id !== id)
      })
    },
    removeLandmarkPair ({commit, state}, { id }) {
      commit('setLandmarkPairs', {
        landmarkPairs: state.landmarkPairs.filter(lm => lm.id !== id)
      })
    },
    removeLandmarkPairs ({commit}) {
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
    changeLandmarkPairName ({commit, state}, { id, name }) {
      commit('setLandmarkPairs', {
        landmarkPairs: state.landmarkPairs.map(lmp => {
          return {
            ...lmp,
            name: lmp.id === id ? name : lmp.name
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

    /**
     * primary nehuba control
     */
    setRotateIncByQuat ({commit, state}, { quaternion }) {
      const {mat4, quat, vec3} = window.export_nehuba

      /**
       * undo existing rotation
       */
      const xformMat = mat4.fromValues(...state.incTransformMatrix)
      const oldRotQuat = mat4.getRotation(quat.create(), xformMat)
      const oldAxisVec3 = vec3.create()
      const oldRotDeg = quat.getAxisAngle(oldAxisVec3, oldRotQuat)
      mat4.rotate(xformMat, xformMat, -1 * oldRotDeg, oldAxisVec3)

      /**
       * apply the new rotation
       */
      const newRotQuat = quat.fromValues(...quaternion)
      const newAxisVec3 = vec3.create()
      const newRotDeg = quat.getAxisAngle(newAxisVec3, newRotQuat)
      mat4.rotate(xformMat, xformMat, newRotDeg, newAxisVec3)

      const matrix = Array.from(xformMat)

      commit('setIncTransformMatrix', { matrix })
    },
    setRotateInc ({commit, state}, {axis, value}) {
      if (axis !== 'xyz') {
        return
      }

      const {mat4, quat, vec3} = window.export_nehuba

      const xformMat = mat4.fromValues(...state.incTransformMatrix)
      const oldQuat = mat4.getRotation(quat.create(), xformMat)
      const axisVec = vec3.create()
      const angleNum = quat.getAxisAngle(axisVec, oldQuat)
      mat4.rotate(xformMat, xformMat, -1 * angleNum, axisVec)

      const eulerArr = value
      const rotationQuat = quat.create()
      quat.fromEuler(rotationQuat, ...eulerArr)
      const newAxisVec = vec3.create()
      const newAngleNum = quat.getAxisAngle(newAxisVec, rotationQuat)
      mat4.rotate(xformMat, xformMat, newAngleNum, rotationQuat)

      const matrix = Array.from(xformMat)

      commit('setIncTransformMatrix', { matrix })
    },
    setScaleInc ({commit, state}, {axis, value}) {
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
      const xformMat = mat4.fromValues(...state.incTransformMatrix)
      const scaleVec = mat4.getScaling(vec3.create(), xformMat)
      
      const inverseVec = vec3.inverse(vec3.create(), scaleVec)
      scaleVec[idx] = value
      mat4.scale(xformMat, xformMat, inverseVec)
      mat4.scale(xformMat, xformMat, scaleVec)

      const matrix = Array.from(xformMat)
      commit('setIncTransformMatrix', { matrix })
    },
    setTranslInc ({commit, state}, {axis, value}) {
      if (axis !== 'x' && axis !== 'y' && axis !== 'z' && axis !== 'xyz') {
        return
      }
      if (Number.isNaN(value)) {
        return
      }
      const idx = axis === 'x'
        ? 0
        : axis === 'y'
          ? 1
          : axis === 'z'
            ? 2
            : null
      const {mat4, vec3} = window.export_nehuba

      /**
       * first get current transformation matrix
       */
      const xformMat = mat4.fromValues(...state.incTransformMatrix)

      /**
       * get current translate, and calculate scaled inverse to undo translate
       */
      const translVec = mat4.getTranslation(vec3.create(), xformMat)
      const inverseVec = vec3.negate(vec3.create(), translVec)
      const scaleVec = mat4.getScaling(vec3.create(), xformMat)
      vec3.divide(inverseVec, inverseVec, scaleVec)

      /**
       * set new translation array
       */
      const newTranslArray = idx === null
        ? value
        : Array.from(translVec).map((v, i) => i === idx ? value : v)

      /**
       * undo translation first
       */
      mat4.translate(xformMat, xformMat, inverseVec)

      /**
       * apply new translation
       */
      mat4.translate(xformMat, xformMat, vec3.fromValues(...newTranslArray))

      const matrix = Array.from(xformMat)
      commit('setIncTransformMatrix', { matrix })
    },
    translIncBy ({commit, state}, {axis, value}) {
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
    rotIncBy ({commit}, { quaternion }) {
      if (!quaternion) {
        return
      }
      const {quat, vec3, mat4} = window.export_nehuba
      const axis = vec3.create()
      const rotQuat = quat.fromValues(...quaternion)
      const angle = quat.getAxisAngle(axis, rotQuat)

      const xformMat = mat4.fromRotation(mat4.create(), angle, rotQuat)
      commit('multiplyIncTransmMatrix', xformMat)
    },
    startFromScratch ({dispatch, commit}) {
      commit('setReferenceLandmarks', { referenceLandmarks: [] })
      commit('setIncomingLandmarks', { incomingLandmarks: [] })
      commit('setLandmarkPairs', { landmarkPairs: [] })
      dispatch('selectIncomingVolumeWithId', null)
      commit('setUndoStack', { undoStack: [] })
      commit('setRedoStack', { redoStack: [] })
    }
  }
})

export default store