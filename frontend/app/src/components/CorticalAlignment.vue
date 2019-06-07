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
            <!-- compute depth map -->
            <div>
              <h4>
                compute depth map
              </h4>

              <!-- select/upload -->
              <div class="input-group input-group-sm">

                <!-- select segment volume to compute depth map -->
                <select
                  v-model="selectedVolume"
                  class="custom-select">
                  <!-- dummy opt -->
                  <option
                    :value="dummyIncomingVolume.id"
                    :disabled="true">
                    {{ dummyIncomingVolume.name }}  
                  </option>
                  
                  <!-- incoming volumes sorted by group -->
                  <optgroup
                    :key="idx"
                    :label="arr[0]"
                    v-for="(arr, idx) in groupedPVolumes">

                    <option
                      v-for="volume in arr[1]"
                      :key="volume.id"
                      :value="volume.id"
                      :disabled="!volume.isSegment">
                      {{ volume.name }} {{ volume.isSegment ? '' : '(not a segment)' }}
                    </option>
                  </optgroup>

                </select>

                <div class="input-group-append">

                  <!-- upload btn -->
                  <div class="btn btn-primary">
                    upload
                  </div>
                </div>
              </div>

              <div class="p-1">
              </div>

              <!-- compute/select -->
              <div
                :class="selectedVolume ? '' : 'disabled'"
                class="btn btn-sm btn-block btn-warning">
                compute depth map
              </div>
            </div>

            <hr>

            <!-- non linear reg -->
            <div>
              <h4>
                non-linear registration
              </h4>

              <!-- depth map -->
              <div class="input-group-sm input-group">
                <div class="input-group-prepend">
                  <label
                    class="input-group-text"
                    for="select-depth-map">
                    depth map
                  </label>
                </div>
                <select
                  v-model="selectedDepthMap"
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
              </div>

              <!-- approxmiate affine transformation -->
              <div class="input-group-sm input-group mt-1">
                <div class="input-group-prepend flex-grow-1">
                  <span
                    class="input-group-text w-100">
                    affine 
                    <font-awesome-icon
                      class="ml-2"
                      v-b-tooltip.hover="affineExplanation"
                      icon="question" />
                  </span>
                </div>
                <div class="input-group-append">

                  <div class="btn btn-outline-primary">
                    use current
                  </div>
                  <div class="btn btn-outline-primary">
                    load json
                  </div>
                </div>
              </div>

              <!-- landmarks -->
              <div class="input-group-sm input-group mt-1">
                <div class="input-group-prepend flex-grow-1">
                  <div class="input-group-text w-100">
                    landmarks
                    <font-awesome-icon
                      class="ml-2"
                      v-b-tooltip.hover="landmarksExplanation"
                      icon="question" />

                  </div>
                </div>

                <div class="input-group-append">
                  <div class="btn btn-outline-primary">
                    use current
                  </div>
                  <div class="btn btn-outline-primary">
                    load json
                  </div>
                </div>
              </div>

              <div class="mt-2 btn btn-outline-primary btn-block btn-sm">
                Compute alignment
              </div>
            </div>

            <hr>
            <!-- view result -->
            <div>
              <h4>
                visualise registered volume
              </h4>
              <div class="input-group input-group-sm">
                <div class="input-group-prepend flex-grow-1">
                  <span class="input-group-text w-100">
                    show image
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
    </template>
  </nib-component>
</template>
<script>

import { mapState } from 'vuex'

import { CORTICAL_ALIGNMENT } from '@/text'

import NibComponent from '@/components/layout/Nib'
import DraggableMixin from '@/mixins/DraggableMixin'


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
    NibComponent
  },
  mixins:[
    DraggableMixin
  ],
  data: function () {
    return {
      selectedVolume: null,
      selectedDepthMap: null,
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
    }
  },
  computed: {
    ...mapState([
      'incomingVolumes'
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
    }
  },
  methods: {
    close: function () {
      this.$emit('close')
    }
  },
}
</script>
<style scoped>

</style>
