const viewerPreferenceStore = {
  namespaced: true,
  state: {
    previewImage: null,
    showOriginal: true,

    incomingColor: [252, 200, 0, 0.5],
    overlayColor: {hex: '#FCDC00', rgba: {r: 252, g: 220, b: 0, a: 1}},
  },
  mutations: {
    setPreviewImage: function (state, { previewImage }) {
      state.previewImage = previewImage
    },
    setShowOriginal: function (state, { showOriginal }) {
      state.showOriginal = showOriginal
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
    updateOverlayColor (state, newOverlayColor) {
      state.overlayColor = newOverlayColor
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
    changeOpacity ({ commit }, opacity) {
      commit('setIncomingTemplateRGBA', { opacity })
    },
  }
}

export default viewerPreferenceStore