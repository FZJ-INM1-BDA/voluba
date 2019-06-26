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
              <div class="input-group-sm input-group flex-nowrap">

                <!-- TODO remove flex-grow-1 here when /list endpoint is ready and select is reimplemented -->
                <div class="input-group-prepend">
                  <label
                    class="input-group-text"
                    for="select-depth-map">

                    <!-- icon -->
                    <font-awesome-icon
                      :class="depthMapIconClass"
                      :icon="depthMapIcon">
                    </font-awesome-icon>
                    
                    <!-- text -->
                    <span>
                      depth map
                    </span>
                  </label>
                </div>

                <!-- TODO disable depth map selection until /list endpoint is ready -->
                <select
                  id="select-depth-map"
                  name="select-depth-map"
                  @change="selectDepthMapOnChangeHandler"
                  :value="selectedDepthMapId"
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
                      :disabled="volume.pending || volume.disabled">
                      {{ volume.name }} {{ volume.pending ? '(calculation in progress)' : '' }} {{ volume.disabled ? '(not a depth map)' : '' }}
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
              <div class="mt-2 input-group input-group-sm w-100 flex-nowrap overflow-hidden">
                <div class="input-group-prepend">

                  <!-- compute btn -->
                  <div
                    @click="computeAlignments"
                    :class="computeAlignmentBtnEnabled ? '' : 'disabled'"
                    class="btn btn-outline-primary btn-block white text-nowrap">
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
            <div class="mt-2 card" v-if="computedNonLinearAlignedImage || true">
              <div class="card-body">
                <h5 class="card-title">
                  Cortical Alignment Completed
                </h5>
                <p>
                  Name: {{ (computedNonLinearAlignedImage && computedNonLinearAlignedImage.name) || 'Untitled' }}
                </p>

                <div class="input-group input-group-sm">
                  <div class="input-group-prepend flex-grow-1">
                    <span class="input-group-text w-100">
                      visualise
                    </span>
                  </div>
                  <div class="input-group-append">
                    <div
                      @click="toggleShowOriginal"
                      :class="visualiseLinearBtnClass"
                      class="btn">
                      linear
                    </div>
                    <div
                      @click="togglePreview"
                      :class="visualiseNonLinearBtnClass"
                      class="btn">
                      non-linear
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

import  {getBackendLandmarkPairs, getTransformMatrixInNm, volumeIsDepthMap, groupByVisibility } from '@/constants'

import NibComponent from '@/components/layout/Nib'
import DraggableMixin from '@/mixins/DraggableMixin'
import PollingMixin from '@/mixins/PollingMixin'
import UploadVolume from '@/components/UploadVolume'

import axios from 'axios'

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
        id: 'dummy',
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

      'incTransformMatrix',

      'landmarkPairs',
      'referenceLandmarks',
      'incomingLandmarks'
    ]),
    ...mapState('nonLinear', [
      'nonLinearBackendUrl',
    ]),
    ...mapState('viewerStore', [
      'showOriginal',
      'previewImage'
    ]),
    ...mapGetters('nonLinear', [
      'selectedDepthMap'
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
    selectedDepthMapId: function () {
      return (this.selectedDepthMap && this.selectedDepthMap.id) || 'dummy'
    },
    depthMaps: function () {
      /**
       * retrieve from non linear backend next time
       */
      const appendProperty = this.processedVolumes.map(v => {
        return {
          ...v,
          disabled: v.isSegment || !volumeIsDepthMap(v)
        }
      })
      return groupByVisibility(appendProperty)
    },
    groupedPVolumes: function () {
      return groupByVisibility(this.processedVolumes)
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
    computedNonLinearAlignedImage: function () {
      return this.pollingMixin__results && {
        name: this.pollingMixin__results.transformed_image_name,
        visibility: 'private',
        id: `private/${this.pollingMixin__results.transformed_image_name}`,
        imageSource: this.pollingMixin__results.transformed_image_neuroglancer_url,
        /**
         * transform to nm
         */
        transform: this.pollingMixin__results.transformation_matrix
          .map((row, rIdx) => row.map((v, cIdx) => cIdx === 3 && rIdx < 3
            ? v * 1e6
            : v ))
      }
    },
    visualiseLinearBtnClass: function () {
      return this.showOriginal
        ? `btn-primary`
        : `btn-outline-secondary`
    },
    visualiseNonLinearBtnClass: function () {
      return this.previewImage
        ? 'btn-primary'
        : 'btn-outline-secondary'
    }
  },
  methods: {
    ...mapActions([
      'openModal'
    ]),
    ...mapActions('viewerStore', [
      'toggleShowOriginal',
      'showPreviewImage'
    ]),
    ...mapActions('nonLinear', [
      'selectDepthMap'
    ]),
    selectDepthMapOnChangeHandler: function (event) {
      const selectedId = event.target.value
      const depthMap = this.incomingVolumes.find(({ id }) => id === selectedId )
      this.selectDepthMap({ depthMap })
    },
    close: function () {
      this.$emit('close')
    },
    computeAlignments: function () {
      if (!this.computeAlignmentBtnEnabled) return
      this.contactingPollingUrl = true

      const {landmarkPairs, referenceLandmarks, incomingLandmarks} = this
      const lmp = getBackendLandmarkPairs({ landmarkPairs, referenceLandmarks, incomingLandmarks })
      const xformMatrixMm = getTransformMatrixInNm(this.incTransformMatrix)
        .map((arr, i) => i === 3 ? arr : arr.map((v, idx) => idx === 3 ? v / 1e6 : v))
      const corticalAlignmentBody = {
        image_service_base_url: this.uploadUrl,
        image_name: this.selectedIncomingVolume.name,
        depth_map_name: this.selectedDepthMap.name,
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
      
    },
    togglePreview: function ({ uri }) {
      if (this.previewImage) return this.showPreviewImage({ previewImage: null })
      this.showPreviewImage({
        previewImage: this.computedNonLinearAlignedImage
      })
    }
  },
}
</script>
<style scoped>

</style>
