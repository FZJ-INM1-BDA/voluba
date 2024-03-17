import { UPLOAD_URL, DEFAULT_BUNDLED_INCOMING_VOLUMES_0, DEFAULT_BUNDLED_INCOMING_VOLUMES_1, processImageMetaData, identityMat, getResSize, REFERENCE_VOLUMES } from "@/constants";
import axios from 'axios'

const defaultVIds = [`colin-1`]
let DEFAULT_BUNDLED_INCOMING_VOLUMES = []

const vols = [...DEFAULT_BUNDLED_INCOMING_VOLUMES_0, ...DEFAULT_BUNDLED_INCOMING_VOLUMES_1]
DEFAULT_BUNDLED_INCOMING_VOLUMES = vols.filter(v => !defaultVIds.includes(v.id))

const dataSelectionStore = {
  namespaced: true,
  state: {

    uploadUrl: UPLOAD_URL,

    selectedReferenceVolumeId: 'ref-1',
    referenceVolumes: REFERENCE_VOLUMES,

    selectedIncomingVolumeId: null,
    selectedIncomingVolumeResolution: null,
    selectedIncomingVolumeSize: null,

    incomingVolumes: DEFAULT_BUNDLED_INCOMING_VOLUMES,

    coordinateSpace: null,
  },
  mutations: {
    setUploadUrl (state, { uploadUrl }) {
      state.uploadUrl = uploadUrl
    },
    setSelectedReferenceVolumeWithId (state, id) {
      state.selectedReferenceVolumeId = id
    },
    setSelectedIncomingVolumeId (state, id) {
      state.selectedIncomingVolumeId = id
    },
    setSelectedIncomingVolumeResolution (state, data) {
      state.selectedIncomingVolumeResolution = [...data.resolution]
      state.selectedIncomingVolumeSize = [...data.size]
    },
    setIncomingVolumes (state, { volumes }) {
      const finalVolumes = []
      for (const vol of volumes){
        const ids = new Set(finalVolumes.map(v => v.id))
        if (ids.has(vol.id)) continue
        finalVolumes.push(vol)
      }
      state.incomingVolumes = finalVolumes
    },
    setViewerCoordinateSpace (state, { coordinateSpace }) {
      state.coordinateSpace = coordinateSpace
    }
  },
  actions: {
    setViewerCoordinateSpace({ commit }, { coordinateSpace }){
      commit('setViewerCoordinateSpace', { coordinateSpace })
    },
    appendToIncomingVolumes({ commit, state }, { volumes }){
      const { incomingVolumes } = state
      const newVolumeIds = volumes.map(vol => vol.id)
      commit('setIncomingVolumes', { 
        volumes: [
          ...incomingVolumes.filter(vol => !newVolumeIds.includes(vol.id)),
          ...volumes,
        ]
       })
    },
    selectReferenceVolumeWithId ({ commit, state }, id) {
      const vol = state.referenceVolumes.find(({ id: _id }) => _id === id)
      if (vol) commit('setSelectedReferenceVolumeWithId', id)
      
    },
    selectIncomingVolumeWithId ({ commit, state, dispatch }, id) {
      const vol = state.incomingVolumes.find(({ id: _id }) => _id === id)
      if (vol) {
        /**
         * nehuba v2's transform is all kind of wacked. 
         * TODO incorporate transform 
         */
        // if (vol.extra && vol.extra.neuroglancer && vol.extra.neuroglancer.transform) {
        //   const cleansedTransform = JSON.parse(JSON.stringify(vol.extra.neuroglancer.transform))
        //   const { mat4, vec3 } = export_nehuba
        //   const matrix = mat4.fromValues( ...cleansedTransform[0], ...cleansedTransform[1], ...cleansedTransform[2], ...cleansedTransform[3])
        //   mat4.transpose(matrix, matrix)
        //   const transform = mat4.getTranslation(vec3.create(), matrix)
        //   commit(
        //     'nehubaStore/setIncTransformMatrix',
        //     { matrix },
        //     { root: true })
        // }

        dispatch('setIncomingVolumeResolution', id)

        commit('setSelectedIncomingVolumeId', id)
        const { shaderScaleFactor } = vol
        commit('viewerPreferenceStore/setShaderScaleFactor', shaderScaleFactor || 1, { root: true })
      } 
    },

    async ['setIncomingVolumeResolution'] ({ commit, state, dispatch, rootGetters }, id) {

      try {
        const vol = state.incomingVolumes.find(({ id: _id }) => _id === id)
        const { resolution, size } = await getResSize(vol.imageSource)
        commit('setSelectedIncomingVolumeResolution', {resolution, size})
      } catch (error) {
        dispatch('updateIncVolumesResult', {
          error: error ? error : null
        })
      }
    },

    updateIncVolumesResult (store, {error, message}) {
      /**
       * required for subscribe action
       */
    },
    updateIncVolumes ({ state, dispatch, rootGetters }, {error, message} = {error:null, message: null}) {
      
      const authHeader= rootGetters['authStore/authHeader']
      
      const config = {
        headers: {
          ...authHeader
        }
      }
      axios(`${state.uploadUrl}/list`, config)
        .then(({data}) => {
          const volumes = data
            .map(raw => {
              return {
                ...raw,
                uploadUrl: state.uploadUrl
              }
            })
            .map(processImageMetaData)
          const newVolumes = volumes
          
          dispatch('log', ['updateIncVolumes#axios#postprocess', newVolumes], {root: true})
          dispatch('appendToIncomingVolumes', { volumes: newVolumes })
          dispatch('updateIncVolumesResult', {
            error: error ? error : null,
            message: message ? message : 'Incoming volumes updated'
          })
        })
        .catch(e => {
          dispatch('updateIncVolumesResult', {
            error: error ? error : e,
            message: error ? message : 'GET /list error'
          })
          /**
           * should the available inc volumes be re-updated?
           */
        })
    },
    deleteIncomingVolume ({ state, dispatch, commit, rootGetters }, { id, incomingVolume}) {
      /**
       * TODO
       * check endpoint still valid
       */
      
      const authHeader= rootGetters['authStore/authHeader']
      const config = {
          method: 'DELETE',
          headers: {
            ...authHeader
          }
        }
      
      const { payload } = incomingVolume
      const link = payload && payload.links && payload.links.normalized
      dispatch('log', ['store#actions#deleteIncomingVolume', { config, id, incomingVolume, link }], {root: true})
      if (!link) {
        /**
         * link does not exist, return
         */
        return
      }
      axios(`${state.uploadUrl}${link}`, config)
        .then(() => {
          /**
           * successful delete
           */
          
          /**
           * deselect incoming volume id
           */
          commit('setSelectedIncomingVolumeId', null)

          dispatch('updateIncVolumes', {
            message: `Delete incoming volume complete.`
          })
        }).catch(error => {
          /**
           * error during delete (?)
           */
          dispatch('updateIncVolumes', {
            error,
            message: `Delete incoming volume error: ${error}`
          })
        })
    },
  },
  getters: {
    selectedReferenceVolume: state => state.referenceVolumes.find(v => v.id === state.selectedReferenceVolumeId),
    selectedIncomingVolume: state => state.incomingVolumes.find(v => v.id === state.selectedIncomingVolumeId),
    selectedReferenceVolumeId: state => state.selectedReferenceVolumeId,
    referenceVolumes: state => state.referenceVolumes,
    selectedIncomingVolumeType: (state, getters) => {
      const volume = getters.selectedIncomingVolume || {}
      const { extra } = volume || {}
      const { neuroglancer } = extra || {}
      const { type = 'image' } = neuroglancer || {}
      return type
    },
    selectedIncomeVolumeDim: (state) => {
      const { selectedIncomingVolumeSize: size, selectedIncomingVolumeResolution: res } = state
      return [0, 1, 2].map(idx => size[idx] * res[idx])
    }
  }
}

export default dataSelectionStore