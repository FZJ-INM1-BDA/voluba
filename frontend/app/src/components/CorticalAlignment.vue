<template>
  <nib-component
    :initOpen="true"
    :style="draggingMixin__Style">
    
    <!-- will get injected into the body of the floating card -->
    <template slot="body">
      <div class="bg-light">

        <!-- header -->
        <div
          @mousedown="draggingMixin__StartDragging"
          class="hover-move card title-container pl-3 d-flex flex-row align-items-center">
          <div
            @click="close"
            class="close-icon">
            <div class="rounded-circle btn btn-sm btn-outline-secondary">
              <font-awesome-icon icon="times"></font-awesome-icon>
            </div>
          </div>

          <h5 class="title pt-3 pb-3 pl-2 m-0">
            <div>
              {{ corticalPatchAlignmentTitle }}
            </div>
          </h5>
        </div>

        <!-- body -->
        <div class="body bg-light">
          <div class="p-3">

            <!-- non linear reg -->
            <div>

              <!-- depth map -->
              <div class="input-group-sm input-group">

                <!-- TODO remove flex-grow-1 here when /list endpoint is ready and select is reimplemented -->
                <div class="input-group-prepend flex-grow-1">
                  <label
                    class="input-group-text flex-grow-1"
                    for="select-depth-map">

                    <!-- icon -->
                    <font-awesome-icon
                      :class="depthMapIconClass"
                      :icon="depthMapIcon">
                    </font-awesome-icon>
                    
                    <!-- text -->
                    <span>
                      depth map
                      <small v-if="selectedDepthMap" class="ml-1 text-muted">
                        ({{ selectedDepthMap.depth_map_name }})
                      </small>
                    </span>
                  </label>
                </div>

                <!-- TODO disable depth map selection until /list endpoint is ready -->
                <select
                  v-if="false"
                  id="select-depth-map"
                  name="select-depth-map"
                  class="custom-select">
                  <option
                    :value="dummyDepthMap.id"
                    :disabled="dummyDepthMap.disabled">
                    {{ dummyDepthMap.name }}
                  </option>

                  <!-- incoming volumes sorted by group -->
                  <optgroup
                    :key="idx"
                    :label="arr[0]"
                    v-for="(arr, idx) in depthMaps">

                    <option
                      v-for="volume in arr[1]"
                      :key="volume.id"
                      :value="volume.id"
                      :disabled="volume.pending">
                      {{ volume.name }} {{ volume.pending ? '(calculation in progress)' : '' }}
                    </option>
                  </optgroup>
                </select>

                <div class="input-group-append">
                  <div
                    @click="openModal({modalId: 'uploadModal'})"
                    class="btn-sm btn btn-primary">
                    <font-awesome-icon icon="upload"></font-awesome-icon>
                  </div>
                </div>
              </div>

              <!-- approxmiate affine transformation -->
              <div class="input-group-sm input-group mt-1">
                <div class="input-group-prepend flex-grow-1">
                  <span
                    class="input-group-text w-100">

                    <!-- icon -->
                    <font-awesome-icon
                      :class="affineIconClass"
                      :icon="affineIcon">
                    </font-awesome-icon>

                    <!-- label -->
                    <span>
                      affine
                    </span> 
                    <font-awesome-icon
                      class="ml-2"
                      v-b-tooltip.hover="affineExplanation"
                      icon="question" />
                  </span>
                </div>
              </div>

              <!-- landmarks -->
              <div class="input-group-sm input-group mt-1">
                <div class="input-group-prepend flex-grow-1">
                  
                  <div class="input-group-text w-100">

                    <!-- icon -->
                    <font-awesome-icon
                      :class="landmarkIconClass"
                      :icon="landmarkIcon">
                    </font-awesome-icon>

                    <!-- label -->
                    <span>
                      landmarks
                    </span>
                    <small class="ml-1 text-muted">
                      ({{ landmarkPairs.length }} pairs)
                    </small>
                    <font-awesome-icon
                      class="ml-2"
                      v-b-tooltip.hover="landmarksExplanation"
                      icon="question" />

                  </div>
                </div>
              </div>

              <!-- compute alignment -->
              <div class="mt-2 input-group input-group-sm">
                <div class="input-group-prepend">

                  <!-- compute btn -->
                  <div
                    @click="computeAlignments"
                    :class="computeAlignmentBtnEnabled ? '' : 'disabled'"
                    class="btn btn-outline-primary btn-block">
                    Compute alignment
                  </div>
                </div>

                <div class="flex-grow-1 input-group-append">

                  <!-- message -->
                  <span class="flex-grow-1 input-group-text">
                    {{ computeAlignmentText }}
                  </span>
                </div>
              </div>
            </div>

            <!-- view result -->
            <div class="mt-2 card" v-if="pollingResults">
              <div class="card-body">
                <h5 class="card-title">
                  Cortical Alignment Completed
                </h5>
                <p>
                  Name: {{ pollingResults.transformed_image_name ? pollingResults.transformed_image_name : 'Untitled' }}
                </p>

                <div class="input-group input-group-sm">
                  <div class="input-group-prepend flex-grow-1">
                    <span class="input-group-text w-100">
                      visualise
                    </span>
                  </div>
                  <div class="input-group-append">
                    <div class="btn btn-outline-primary">
                      original
                    </div>
                    <div class="btn btn-outline-primary">
                      registered
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </template>
  </nib-component>
</template>
<script>

import { mapState, mapActions, mapGetters } from 'vuex'

import { CORTICAL_ALIGNMENT } from '@/text'

import  {getBackendLandmarkPairs, getTransformMatrixInNm, invertMat4FromArr } from '@/constants'

import NibComponent from '@/components/layout/Nib'
import DraggableMixin from '@/mixins/DraggableMixin'
import PollingMixin from '@/mixins/PollingMixin'
import UploadVolume from '@/components/UploadVolume'

import axios from 'axios'

const TEMP_FETCHED = [
  {
    "name": "colin27_t1_tal_lin_mask",
    "visibility": "private",
    "links": {
      "normalized": "/nifti/3323022859c2ceb9b99455f20c2feb5d510a97f0aad97cd92d82c7eb/colin27_t1_tal_lin_mask"
    },
    "extra": {
      "fileName": "colin27_t1_tal_lin_mask.nii.gz",
      "fileSize": 85471,
      "fileSizeUncompressed": 14218626,
      "uploaded": "2019-06-03T14:30:47.756927Z",
      "nifti": {
        "niftiVersion": "Nifti1",
        "byteOrder": "LITTLE_ENDIAN",
        "size": [
          181,
          217,
          181
        ],
        "voxelSize": [
          1,
          1,
          1
        ],
        "spatialUnits": "Millimeter",
        "temporalUnits": "Seconds",
        "dataType": "signed_short",
        "description": "mnc2nii minc2/colin27_t1_tal_lin_mask.mnc nifti/colin27_t1_tal_lin_mask.nii",
        "coordinateSystem": "SCANNER_ANAT",
        "affineMatrix": [
          [
            1,
            0,
            0,
            -90
          ],
          [
            0,
            1,
            0,
            -126
          ],
          [
            0,
            0,
            1,
            -72
          ],
          [
            0,
            0,
            0,
            1
          ]
        ]
      },
      "data": {
        "minValue": "0",
        "maxValue": "1"
      },
      "neuroglancer": {
        "type": "segmentation",
        "data_type": "uint16",
        "size": [
          181,
          217,
          181
        ],
        "resolution": [
          1000000,
          1000000,
          1000000
        ],
        "transform": [
          [
            1,
            0,
            0,
            -90500000
          ],
          [
            0,
            1,
            0,
            -126500000
          ],
          [
            0,
            0,
            1,
            -72500000
          ],
          [
            0,
            0,
            0,
            1
          ]
        ]
      },
      "warnings": []
    }
  },
  {
    "name": "colin27_t1_tal_lin_headmask",
    "visibility": "private",
    "links": {
      "normalized": "/nifti/3323022859c2ceb9b99455f20c2feb5d510a97f0aad97cd92d82c7eb/colin27_t1_tal_lin_headmask"
    },
    "extra": {
      "fileName": "colin27_t1_tal_lin_headmask.nii.gz",
      "fileSize": 108651,
      "fileSizeUncompressed": 14218626,
      "uploaded": "2019-06-03T14:29:50.162072Z",
      "nifti": {
        "niftiVersion": "Nifti1",
        "byteOrder": "LITTLE_ENDIAN",
        "size": [
          181,
          217,
          181
        ],
        "voxelSize": [
          1,
          1,
          1
        ],
        "spatialUnits": "Millimeter",
        "temporalUnits": "Seconds",
        "dataType": "signed_short",
        "description": "mnc2nii minc2/colin27_t1_tal_lin_headmask.mnc nifti/colin27_t1_tal_lin_headmask",
        "coordinateSystem": "SCANNER_ANAT",
        "affineMatrix": [
          [
            1,
            0,
            0,
            -90
          ],
          [
            0,
            1,
            0,
            -126
          ],
          [
            0,
            0,
            1,
            -72
          ],
          [
            0,
            0,
            0,
            1
          ]
        ]
      },
      "data": {
        "minValue": "0",
        "maxValue": "1"
      },
      "neuroglancer": {
        "type": "segmentation",
        "data_type": "uint16",
        "size": [
          181,
          217,
          181
        ],
        "resolution": [
          1000000,
          1000000,
          1000000
        ],
        "transform": [
          [
            1,
            0,
            0,
            -90500000
          ],
          [
            0,
            1,
            0,
            -126500000
          ],
          [
            0,
            0,
            1,
            -72500000
          ],
          [
            0,
            0,
            0,
            1
          ]
        ]
      },
      "warnings": []
    }
  }
]


export default {
  components: {
    NibComponent,
    UploadVolume
  },
  mixins:[
    PollingMixin,
    DraggableMixin
  ],
  data: function () {
    return {
      selectedVolume: null,
      affineExplanation: 'Approximate affine transform',
      landmarksExplanation: 'Landmarks for longitudinal alignment',
      dummyDepthMap: {
        id: null,
        name: '-- Select a depth map for non linear alignment --',
        disabled: true
      },
      dummyIncomingVolume: {
        id: null,
        name: '-- Please select an incoming volume --',
        disabled: true
      },

      contactingPollingUrl: false,

      nonLinearAlignmentAvailable: false,
    }
  },
  computed: {
    ...mapGetters([
      'authHeader',
      'selectedIncomingVolume'
    ]),
    ...mapState([
      'uploadUrl',
      'incomingVolumes',
      'landmarkPairs',
      'nonLinearBackendUrl',
      'selectedDepthMap',

      'incTransformMatrix',

      'landmarkPairs',
      'referenceLandmarks',
      'incomingLandmarks'
    ]),
    processedVolumes: function () {
      return this.incomingVolumes.map(v => {
        return {
          ...v,
          isSegment: v.extra
            && v.extra.neuroglancer
            && v.extra.neuroglancer.type
            && v.extra.neuroglancer.type === 'segmentation'
        }
      })
    },
    depthMaps: function () {
      /**
       * retrieve from non linear backend next time
       */

      return [
          ['Private volumes', TEMP_FETCHED]
        ]
        .map(( [label, volumes] ) => {
          return [
            label,
            volumes.map((v, idx) => {
              return {
                ...v,
                pending: idx % 2 === 0
              }
            })
          ]
        })
    },
    groupedPVolumes: function () {
      const getLabelFromVolume = (volume) => {
        return volume.visibility === 'public'
          ? 'Public volumes'
          : volume.visibility === 'private'
            ? 'Private volumes'
            : 'Bundled volumes'
      }
      return this.processedVolumes
        .reduce((acc, curr) => {
          const returnArr = Array.from(acc)
          const label = getLabelFromVolume(curr)
          const entry = returnArr.find(arr => label === arr[0])
          if (entry) {
            entry[1].push(curr)
          } else {
            returnArr.push([
              label,
              [ curr ]
            ])
          }
          return returnArr
        }, [])
    },
    defaultPVolumes: function () {
      return this.processedVolumes.filter(v => !v.visibility)
    },
    publicPVolumes: function () {
      return this.processedVolumes.filter(v => v.visibility === 'public')
    },
    privatePVolumes: function () {
      return this.processedVolumes.filter(v => v.visibility === 'private')
    },
    corticalPatchAlignmentTitle: function () {
      return CORTICAL_ALIGNMENT
    },
    depthMapIcon: function () {
      return this.selectedDepthMap
        ? ['far', 'check-circle']
        : ['far', 'circle']
    },
    affineIcon: function () {
      return ['far', 'check-circle']
    },
    landmarkIcon: function () {
      return ['far', 'check-circle']
    },
    depthMapIconClass: function () {
      return this.selectedDepthMap
        ? ['mr-1', 'text-success']
        : ['mr-1']
    },
    affineIconClass: function () {
      return ['mr-1', 'text-success']
    },
    landmarkIconClass: function () {
      return ['mr-1', 'text-success']
    },
    alignmentCanBeComputed: function () {
      /**
       * check depthmap availability, number of landmarks available etc
       */
      return !!this.selectedDepthMap
    },
    computeAlignmentBtnEnabled: function () {
      return this.alignmentCanBeComputed
        && !this.pollingMixin__pollingInProgress
        && !this.contactingPollingUrl
    },
    computeAlignmentText: function () {
      if (!this.alignmentCanBeComputed) return `Vital ingredients missing`

      if (this.pollingMixin__pollingComplete) return `Alignment completed`

      if (!this.pollingMixin__pollingInProgress && !this.contactingPollingUrl) return `Ready to compute`
      if (this.contactingPollingUrl) return `Contacting cortical alignment server`
      if (this.pollingMixin__pollingInProgress)
        return this.pollingMixin__pollingMesssage || `Alignment in progress`
      if (this.pollingMixin__pollingError)
        return `Alignment error:` + (this.pollingMixin__pollingMesssage || ``)
      return `Unknown Status`
    },
    pollingResults: function () {
      return this.pollingMixin__results
    }
  },
  methods: {
    ...mapActions({
      openModal: 'openModal'
    }),
    close: function () {
      this.$emit('close')
    },
    computeAlignments: function () {
      if (!this.computeAlignmentBtnEnabled) return
      this.contactingPollingUrl = true

      const {landmarkPairs, referenceLandmarks, incomingLandmarks} = this
      const lmp = getBackendLandmarkPairs({ landmarkPairs, referenceLandmarks, incomingLandmarks })
      const xformMatrixMm = getTransformMatrixInNm(invertMat4FromArr(this.incTransformMatrix)).map((arr, i) => i === 3 ? arr : arr.map((v, idx) => idx === 3 ? v / 1e6 : v))
      const corticalAlignmentBody = {
        image_service_base_url: this.uploadUrl,
        image_name: this.selectedIncomingVolume.name,
        depth_map_name: this.selectedDepthMap.depth_map_name,
        landmark_pairs: lmp,
        transformation_matrix: xformMatrixMm
      }

      axios(`${this.nonLinearBackendUrl}/v0/alignment-computation/`, {
        method: `POST`,
        headers: { ...this.authHeader },
        data: corticalAlignmentBody
      })
        .then(({ data }) => {
          const { status_polling_url: _pollingUrl } = data 
          const pollingUrl = `${this.nonLinearBackendUrl}${_pollingUrl}`

          this.contactingPollingUrl = false

          this.pollingMixin__poll(pollingUrl, {
            method: 'GET',
            headers: {
              ...this.authHeader
            }
          })
        })
        .catch(err => {
          console.error('error', err)
          this.pollingMixin__pollingMesssage = err
          this.pollingMixin__pollingError = err
        })
      
    }
  },
}
</script>
<style scoped>

</style>
