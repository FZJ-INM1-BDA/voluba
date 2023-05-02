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
        imageSource: 'precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image',
        siibra_explorer_url: '/a:juelich:iav:atlas:v1.0.0:1/t:minds:core:referencespace:v1.0.0:a1655b99-82f1-420f-a3c2-fe80fd4c8588/p:juelich:iav:atlas:v1.0.0:4/'

      }, {
        id: 'waxholm',
        name: 'Waxholm (2021)',
        theme: 'dark',
        imageSource: 'precomputed://https://neuroglancer.humanbrainproject.eu/precomputed/WHS_SD_rat/templates/v1.01/t2star_masked',
        siibra_explorer_url: '/a:minds:core:parcellationatlas:v1.0.0:522b368e-49a3-49fa-88d3-0870a307974a/t:minds:core:referencespace:v1.0.0:d5717c4a-0fa1-46e6-918c-b8003069ade8/p:minds:core:parcellationatlas:v1.0.0:ebb923ba-b4d5-4b82-8088-fa9215c2e1fe-v4/'
      }, {
        id: 'allen',
        name: 'Allen CCFv3',
        theme: 'dark',
        imageSource: 'precomputed://https://neuroglancer.humanbrainproject.eu/precomputed/AMBA/templates/v3/stpt',
        siibra_explorer_url: '/a:juelich:iav:atlas:v1.0.0:2/t:minds:core:referencespace:v1.0.0:265d32a0-3d84-40a5-926f-bf89f68212b9/p:minds:core:parcellationatlas:v1.0.0:05655b58-3b6f-49db-b285-64b5a0276f83/'
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
    setSelectedIncomingVolumeResolution (state, data) {
      state.selectedIncomingVolumeResolution = data.resolution
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
        const { data } = await axios(`${vol.imageSource.substring(14)}/info`)
        const resolution = data.scales[0].resolution
        const size = data.scales[0].size
        // const resolution = {}
        // resolution.voxel = data.scales[0].resolution
        // resolution.real = data.scales[0].resolution.map((r, i) => r * data.scales[0].size[i])
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