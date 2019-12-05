<template>
  <b-modal
    ref="modal"
    :no-close-on-backdrop="preventClose"
    :no-close-on-esc="preventClose"
    :hide-header-close="preventClose"
    :hide-footer="true"
    :id="id"
    title="Generate Depth Map"
    header-bg-variant="secondary"
    header-text-variant="light">

    <ul v-if="workflowStarted" class="list-group">
      <li
        :class="uploadListClass"
        class="list-group-item d-flex align-items-center">
        <font-awesome-icon
          :class="uploadIconClass"
          class="mr-2"
          :icon="uploadIcon"></font-awesome-icon>
        <span>
          Upload segmentation volume to image service
        </span>
      </li>
      <li
        :class="generateDepthMapListClass"
        class="list-group-item d-flex align-items-center">
        <font-awesome-icon
          :class="generateDepthIconClass"
          class="mr-2"
          :icon="generateDepthIcon"></font-awesome-icon>
        <span>
          Generating depth map {{ showPollingMessage }}
        </span>
      </li>
    </ul>

    <!-- upload volume component -->
    <UploadVolume
      v-show="!workflowStarted"
      @upload="handleUploadEvent"
      inputTitle=""
      :defaultNiftiCheckboxState="true"
      :allowNiftiCheckboxToggle="false" />

    <div class="card" v-if="computedDepthMap">
      <div class="card-body">
        <h5 class="card-title">
          Depth Map ready
        </h5>
        <p>
          Name: {{ computedDepthMap.name || 'Untitled' }}
        </p>
        <div @click="selectDepthMap({depthMap: computedDepthMap}); hideModal()" class="btn btn-primary">
          use this depth map
        </div>
      </div>
    </div>
    
    <hr>
    <div class="d-flex align-items-center justify-content-end">
      <small v-if="preventClose" class="text-muted">
        Workflow started. modal will stay open until workflow is complete.
      </small>
      <div
        @click="hideModal"
        :class="preventClose ? 'disabled' : ''"
        class="btn-sm btn btn-secondary ml-1">
        Close
      </div>
    </div>

  </b-modal>
</template>

<script>
/**
 * this component should really be called
 * upload and generate depth map 
 */
import UploadVolume from '@/components/UploadVolume'
import PollingMixin from '@/mixins/PollingMixin'
import { getFilenameFromNiftiExtra } from '@/constants'
import { mapState, mapGetters, mapActions } from 'vuex'
import axios from 'axios'

export default {
  name: 'UploadModal',
  props: {
    id: String
  },
  components: {
    UploadVolume
  },
  mixins:[
    PollingMixin
  ],
  data: function () {
    return {
      workflowStarted: false,

      preventClose: false,
      uploadingInProgress: false,
      uploadComplete: false,
      ready: false,

      /**
       * non linear backend related data
       */
      contactingPollingUrl: false
    }
  },
  methods: {
    ...mapActions('nonLinearStore', [
      'selectDepthMap'
    ]),
    showModal: function () {
      this.$refs['modal'].show()
    },
    hideModal: function () {
      if (!this.preventClose) this.$refs['modal'].hide()
    },
    handleUploadEvent: function ({ started, cancelled, complete, error, data }) {
      if (started) this.workflowStarted = true
      this.uploadingInProgress = !!started
        && !cancelled
        && !complete
        && !error
      if (complete) {
        this.uploadComplete = !!complete
        this.generateDepthMap(data)
        this.contactingPollingUrl = true
      }
    },
    generateDepthMap: function (niftiExtra) {
      const fileName = getFilenameFromNiftiExtra(niftiExtra)
      const depthMapComputationBody = {
        image_service_base_url: this.uploadUrl,
        segmentation_name: fileName.replace(/\.nii(\.gz)?$/i, '')
      }
      const config = {
        method: 'POST',
        headers: { ...this.authHeader },
        data: depthMapComputationBody
      }
      axios(`${this.nonLinearBackendUrl}/v0/depth-map-computation/`, config)
        .then(({ data }) => {
          const { status_polling_url: pollingUrl } = data 
          this.pollingUrl = `${this.nonLinearBackendUrl}${pollingUrl}`

          this.contactingPollingUrl = false

          this.pollingMixin__poll(this.pollingUrl, {
            ...config,
            method: 'GET'
          })
        })
        .catch(err => {
          this.pollingError = err
        })
    }
  },
  watch: {
    workflowStarted: function (flag) {
      if (flag) this.preventClose = true
    },
    pollingMixin__pollingComplete: function (flag) {
      if (flag) this.preventClose = false
    },
    pollingMixin__pollingError: function (val) {
      if (!!val) this.preventClose = false
    }
  },
  computed: {
    ...mapGetters('authStore', [
      'authHeader'
    ]),
    ...mapState([
      'uploadUrl',
    ]),
    ...mapState('nonLinearStore',[
      'nonLinearBackendUrl'
    ]),
    computedDepthMap: function () {
      return this.pollingMixin__results && {
        name: this.pollingMixin__results.depth_map_name,
        visibility: 'private',
        id: `private/${this.pollingMixin__results.depth_map_name}`,
        imageSource: this.pollingMixin__results.depth_map_neuroglancer_url
      }
    },
    pollingInProgress: function () {
      return this.pollingMixin__pollingInProgress || this.contactingPollingUrl
    },
    uploadListClass: function () {
      return !this.uploadComplete && !this.uploadingInProgress
        ? 'list-group-item-light'
        : ''
    },
    generateDepthMapListClass: function () {
      return !this.pollingMixin__pollingInProgress && !this.pollingMixin__pollingComplete
        ? 'list-group-item-light'
        : ''
    },
    uploadIcon: function () {
      if (this.uploadingInProgress) return `circle-notch`
      if (this.uploadComplete) return ['far', 'check-circle']
      return ['far', `circle`]
    },
    /**
     * BUG in vuejs? polingInProgress is not updating, so have to check polling commplete first
     */
    generateDepthIcon: function () {
      if (this.pollingMixin__pollingError) return `exclamation-triangle`
      if (this.pollingMixin__pollingComplete) return ['far', 'check-circle']
      if (this.pollingInProgress) return `circle-notch`
      return ['far', `circle`]
    },
    showPollingMessage: function () {
      return this.pollingMixin__pollingMesssage
        ? `: ${this.pollingMixin__pollingMesssage}`
        : ``
    },
    uploadIconClass: function () {
      if (this.uploadingInProgress) return `spinner`
      if (this.uploadComplete) return `text-success`
      return ``
    },
    generateDepthIconClass: function () {
      if (this.pollingMixin__pollingError) return `text-danger`
      if (this.pollingMixin__pollingComplete) return `text-success`
      if (this.pollingInProgress) return `spinner`
      return ``
    }
  }
}
</script>

<style scoped>
</style>
