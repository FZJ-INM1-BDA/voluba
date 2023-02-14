import { UPLOAD_URL, DEFAULT_BUNDLED_INCOMING_VOLUMES_0, DEFAULT_BUNDLED_INCOMING_VOLUMES_1, processImageMetaData } from "@/constants";
import axios from 'axios'

const DEFAULT_BUNDLED_INCOMING_VOLUMES = process.env.NODE_ENV === 'production'
? DEFAULT_BUNDLED_INCOMING_VOLUMES_0
: DEFAULT_BUNDLED_INCOMING_VOLUMES_0.concat(DEFAULT_BUNDLED_INCOMING_VOLUMES_1)

const dataSelectionStore = {
  namespaced: true,
  state: {

    uploadUrl: UPLOAD_URL,

    selectedReferenceVolumeId: 'ref-1',
    referenceVolumes: [
      {
        id: 'ref-1',
        name: 'BigBrain (2015)',
        imageSource: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image'
      }
    ],

    selectedIncomingVolumeId: null,
    selectedIncomingVolumeResolution: null,

    incomingVolumes: DEFAULT_BUNDLED_INCOMING_VOLUMES,
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
    setSelectedIncomingVolumeResolution (state, resolution) {
      state.selectedIncomingVolumeResolution = resolution
    },
    setIncomingVolumes (state, { volumes }) {
      state.incomingVolumes = volumes
    },
  },
  actions: {
    selectReferenceVolumeWithId ({ commit, state }, id) {
      const vol = state.referenceVolumes.find(({ id: _id }) => _id === id)
      if (vol) commit('setSelectedReferenceVolumeWithId', id)
    },
    selectIncomingVolumeWithId ({ commit, state, dispatch }, id) {
      const vol = state.incomingVolumes.find(({ id: _id }) => _id === id)
      if (vol) {
        if (vol.extra && vol.extra.neuroglancer && vol.extra.neuroglancer.transform) {
          const cleansedTransform = JSON.parse(JSON.stringify(vol.extra.neuroglancer.transform))
          const { mat4 } = export_nehuba
          const matrix = mat4.fromValues( ...cleansedTransform[0], ...cleansedTransform[1], ...cleansedTransform[2], ...cleansedTransform[3])
          mat4.transpose(matrix, matrix)
          commit(
            'nehubaStore/setIncTransformMatrix',
            { matrix },
            { root: true })
        }

        dispatch('setIncomingVolumeResolution', id)

        commit('setSelectedIncomingVolumeId', id)
        const { shaderScaleFactor } = vol
        commit('viewerPreferenceStore/setShaderScaleFactor', shaderScaleFactor || 1, { root: true })
      } 
    },

    async ['setIncomingVolumeResolution'] ({ commit, state, dispatch, rootGetters }, id) {
      try {
        const vol = state.incomingVolumes.find(({ id: _id }) => _id === id)
        const authHeader= rootGetters['authStore/authHeader']
        const config = {headers: {...authHeader}}
        const { data } = await axios(`${vol.imageSource.substring(14)}/info`, config)
        const resolution = data.scales[0].resolution

        commit('setSelectedIncomingVolumeResolution', resolution);
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
    updateIncVolumes ({ commit, state, dispatch, getters, rootGetters }, {error, message} = {error:null, message: null}) {
      
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
          const newVolumes = DEFAULT_BUNDLED_INCOMING_VOLUMES.concat(volumes)
          
          dispatch('log', ['updateIncVolumes#axios#postprocess', newVolumes], {root: true})
          
          commit('setIncomingVolumes', {volumes: newVolumes})
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
    deleteIncomingVolume ({ state, dispatch, getters, commit, rootGetters }, { id, incomingVolume}) {
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
        .then(res => {
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

    selectedIncomingVolumeType: (state, getters) => {
      const volume = getters.selectedIncomingVolume || {}
      const { payload = {} } = volume
      const { extra = {} } = payload
      const { neuroglancer = {} } = extra
      const { type = 'image' } = neuroglancer
      return type
    }
  }
}

export default dataSelectionStore