import { CM_MATLAB_JET } from "@/constants";

const viewerPreferenceStore = {
  namespaced: true,
  state: {
    previewImage: null,
    showOriginal: true,

    selectedColorMapIdx: null,
    lowerThreshold: 0,
    upperThreshold: 1,
    availableColorMaps: [{
      name: 'JET',
      shader:CM_MATLAB_JET
    }],

    incomingColor: [252, 200, 0, 0.5],
    overlayColor: {hex: '#FCDC00', rgba: {r: 252, g: 220, b: 0, a: 1}},
  },
  mutations: {
    setLowerThreshold(state, { lowerThreshold }) {
      state.lowerThreshold = lowerThreshold
    },
    setUpperThreshold(state, { upperThreshold }) {
      state.upperThreshold = upperThreshold
    },
    setSelectedColorMapIdx(state, { selectedColorMapIdx }){
      state.selectedColorMapIdx = selectedColorMapIdx
    },
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
    selectColorMapByName: function ({ commit, state } , { name }) {
      if (!name) return commit('setSelectedColorMapIdx', { selectedColorMapIdx: null })
      
      const { availableColorMaps } = state
      const idx = availableColorMaps.findIndex(({ name: _name }) => _name === name)
      if (idx >= 0) return commit('setSelectedColorMapIdx', { selectedColorMapIdx: idx })
    },
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
  },
  getters: {
    selectedColorMap: ({ selectedColorMapIdx, availableColorMaps }) => (selectedColorMapIdx === 0 || !!selectedColorMapIdx)
      ? availableColorMaps[selectedColorMapIdx]
      : null,
    fragmentShader: ({ lowerThreshold, upperThreshold, incomingColor }, getters) => {
      const { selectedColorMap } = getters
      const normalizedIncomingColor = incomingColor.map(v => v/255)
      switch (selectedColorMap && selectedColorMap.name) {
        case 'JET':
          return `void main(){
            float x = toNormalized(getDataValue());
            ${CM_MATLAB_JET}
            if(x>${upperThreshold.toFixed(1)}){
              emitTransparent();
            }else if (x<${lowerThreshold.toFixed(1)}){
              emitTransparent();
            }else{
              emitRGB(vec3(r,g,b));
            }
          }`
        default: return `void main() {
          float x = toNormalized(getDataValue());

          if(x>${upperThreshold.toFixed(1)}){
            emitTransparent();
          }else if (x<${lowerThreshold.toFixed(1)}){
            emitTransparent();
          }else{
            emitRGB(vec3(x * ${normalizedIncomingColor[0].toFixed(1)}, x * ${normalizedIncomingColor[1].toFixed(1)}, x * ${normalizedIncomingColor[2].toFixed(1)} ));
          }
        }`
      }
    }
  }
}

export default viewerPreferenceStore