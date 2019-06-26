

const getStateSnapshot = ({ landmarksStore,  incTransformMatrix }) => {
  const { addLandmarkMode,referenceLandmarks, incomingLandmarks, landmarkPairs } = landmarksStore
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
    commit('setIncTransformMatrix', { 
      matrix: incTransformMatrix 
    }, {
      root: true
    })
  }
  if ( referenceLandmarks ) {
    commit('landmarksStore/setReferenceLandmarks', {
      referenceLandmarks
    }, {
      root: true
    })
  }
  if ( incomingLandmarks ) {
    commit('landmarksStore/setIncomingLandmarks', {
      incomingLandmarks
    }, {
      root: true
    })
  }
  if ( landmarkPairs ) {
    commit('landmarksStore/setLandmarkPairs', {
      landmarkPairs
    }, {
      root: true
    })
  }
  commit('landmarksStore/setLandmarkMode', {
    mode: addLandmarkMode
  }, {
    root: true
  })
}

const undoStore = {
  namespaced: true, 
  state: {
    undoStack: [],
    redoStack: [],
  },
  mutations: {
    setUndoStack (state, { undoStack }) {
      state.undoStack = undoStack
    },
    setRedoStack (state, { redoStack }) {
      state.redoStack = redoStack
    },
  },
  actions: {
    pushUndo: {
      root: true,
      handler: function ({ commit, state, rootState }, { name, desc, collapse, overwrite = {} }) {

        /**
         * items with the same collapseId will not generate a new undo stack 
         */
        const { undoStack } = state
        if (collapse && undoStack.length > 0 && undoStack.slice(-1)[0].collapse === collapse) return

        const stateSnapshot = getStateSnapshot({
          ...rootState,
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
        const newUndoStack = undoStack
          .map(({ collapse, ...rest }) => rest)
          .concat(undoItem)
        commit('setUndoStack', { undoStack: newUndoStack })
        commit('setRedoStack', { redoStack: [] })
      }
    },
    undo: function ({ commit, state, rootState }) {

      const { undoStack, redoStack } = state

      if (undoStack.length === 0) {
        /**
         * nothing in the undo stack
         */
        return
      }

      /**
       * collapse state is not to be pushed onto the redo stack
       */
      const {id, state: _state, collapse, ...rest} = undoStack.slice(-1)[0]

      const stateSnapshot = getStateSnapshot(rootState)

      const newRedoItem = {
        id: Date.now(),
        state: stateSnapshot,
        ...rest
      }

      const newRedoStack = redoStack.concat(newRedoItem)
      const newUndoStack = undoStack.slice(0, -1)

      restoreState({commit}, _state)
      
      commit('setUndoStack', { undoStack: newUndoStack })
      commit('setRedoStack', { redoStack: newRedoStack })
    },
    redo: function ({ commit, state, rootState }) {
      const { redoStack, undoStack } = state
      if (redoStack.length === 0) {
        return
      }

      const {id, state: _state, ...rest} = redoStack.slice(-1)[0]

      const stateSnapshot = getStateSnapshot(rootState)

      const newUndoItem = {
        id: Date.now(),
        state: stateSnapshot,
        ...rest
      }

      const newUndoStack = undoStack.concat(newUndoItem)
      const newRedoStack = redoStack.slice(0, -1)

      restoreState({commit}, _state)

      commit('setUndoStack', { undoStack: newUndoStack })
      commit('setRedoStack', { redoStack: newRedoStack })
    }
  }
}

export default undoStore