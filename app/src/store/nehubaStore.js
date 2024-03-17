import { identityMatFlattened, convertNmToVoxel } from '../constants'
import { incompatibleBrowserText } from "@/text"

const browserCompatible = () => 'WebGL2RenderingContext' in window

const getMirrorMat = (flippedState, dim) => {
  if (! ('export_nehuba' in window)) {
    return null
  }
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

const nehubaStore = {
  namespaced: true,
  state: {
    /**
     * default: false
     * successful append: true
     * error: falsy non-false value (e.g. 0, -1 etc)
     */
    appendNehubaFlag: false,

    referenceTemplateTransform: null,

    incomingVolumeSelected: false,

    flippedState: [1, 1, 1],

    /**
     * in nm
     */
    incTransformMatrix: [...identityMatFlattened],

    incVolTranslationLock: false,
    incVolRotationLock: false,
    incVolScaleLock: false,

    // in nm
    primaryNehubaNavigationPosition: [0, 0, 0],
    secondaryNehubaNavigationPosition: [0, 0, 0],
  },
  mutations: {
    setAppendNehubaFlag ( state, { flag }) {
      state.appendNehubaFlag = flag
    },
    setReferenceTemplateTransform (state, { transform }) {
      state.referenceTemplateTransform = transform
    },
    setIncomingVolumeHighlighted (state, bool) {
      state.incomingVolumeSelected = bool
    },

    setIncTransformMatrix (state, { matrix }) {
      state.incTransformMatrix = matrix
    },
    setPrimaryNehubaNavigationPosition (state, array) {
      state.primaryNehubaNavigationPosition = array
    },
    setSecondaryNehubaNavigationPosition (state, array) {
      state.secondaryNehubaNavigationPosition = array
    },
    setFlippedState (state, { flippedState }) {
      state.flippedState = flippedState
    },
    setIncVolLoc (state, { incVolTranslationLock, incVolRotationLock, incVolScaleLock }) {
      state.incVolRotationLock = incVolRotationLock
      state.incVolTranslationLock = incVolTranslationLock
      state.incVolScaleLock = incVolScaleLock
    },
  },
  actions: {

    lockIncVol: function ({ commit, state }, { incVolTranslationLock = null, incVolRotationLock = null, incVolScaleLock = null }) {
      commit('setIncVolLoc', {
        incVolTranslationLock : incVolTranslationLock !== null ? incVolTranslationLock : state.incVolTranslationLock,
        incVolRotationLock: incVolRotationLock !== null ? incVolRotationLock : state.incVolRotationLock,
        incVolScaleLock: incVolScaleLock !== null ? incVolScaleLock : state.incVolScaleLock
      })
    },
    flipAxis ({ commit, state, dispatch }, { axis }) {
      const { flippedState: currentFlippedState, incTransformMatrix } = state
      
      const { mat4, vec3 } = window.export_nehuba

      /**
       * @type {'x' | 'y' | 'z'}
       */
      let parsedAxis = null
      if (axis === 0) {
        parsedAxis = 'x'
      }
      if (axis === 1) {
        parsedAxis = 'y'
      }
      if (axis === 2) {
        parsedAxis = 'z'
      }

      const flippedState = currentFlippedState.map((v, id) => id === axis ? v * -1 : v)

      const cXform = mat4.fromValues(...incTransformMatrix)
      const cScaling = mat4.getScaling(vec3.create(), cXform)

      cScaling[axis] *= -1 * currentFlippedState[axis]
      
      commit('setFlippedState', { flippedState })
      dispatch('setScaleInc', { axis: parsedAxis, value: cScaling[axis] })
    },
    highlightIncomingVolume ({ commit }, bool) {
      commit('setIncomingVolumeHighlighted', bool)
    }, 
    initAppendNehuba: function ({ commit, dispatch }) {
      appendNehuba()
        .then(() => commit('setAppendNehubaFlag', {flag: true}))
        .catch(e => {
          commit('setAppendNehubaFlag', {flag: 0})
          dispatch(
            'modalMessage',
            { title: 'Incompatible browser', body: incompatibleBrowserText, variant: 'danger' }, 
            { root: true }
          )
        })
    },
    rotIncBy ({ state, getters, dispatch, commit }, { quaternion }) {

      const { incTransformMatrix } = state
      if (!quaternion) {
        return
      }
      if (quaternion.some(n => Number.isNaN(n))) {
        return
      }
      const {quat, vec3, mat4} = window.export_nehuba
      
      const cXformMat = mat4.fromValues(...incTransformMatrix)

      const axis = vec3.fromValues(1, 0, 0)
      const rotQuat = quat.fromValues(...quaternion)
      // necessary to normalize?
      quat.normalize(rotQuat, rotQuat)
      const angle = quat.getAxisAngle(axis, rotQuat)
      const rotMat = mat4.fromRotation(mat4.create(), angle, rotQuat)

      /**
       * rotMat may be null if angle is zero
       */
      if (!rotMat) return

      const xformMat = mat4.create()

      if (getters.originAtCenter) {
        const centralizeMatrix = mat4.fromTranslation(mat4.create(), getters.centerVoxel.map(v => v * -1))
        const decentralizeMatrix = mat4.fromTranslation(mat4.create(), getters.centerVoxel)

        mat4.mul(xformMat, centralizeMatrix, xformMat)

        mat4.mul(
          xformMat,
          rotMat,
          xformMat)
        
        mat4.mul(xformMat, decentralizeMatrix, xformMat)
        
        mat4.mul(xformMat, cXformMat, xformMat)
        
        commit("setIncTransformMatrix", { matrix: Array.from(xformMat) })
        return
      }
      throw new Error(`non origin rotinc not yet implemented`)
    },

    setScaleInc ({ commit, state, getters }, { axis, value }) {

      const { incTransformMatrix } = state
      const { mat4, vec3, quat } = window.export_nehuba

      if (axis !== 'x' && axis !== 'y' && axis !== 'z' && axis !== "xyz") {
        return
      }
      if (Number.isNaN(value)) {
        return
      }

      const cXform = mat4.fromValues(...incTransformMatrix)
      const cRot = mat4.getRotation(quat.create(), cXform)

      /**
       * apply scale
       */
      const oldScale = mat4.getScaling(vec3.create(), cXform)
      const newScale = vec3.fromValues(1, 1, 1)

      if (axis === "x") {
        newScale[0] = value / oldScale[0]
      }
      if (axis === "y") {
        newScale[1] = value / oldScale[1]
      }
      if (axis === "z") {
        newScale[2] = value / oldScale[2]
      }
      if (axis === "xyz") {
        newScale[0] = value / oldScale[0]
        newScale[1] = value / oldScale[1]
        newScale[2] = value / oldScale[2]
      }
      const scaleMat = mat4.fromScaling(mat4.create(), newScale)

      /**
       * returning mat
       */
      const xformMat = mat4.create()
      if (getters.originAtCenter) {
        const centralizeMatrix = mat4.fromTranslation(mat4.create(), getters.centerVoxel.map(v => v * -1))
        const decentralizeMatrix = mat4.fromTranslation(mat4.create(), getters.centerVoxel)
        mat4.mul(xformMat, centralizeMatrix, xformMat)
        mat4.mul(xformMat, scaleMat, xformMat)
        mat4.mul(xformMat, decentralizeMatrix, xformMat)

        mat4.mul(xformMat, cXform, xformMat)

      }

      if (!getters.originAtCenter) {
        
        const cXlate = mat4.getTranslation(vec3.create(), cXform)
        mat4.fromRotationTranslationScale(xformMat, cRot, cXlate, newScale)
      }
      commit("setIncTransformMatrix", { matrix: Array.from(xformMat) })
    },
    setTranslInc ({commit, state}, {axis, value}) {
      const { incTransformMatrix, flippedState } = state
      if (axis !== 'x' && axis !== 'y' && axis !== 'z' && axis !== 'xyz') {
        return
      }

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
      const xformMat = mat4.fromValues(...incTransformMatrix)
      if (mIdx !== null) {
        xformMat[mIdx] = value * flippedState[vIdx]
      } else {
        xformMat[12] = value[0]
        xformMat[13] = value[1]
        xformMat[14] = value[2]
      }
      const matrix = Array.from(xformMat)
      commit('setIncTransformMatrix', { matrix })
    },
    translIncBy ({dispatch}, {axis, value}) {
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
      dispatch('multiplyIncXformMatrix', Array.from(translM))
    },
    multiplyIncXformMatrix ({ state, commit }, matrix) {
      // catch when matrix is null (happens occationally?)

      const { incTransformMatrix } = state
      const { mat4 } = window.export_nehuba

      if (!matrix) return

      const incM = mat4.fromValues(...incTransformMatrix)
      const mulM = mat4.fromValues(...matrix)
      mat4.mul(incM, incM, mulM)
      // const det = mat4.determinant(incM)

      commit('setIncTransformMatrix', { matrix: Array.from(incM) })
    },
    redrawNehuba () {
      /**
       * required for vuex event dispatch
       * used for nehuba to lsiten to layout changes
       */
    },
  },
  getters: {
    dim: (state, getters, rootState, rootGetters) => {
      return rootGetters['dataSelectionStore/selectedIncomeVolumeDim']
    },
    size: (state, getters, rootState, rootGetters) => {
      const { dataSelectionStore } = rootState
      return dataSelectionStore['selectedIncomingVolumeSize']
    },
    incRotQuat: state => {
      if (!state.appendNehubaFlag) return [0, 0, 0, 1]
      const { mat4, quat } = window.export_nehuba
      const {incTransformMatrix} = state 
      
      const incM = mat4.fromValues(...incTransformMatrix)
      const q = mat4.getRotation(quat.create(0), incM)
      quat.invert(q, q)
      return Array.from(q)
    },
    normalizedRotQuat: state => {
      if (!state.appendNehubaFlag)
        return [0, 0, 0, 1]
      
      const { quat, mat4 } = window.export_nehuba
      
      const incXM = mat4.fromValues(...state.incTransformMatrix)
      if (mat4.determinant(incXM) < 0){
        const negM = mat4.create()
        negM[0] = -1
        mat4.mul(incXM, incXM, negM)
      }
      return Array.from(mat4.getRotation(quat.create(), incXM))
    },
    incTransformMatrixReal: state => {
      const { appendNehubaFlag, incTransformMatrix } = state
      if (!appendNehubaFlag) return incTransformMatrix
      const { mat4, vec3 } = window.export_nehuba

      /**
       * problematic for now
       */
      const incM = mat4.fromValues(...incTransformMatrix)
      const transl = mat4.getTranslation(vec3.create(), incM)
      vec3.negate(transl, transl)
      const translMat = mat4.fromTranslation(mat4.create(), transl)
      mat4.mul(incM, translMat, incM)
      vec3.scale(transl, transl, -1e-6)
      mat4.fromTranslation(translMat, transl)
      mat4.mul(incM, translMat, incM)
      return Array.from(incM)
    },
    originAtCenter: () => {
      return true
    },
    centerVoxel: (state, getters, rootState, rootGetters) => {
      
      const dim = rootGetters['dataSelectionStore/selectedIncomeVolumeDim']
      const { dataSelectionStore } = rootState
      const { coordinateSpace } = dataSelectionStore
      const dimVox = convertNmToVoxel(coordinateSpace, dim, "vec3")
      return dimVox.map(v => v / 2)
    },
  },
}

export default nehubaStore