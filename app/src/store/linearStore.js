import { getBackendLandmarkPairs, computeDeterminant } from '@/constants';
import axios from 'axios'

const linearStore = {
  namespaced: true,
  state: {

    /**
     * response from landmark-reg server
     */
    landmarkTransformationMatrix: null,
    landmarkInverseMatrix: null,
    landmarkDeterminant: null,
    landmarkRMSE: null,

    backendQueryInProgress: false,
    backendQueryError: null,

    selectedTransformationIndex: 0,
    transformationTypes: [
      { id: '1', text: 'Rigid', value: 'rigid' },
      { id: '2', text: 'Rigid (allow reflection)', value: 'rigid+reflection' },
      { id: '3', text: 'Similarity', value: 'similarity' },
      { id: '4', text: 'Similarity (allow reflection)', value: 'similarity+reflection' },
      { id: '5', text: 'Affine', value: 'affine' }
    ],
  },
  mutations: {
    setBackendQueryInProgress (state, { backendQueryInProgress }) {
      state.backendQueryInProgress = backendQueryInProgress
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
    setMethodIndex (state, index) {
      state.selectedTransformationIndex = index
    },
    setBackendQueryError (state, { error }) {
      state.backendQueryError = error
    },
  },
  actions: {
    computeXform ({ commit, state, rootState, dispatch, rootGetters }) {
      const { backendQueryInProgress } = state

      const { landmarksStore } = rootState
      const { landmarkPairs } = landmarksStore

      const selectedIncomingVolume = rootGetters['dataSelectionStore/selectedIncomingVolume']
      const selectedReferenceVolume = rootGetters['dataSelectionStore/selectedReferenceVolume']

      if (landmarkPairs.length < 3) return
      
      if ( backendQueryInProgress ) return

      const lmPairs = getBackendLandmarkPairs(landmarksStore)
      
      const data = {
        'source_image': selectedReferenceVolume.imageSource, // TODO update
        'target_image': selectedIncomingVolume.imageSource, // TODO update
        'transformation_type': state.transformationTypes[state.selectedTransformationIndex].value,
        'landmark_pairs': lmPairs
      }

      commit('setBackendQueryInProgress', { backendQueryInProgress : true })
      commit('setBackendQueryError', { error: null })

      dispatch('log', ['sending data to backend...', {data}], {root: true})
      axios.post(rootState.backendURL + '/least-squares', data)
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

          dispatch('pushUndo', { name: 'apply calculated transform' }, {root: true})
          commit('setBackendQueryInProgress', { backendQueryInProgress : false})
          dispatch('applyCalculatedTransform')          
        }, error => {
          commit('setBackendQueryInProgress', { backendQueryInProgress : false})
          commit('setBackendQueryError', { error })
        })
    },
    computeTransformResponseReceived ({commit}, { transformationMatrix, inverseMatrix, RMSE, determinant} ) {
      commit('changeLandmarkTransformationMatrix', transformationMatrix)
      commit('changeLandmarkInverseMatrix', inverseMatrix)
      commit('changeLandmarkDeterminant', determinant)
      commit('changeLandmarkRMSE', RMSE)
    },
    applyCalculatedTransform ({ commit, state }) {

      const { mat4 } = window.export_nehuba
      const { landmarkInverseMatrix } = state
      
      const flattenedMatrix = landmarkInverseMatrix.flatMap((arr, arrI) => arr.map((v, elIdx) => elIdx === 3 && arrI !== 3 ? v * 1e6 : v ))
      const transposedM = mat4.transpose(mat4.create(), mat4.fromValues(...flattenedMatrix))

      const matrix = Array.from(transposedM)
      commit('nehubaStore/setIncTransformMatrix', { matrix }, {root: true})
    },
    selecMethodViaValue ({ commit, state }, { value }) {
      const { transformationTypes } = state
      const idx = transformationTypes.findIndex(({ value: _value }) => _value === value)
      if (idx >= 0) commit('setMethodIndex', idx)
    }
  },
  getters: {
    selectedTransformationType: function (state) {
      const {
        selectedTransformationIndex,
        transformationTypes
      } = state
      return transformationTypes[selectedTransformationIndex]
    }
  }
}

export default linearStore