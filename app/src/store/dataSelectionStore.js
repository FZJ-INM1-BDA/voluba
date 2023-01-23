import { UPLOAD_URL, DEFAULT_BUNDLED_INCOMING_VOLUMES_0, DEFAULT_BUNDLED_INCOMING_VOLUMES_1, processImageMetaData, identityMat } from "@/constants";
import axios from 'axios'

const defaultVIds = [`colin-1`]
let DEFAULT_BUNDLED_INCOMING_VOLUMES = []

const vols = [...DEFAULT_BUNDLED_INCOMING_VOLUMES_0, ...DEFAULT_BUNDLED_INCOMING_VOLUMES_1]
DEFAULT_BUNDLED_INCOMING_VOLUMES = vols.filter(v => defaultVIds.includes(v.id))

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
      }, {
        id: 'waxholm',
        name: 'Waxholm (2021)',
        theme: 'dark'
      }, {
        id: 'allen',
        name: 'Allen CCFv3',
        theme: 'dark'
      }
    ],

    selectedIncomingVolumeId: null,

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
    setIncomingVolumes (state, { volumes }) {
      state.incomingVolumes = volumes
    }
  },
  actions: {
    appendToIncomingVolumes({ commit, state }, { volumes }){
      const { incomingVolumes } = state
      commit('setIncomingVolumes', { 
        volumes: [
          ...incomingVolumes,
          ...volumes
        ]
       })
    },
    selectReferenceVolumeWithId ({ commit, state }, id) {
      const vol = state.referenceVolumes.find(({ id: _id }) => _id === id)
      if (vol) commit('setSelectedReferenceVolumeWithId', id)
      
    },
    selectIncomingVolumeWithId ({ commit, state }, id) {
      const vol = state.incomingVolumes.find(({ id: _id }) => _id === id)
      if (vol) {
        commit('setSelectedIncomingVolumeId', id)
        const { shaderScaleFactor } = vol
        commit('viewerPreferenceStore/setShaderScaleFactor', shaderScaleFactor || 1, { root: true })
      } 
    },
    updateIncVolumesResult () {
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
          const newVolumes = DEFAULT_BUNDLED_INCOMING_VOLUMES.concat(volumes)
          
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
    selectedIncomingVolumeNgAffine: (state, getters) => {
      const volume = getters.selectedIncomingVolume || {}
      const { extra } = volume || {}
      const { neuroglancer } = extra || {}
      const { transform } = neuroglancer || {}
      return transform || identityMat
    },
    selectedIncomingVolumeType: (state, getters) => {
      const volume = getters.selectedIncomingVolume || {}
      const { extra } = volume || {}
      const { neuroglancer } = extra || {}
      const { type = 'image' } = neuroglancer || {}
      return type
    }
  }
}

export default dataSelectionStore