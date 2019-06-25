import { NONLINEAR_BACKEND, volumeIsDepthMap } from '@/constants'

const nonLinear = {
  namespaced: true,
  state: {
    nonLinearBackendUrl: NONLINEAR_BACKEND,
    selectedDepthMapId: null,
  },
  mutations: {
    setSelectedDepthMapId (state, { id }) {
      state.selectedDepthMapId = id
    },
  },
  actions: {
    selectDepthMap: function ({ commit, dispatch }, { depthMap }) {
      dispatch('updateIncVolumes', {}, { root: true })
      const { id } = depthMap
      commit('setSelectedDepthMapId', { id })
    },
  },
  getters: {
    filteredForDepthMaps: function (_state, _getters, rootState) {
      const { incomingVolumes } = rootState
      return incomingVolumes.map(v => {
        return {
          ...v,
          isDepthMap: volumeIsDepthMap(v)
        }
      })
    },
    selectedDepthMap: function (state, getters) {
      const { filteredForDepthMaps } = getters
      const { selectedDepthMapId } = state
      return filteredForDepthMaps.find(({ id }) => id === selectedDepthMapId ) || null
    }
  }
}

export default nonLinear