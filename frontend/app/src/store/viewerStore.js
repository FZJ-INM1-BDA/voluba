const viewerStore = {
  namespaced: true,
  state: {
    previewImage: null,
    showOriginal: true
  },
  mutations: {
    setPreviewImage: function (state, { previewImage }) {
      state.previewImage = previewImage
    },
    setShowOriginal: function (state, { showOriginal }) {
      state.showOriginal = showOriginal
    },
  },
  actions: {
    showPreviewImage: function ({ commit }, { previewImage }) {
      commit('setPreviewImage', { previewImage })
    },
    hidePreviewImage: function ({ commit }) {
      commit('setPreviewImage', { previewImage: null })
    },
    toggleShowOriginal: function ({ commit, state }) {
      const { showOriginal } = state
      commit('setShowOriginal', {
        showOriginal: !showOriginal
      })
    }
  }
}

export default viewerStore