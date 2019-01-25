
import { randomColor, generateId } from '@/components/constants'
import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    appendNehubaPromise: new Promise((resolve, reject) => {
      if ('export_nehuba' in window) {
        resolve()
      } else {
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
    }),

    activeStepIndex: 0,

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
    incomingVolumeSelected: false,
    incTransformMatrix: [
      1.0,  0,    0,    0,
      0,    1.0,  0,    0,
      0,    0,    1.0,  0,
      0,    0,    0,    1.0
    ],

    overlayColor: {hex: '#FCDC00', rgba: {r: 252, g: 220, b: 0, a: 1}},
    // in nm
    primaryNehubaNavigationPosition: [0, 0, 0],
    secondaryNehubaNavigationPosition: [0, 0, 0],
    viewerMousePosition: [0, 0, 0],
    viewerSliceOrientation: [0, 0, 0, 1],
    mouseoverUserlayer: null,

    referenceLandmarks: [],
    incomingLandmarks: [],
    landmarkPairs: [],

    synchronizeZoom: false,
    synchronizeCursor: false,
    previewMode: false,
    backendURL: process.env.VUE_APP_BACKEND_URL || 'http://localhost:5000/api',

    /**
     * response from landmark-reg server
     */
    landmarkTransformationMatrix: null,
    landmarkInverseMatrix: null,
    landmarkDeterminant: null,
    landmarkRMSE: null
  },
  mutations: {
    selectReferenceTemplate (state, refTemplate) {
      state.referenceTemplate = refTemplate
    },
    setReferenceTemplateTransform (state, { transform }) {
      state.referenceTemplateTransform = transform
    },
    setReferenceIncomingVolume (state, index) {
      state.selectReferenceVolumeIdx = index
    },
    setSelectedReferenceVolumeWithId (state, id) {
      state.selectedReferenceVolumeId = id
    },
    setSelectedIncomingVolumeId (state, id) {
      state.selectedIncomingVolumeId = id
    },
    setIncomingTransformMatrix (state, array) {
      state.incomingTransformMatrix = array
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
    setIncomingTemplateScale (state, array) {
      state.incomingScale = array
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
    flipLeftRight (state) {
      // TODO: implement
      console.log('flip l/r')
    },
    flipInferiorSuperior (state) {
      // TODO: implement
      console.log('flip i/s')
    },
    flipAnteriorPosterior (state) {
      // TODO: implement
      console.log('flip a/p')
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
    removeReferenceLandmark  (state, { id }) {
      state.referenceLandmarks = state.referenceLandmarks.filter(lm => lm.id !== id)
    },
    commitReferenceLandmarks  (state, { newReferenceLandmarks }) {
      state.referenceLandmarks = newReferenceLandmarks
    },
    removeAllReferenceLandmarks (state) {
      state.referenceLandmarks = []
    },
    commitIncomingLandmark (state, { newIncomingLandmark }) {
      state.incomingLandmarks.push(newIncomingLandmark)
    },
    removeIncomingLandmark  (state, { id }) {
      state.incomingLandmarks = state.incomingLandmarks.filter(lm => lm.id !== id)
    },
    commitIncomingLandmarks  (state, { newIncomingLandmarks }) {
      state.incomingLandmarks = newIncomingLandmarks
    },
    removeAllIncomingLandmarks (state) {
      state.incomingLandmarks = []
    },
    commitLandmarkPair (state, { newLandmarkPair }) {
      state.landmarkPairs.push(newLandmarkPair)
    },
    removeLandmarkPair (state, { id }) {
      state.landmarkPairs = state.landmarkPairs.filter(lm => lm.id !== id)
    },
    commitLandmarkPairs (state, { newLandmarkPairs }) {
      state.landmarkPairs = newLandmarkPairs
    },
    removeAllLandmarkPairs (state) {
      state.landmarkPairs = []
    },
    enableLandmarkPairs (state, { enable }) {
      state.landmarkPairs = state.landmarkPairs.map(lmp => {
        return {
          ...lmp,
          active: enable
        }
      })
    },
    resetReferenceLandmark (state, { id }) {
      const lm = state.referenceLandmarks.find(lm => lm.id === id)
      lm.coord = state.primaryNehubaNavigationPosition.map(v => v / 1e6)
    },
    resetIncomingLandmark (state, { id }) {
      const lm = state.incomingLandmarks.find(lm => lm.id === id)
      lm.coord = state.secondaryNehubaNavigationPosition.map(v => v / 1e6)
    },
    setLandmarkPairName (state, {id, name}) {
      const pair = state.landmarkPairs.find(pair => pair.id === id)
      pair.name = name
    },
    setLandmarkPairActive (state, { id, active }) {
      const pair = state.landmarkPairs.find(pair => pair.id === id)
      pair.active = active
    },
    setIncTransformMatrix (state, matrix) {
      state.incTransformMatrix = matrix
    }
  },
  actions: {
    selectReferenceVolumeWithId ({commit}, id) {
      commit('setSelectedReferenceVolumeWithId', id)
    },
    selectReferenceVolumeWithIndex ({commit}, index) {
      commit('setReferenceIncomingVolume', index)
    },
    selectIncomingVolume ({ commit, state }, id) {
      const index = id === null
        ? null
        : state.incomingVolumes.findIndex(v => v.id === id)
      commit('setIncomingVolume', index)
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
    selectStep ({ commit }, index) {
      commit('selectStep', index)
    },
    prevStep ({ commit, state }) {

      commit('selectStep', state.activeStepIndex - 1)
    },
    nextStep ({ commit, state, ...rest }) {
      console.log(rest)
      commit('selectStep', state.activeStepIndex + 1)
    },
    toggleSidebar ({ dispatch, commit, state }) {
      commit(state.sidebarCollapse
        ? 'showSidebar'
        : 'hideSidebar')
      setTimeout(() => dispatch('redrawNehuba'))
    },
    setSidebarCollapseState ({ dispatch, commit }, bool) {
      commit(bool
        ? 'hideSidebar'
        : 'showSidebar')
      setTimeout(() => dispatch('redrawNehuba'))
    },
    changeSidebarWidth ({ commit }, size) {
      commit('changeSidebarWidth', size)
    },
    selectMethodIndex (store, index) {
      store.commit('selectMethodIndex', index)
    },
    changeScale ({ commit }, newScale) {
      commit('setIncomingTemplateScale', newScale)
    },
    flipLeftRight ({ commit }) {
      commit('flipLeftRight')
    },
    flipInferiorSuperior ({ commit }) {
      commit('flipInferiorSuperior')
    },
    flipAnteriorPosterior ({ commit }) {
      commit('flipAnteriorPosterior')
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
    enablePreviewMode ({ commit }, previewMode) {
      commit('enablePreviewMode', previewMode)
      commit(previewMode
        ? 'hideSidebar'
        : 'showSidebar')
    },
    changeLandmarkTransformationMatrix ({ commit }, transformationMatrix) {
      commit('changeLandmarkTransformationMatrix', transformationMatrix)
    },
    changeLandmarkInverseMatrix ({ commit }, inverseMatrix) {
      commit('changeLandmarkInverseMatrix', inverseMatrix)
    },
    changeLandmarkDeterminant ({ commit }, determinant) {
      commit('changeLandmarkDeterminant', determinant)
    },
    changeLandmarkRMSE ({ commit }, newRMSE) {
      commit('changeLandmarkRMSE', newRMSE)
    },
    addLandmarkPair ({ commit, state }) {
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
      commit('removeAllReferenceLandmarks')
      commit('removeAllIncomingLandmarks')
      commit('removeAllLandmarkPairs')
    },
    enableLandmarkPairs ({commit, state}, {enable}) {
      commit('enableLandmarkPairs', { enable })
    },
    toggleLandmarkPairActive ({ commit, state }, { id }) {
      const landmarkPair = state.landmarkPairs.find(pair => pair.id === id)
      if (landmarkPair) {
        commit('setLandmarkPairActive', {
          id,
          active: !landmarkPair.active
        })
      }
    },
    changeLandmarkPairName ({commit, state}, { id, name }) {
      const landmarkPair = state.landmarkPairs.find(pair => pair.id === id)
      if (landmarkPair) {
        commit('setLandmarkPairName', {
          id,
          name
        })
      }
    },
    loadOldJson ({ commit, state }, { json, config }) {
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
          active: true
        }
      })

      commit('commitReferenceLandmarks', { newReferenceLandmarks })
      commit('commitIncomingLandmarks', { newIncomingLandmarks })
      commit('commitLandmarkPairs', { newLandmarkPairs })
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

      commit('setIncTransformMatrix', Array.from(xformMat))
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
      commit('setIncTransformMatrix', Array.from(xformMat))
    },
    setTranslInc ({commit, state}, {axis, value}) {
      if (axis !== 'x' && axis !== 'y' && axis !== 'z') {
        return
      }
      if (Number.isNaN(value)) {
        return
      }
      const idx = axis === 'x'
        ? 0
        : axis === 'y'
          ? 1
          : 2
      const {mat4, vec3} = window.export_nehuba
      const xformMat = mat4.fromValues(...state.incTransformMatrix)
      const translVec = mat4.getTranslation(vec3.create(), xformMat)
      const inverseVec = vec3.negate(vec3.create(), translVec)
      translVec[idx] = value
      mat4.translate(xformMat, xformMat, inverseVec)
      mat4.translate(xformMat, xformMat, translVec)
      commit('setIncTransformMatrix', Array.from(xformMat))
    }
  }
})

export default store