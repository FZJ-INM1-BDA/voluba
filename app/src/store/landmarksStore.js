import { generateId, randomColor } from '@/constants'
import { saveToFile, EXPORT_LANDMARKS_TYPE } from '@/constants'

const landmarksStore = {
  namespaced: true,
  state: {
    addLandmarkMode: false,
    referenceLandmarks: [],
    incomingLandmarks: [],
    landmarkPairs: [],

    pairLandmarkStartDragging: false,
  },
  mutations: {
    setPairLandmarkStartDragging (state, { pairLandmarkStartDragging }){
      state.pairLandmarkStartDragging = pairLandmarkStartDragging
    },
    /**
     * TODO
     * fix inconsistency
     */
    setLandmarkMode (state, { mode }) {
      state.addLandmarkMode = mode
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

      const { nehubaStore, referenceLandmarks } = state
      const { primaryNehubaNavigationPosition } = nehubaStore

      const lm = referenceLandmarks.find(lm => lm.id === id)
      lm.coord = primaryNehubaNavigationPosition.map(v => v / 1e6)
    },
    resetIncomingLandmark (state, { id }) {
      const lm = state.incomingLandmarks.find(lm => lm.id === id)
      lm.coord = state.secondaryNehubaNavigationPosition.map(v => v / 1e6)
    },
    setRefLandmark (state, { id, lm: newLm }) {
      state.referenceLandmarks = state.referenceLandmarks.map(lm => lm.id === id ? newLm : lm)
    },
    setIncLandmark (state, {id, lm: newLm}) {
      state.incomingLandmarks = state.incomingLandmarks.map(lm => lm.id === id ? newLm : lm)
    }
  },
  actions: {
    loadLandmarks ({ dispatch }) {
      dispatch('openModal', {modalId: 'loadLandmarkPairsModal'}, {root: true})
    },
    saveLandmarks ({ state, dispatch, rootGetters }) {

      const refVol = rootGetters['dataSelectionStore/selectedReferenceVolume']
      const incVol = rootGetters['dataSelectionStore/selectedIncomingVolume']

      const {
        referenceLandmarks,
        incomingLandmarks,
        landmarkPairs
      } = state
      const data = {
        reference_volume: (refVol && refVol.name) || 'Untitled Reference Volume',
        incoming_volume: (incVol && incVol.name) || 'Untitled Incoming Volume',
        reference_landmarks: referenceLandmarks,
        incoming_landmarks: incomingLandmarks,
        landmark_pairs: landmarkPairs,
        ['@type']: EXPORT_LANDMARKS_TYPE
      }
      dispatch('log', ['store#actions#saveLandMarks', { data }], { root: true })
      const jsonData = JSON.stringify(data, null, 2)
      saveToFile(jsonData, 'application/json', 'landmark-pairs.json')
    },
    changeLandmarkMode: function ({ state, commit, dispatch, rootState }, { mode }) {
      if (!mode) {
        const {
          landmarkPairs,
          referenceLandmarks,
          incomingLandmarks
        } = state
        const pairedRefLmId = new Set(landmarkPairs.map(lm => lm.refId))
        const pairedIncLmId = new Set(landmarkPairs.map(lm => lm.incId))
        const refLmTobePruned = referenceLandmarks.filter(lm => !pairedRefLmId.has(lm.id))
        const incLmTobePruned = incomingLandmarks.filter(lm => !pairedIncLmId.has(lm.id))
        if(refLmTobePruned.length > 0 || incLmTobePruned.length > 0) {
          dispatch('pushUndo', {
            name: 'pruning unpaired landmarks'
          }, {
            root: true
          })
          if (incLmTobePruned.length > 0) {
            const incLmSet = new Set(incLmTobePruned.map(lm => lm.id))
            commit('setIncomingLandmarks', {
              incomingLandmarks: incomingLandmarks.filter(lm => !incLmSet.has(lm.id))
            })
          }
          if (refLmTobePruned.length > 0) {
            const refLmSet = new Set(refLmTobePruned.map(lm => lm.id))
            commit('setReferenceLandmarks', {
              referenceLandmarks: referenceLandmarks.filter(lm => !refLmSet.has(lm.id))
            })
          }
        }
      }
      commit('setLandmarkMode', { mode })
    },
    addLandmark ({commit, dispatch, state, rootState}, {landmark = {}}) {
      const {
        landmarkPairs,
        addLandmarkMode,
        referenceLandmarks,
        incomingLandmarks
      } = state

      const { nehubaStore } = rootState
      const {
        primaryNehubaNavigationPosition,
        incTransformMatrix
      } = nehubaStore

      dispatch('pushUndo', {
        name: `add ${addLandmarkMode} landmark`,
        /**
         * otherwise, when user undo the adding of reference lm,
         * addlandmarkmode will continue to be 'reference'
         */
        overwrite: addLandmarkMode === 'reference'
          ? { addLandmarkMode: false }
          : addLandmarkMode === 'incoming'
            ? { addLandmarkMode: 'incoming' }
            : {}
      }, {
        root: true
      })
      if (addLandmarkMode === 'reference') {
        const refId = generateId(referenceLandmarks).toString()
        const newReferenceLandmark = {
          id: refId,
          name: refId,
          /**
           * position in nm
           */
          coord: primaryNehubaNavigationPosition.map(v => v / 1e6),
          active: true,
          ...landmark
        }
        commit('setLandmarkMode', {
          mode: 'incoming'
        })
        commit('setReferenceLandmarks', {
          referenceLandmarks: referenceLandmarks.concat(newReferenceLandmark)
        })
      } else if (addLandmarkMode === 'incoming') {
        /**
         * currently, only way addLandmark action is triggered is in overlay mode
         * as a result, we need to calculate the actual coord, from primary nehuba navigation to inc vol space
         */
        const {mat4, vec3 } = window.export_nehuba

        const coord = (landmark.coord && landmark.coord.map(v => v * 1e6)) || primaryNehubaNavigationPosition
        const xform = mat4.fromValues(...incTransformMatrix)
        mat4.invert(xform, xform)
        const pos = vec3.fromValues(...coord)
        vec3.transformMat4(pos, pos, xform)

        const incId = generateId(incomingLandmarks).toString()
        const newIncomingLandmark = {
          id: incId,
          name: incId,
          active: true,
          coord: Array.from(pos).map(v => v / 1e6)
        }
        const refLm = referenceLandmarks.find(lm => landmarkPairs.findIndex(lmp => lmp.refId === lm.id) < 0)
        if (refLm) {
          const id = generateId(landmarkPairs)
          const newLmp = {
            id,
            refId: refLm.id,
            incId,
            name: id,
            active: true,
            color: randomColor()
          }
          commit('setLandmarkPairs', {
            landmarkPairs: landmarkPairs.concat(newLmp)
          })
        }
        commit('setLandmarkMode', {
          mode: false
        })
        commit('setIncomingLandmarks', {
          incomingLandmarks: incomingLandmarks.concat(newIncomingLandmark)
        })
      }
    },
    hoverLandmarkPair ({ commit, state }, { id, refId, incId, hover}){

      const {
        landmarkPairs
      } = state

      const lmp = landmarkPairs.find(lmp => lmp.id === id || lmp.refId === refId || lmp.incId === incId)
      if (lmp)
        commit('setLandmarkPairs', {
          landmarkPairs: landmarkPairs.map(pair => pair.id === lmp.id
            ? {
              ...pair,
              hover
            }
            : pair)
        })
    },
    addLandmarkPair ({ commit, dispatch, state, rootState }) {
      dispatch('pushUndo', {
        name: `add ref inc landmark pair`
      }, {
        root: true
      })

      const { 
        referenceLandmarks,
        incomingLandmarks,
        landmarkPairs
      } = state
      const { nehubaStore } = rootState
      const { 
        primaryNehubaNavigationPosition,
        secondaryNehubaNavigationPosition,
        incTransformMatrix 
      } = nehubaStore
      /**
       * TODO deprecated. old 2 way split method
       */
      const refId = generateId(referenceLandmarks).toString()
      const newReferenceLandmark = {
        id: refId,
        name: refId,
        active: true,
        /**
         * position in nm
         */
        coord: primaryNehubaNavigationPosition.map(v => v / 1e6)
      }
      const incId = generateId(state.incomingLandmarks).toString()

      const { mat4, vec3 } = window.export_nehuba
      const xform = mat4.fromValues(...incTransformMatrix)
      mat4.invert(xform, xform)
      const newv = vec3.transformMat4(vec3.create(), vec3.fromValues(...secondaryNehubaNavigationPosition), xform)
      vec3.scale(newv, newv, 1e-6)
      const newCoord = Array.from(newv)
      
      const newIncomingLandmark = {
        id: incId,
        name: incId,
        active: true,
        coord: newCoord
      }
      const lpId = generateId(landmarkPairs).toString()
      const newLandmarkPair = {
        id: lpId,
        refId: refId,
        incId: incId,
        color: randomColor(),
        name: lpId,
        active: true
      }

      commit('setReferenceLandmarks', {
        referenceLandmarks: referenceLandmarks.concat(newReferenceLandmark)
      })
      commit('setIncomingLandmarks', {
        incomingLandmarks: incomingLandmarks.concat(newIncomingLandmark)
      })
      commit('setLandmarkPairs', {
        landmarkPairs: landmarkPairs.concat(newLandmarkPair)
      })
    },
    removeLmsLmp ({commit, dispatch, state}, { id }) {

      const {
        landmarkPairs: storeLandmarkPairs,
        referenceLandmarks: storeReferenceLandmarks,
        incomingLandmarks: storeIncomingLandmarks
      } = state
      const lmp = storeLandmarkPairs.find(lm => lm.id === id)

      if (!lmp)
        return
      
      dispatch('pushUndo', {
        name: `remove landmark pairs ${lmp.name}`
      })
      
      const landmarkPairs = storeLandmarkPairs.filter(lmp => lmp.id !== id)
      const referenceLandmarks = storeReferenceLandmarks.filter(lm => lm.id !== lmp.refId)
      const incomingLandmarks = storeIncomingLandmarks.filter(lm => lm.id !== lmp.incId)

      commit('setLandmarkPairs', { landmarkPairs })
      commit('setReferenceLandmarks', { referenceLandmarks })
      commit('setIncomingLandmarks', { incomingLandmarks })
    },
    removeAllLmsLmps ({ commit, dispatch }) {
      dispatch('pushUndo', {
        name: 'remove all landmarks and landmark pairs'
      }, {
        root: true
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
    toggleLandmarkPairActive ({ commit, state }, { id }) {
      const { landmarkPairs } = state
      commit('setLandmarkPairs', {
        landmarkPairs: landmarkPairs.map(lmp => {
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
      }, {
        root: true
      })

      const { 
        referenceLandmarks,
        incomingLandmarks
      } = state

      if (volume === 'reference') {
        commit('setReferenceLandmarks', {
          referenceLandmarks: referenceLandmarks.map(lm => lm.id === id 
            ? {
              ...lm,
              name
            }
            : lm)
        })
      }
      if (volume === 'incoming') {
        commit('setIncomingLandmarks', {
          incomingLandmarks: incomingLandmarks.map(lm => lm.id === id
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
      }, {
        root: true
      })

      const { landmarkPairs } = state
      commit('setLandmarkPairs', {
        landmarkPairs: landmarkPairs.map(lmp => {
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


    addLmp: function ({commit, dispatch, state}, { refId, incId }) {

      dispatch('pushUndo', {
        name: 'link landmark pair'
      }, {
        root: true
      })
      
      const {
        landmarkPairs
      } = state

      const id = generateId(landmarkPairs)
      commit('setLandmarkPairs', {
        landmarkPairs: landmarkPairs.concat({
          refId,
          incId,
          id,
          name: id,
          color: randomColor()
        })
      })
    },
    gotoLm: function ({dispatch, state, rootState}, {volume, id}) {

      const {
        referenceLandmarks,
        incomingLandmarks
      } = state

      const {
        nehubaStore,
        _step2Mode
      } = rootState

      const { incTransformMatrix } = nehubaStore

      const payload = {}
      if (volume === 'reference') {
        const refLm = referenceLandmarks.find(lm => lm.id === id)
        if (!refLm)
          return
        payload.coord = refLm.coord
      }
      if (volume === 'incoming') {
        const {vec3, mat4} = window.export_nehuba
        const incLm = incomingLandmarks.find(lm => lm.id === id)
        if (!incLm)
          return
        const incXform = mat4.fromValues(...incTransformMatrix)
        const coord = vec3.fromValues(...incLm.coord.map(v => v * 1e6))
        vec3.transformMat4(coord, coord, incXform)
        payload.coord = Array.from(coord).map(v => v / 1e6)
      }

      if (payload.coord) {
        if (_step2Mode === 'overlay' || volume === 'reference') {
          dispatch('setPrimaryNehubaNavigation', payload, {root: true})
        } 
        if (_step2Mode === 'classic' && volume === 'incoming') {
          dispatch('setSecondaryNehubaNavigation', payload, {root: true})
        }
      }
        
    },
    removeLmp: function ({commit, dispatch, state}, { id, incId, refId }) {
      dispatch('pushUndo', {
        name: `unlink landmark pair`
      }, {
        root: true
      })

      const {
        landmarkPairs: storeLandmarkPairs,
        referenceLandmarks,
        incomingLandmarks
      } = state

      const landmarkPairs = storeLandmarkPairs.filter(lmp => !(
        id && lmp.id === id ||
        incId && lmp.incId === incId ||
        refId && lmp.refId === refId
      ))

      commit('setLandmarkPairs', { landmarkPairs })

      /**
       * also prune the ref/inc lmp
       */
      const pairedRefLmId = new Set(storeLandmarkPairs.map(lm => lm.refId))
      const pairedIncLmId = new Set(storeLandmarkPairs.map(lm => lm.incId))
      const refLmTobePruned = referenceLandmarks.filter(lm => !pairedRefLmId.has(lm.id))
      const incLmTobePruned = incomingLandmarks.filter(lm => !pairedIncLmId.has(lm.id))

      if (incLmTobePruned.length > 0) {
        const incLmSet = new Set(incLmTobePruned.map(lm => lm.id))
        commit('setIncomingLandmarks', {
          incomingLandmarks: incomingLandmarks.filter(lm => !incLmSet.has(lm.id))
        })
      }
      if (refLmTobePruned.length > 0) {
        const refLmSet = new Set(refLmTobePruned.map(lm => lm.id))
        commit('setReferenceLandmarks', {
          referenceLandmarks: referenceLandmarks.filter(lm => !refLmSet.has(lm.id))
        })
      }
    },
    removeAllLm: function ({ commit, dispatch }, { volume }) {
      dispatch('pushUndo', {
        name: `remove all ${volume} landmark`
      }, {
        root: true
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
      }, {
        root: true
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

      dispatch('pushUndo', {
        name: `remove ${volume} landmark`
      }, {
        root: true
      })

      let lmPair = {}

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
    translateLandmarkPosBy ({commit, dispatch, state}, { volume, id, value}) {
      const lm = volume === 'reference'
        ? state.referenceLandmarks.find(lm => lm.id === id)
        : volume === 'incoming'
          ? state.incomingLandmarks.find(lm => lm.id === id)
          : null

      if (!lm) return

      dispatch('pushUndo', {
        name: `translating ${lm.name} in ${volume}`,
        collapse: `translating ${lm.name} in ${volume}`
      }, {
        root: true
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
    /**
     * TODO perhaps temporary solution
     * temporary 
     */
    
    loadOldJson ({ commit, dispatch, state, rootState }, { json, config }) {
      const { fixCenterTranslation } = config
      const { vec3, mat4 } = window.export_nehuba

      const { nehubaStore } = rootState
      const { referenceTemplateTransform } = nehubaStore
      const arrayMat4 = referenceTemplateTransform
        ? referenceTemplateTransform.flatMap((arr, i) => arr.map((v, idx) => (i === 3 || idx !== 3) ? v : v / 1e6))
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
      }, {
        root: true
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
        dispatch('log', ['store#actions#gotoLandmark', { ref, inc }], { root: true})
        dispatch('setPrimaryNehubaNavigation', ref, {root: true})
        dispatch('setSecondaryNehubaNavigation', inc, {root: true})
      }
    },
  }
}

export default landmarksStore