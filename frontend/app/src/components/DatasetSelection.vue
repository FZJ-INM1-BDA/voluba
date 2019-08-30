<template>
  <div class="container">

    <!-- select reference volumes -->
    

    <!-- incoming voluems -->
    <div>
      <div class="title">
        <strong>
          Incoming Volume 
        </strong>
      </div>

      <IncomingVolumeSelection
        @error="handleMessageFromIncVol('error', $event)"
        @message="handleMessageFromIncVol('message', $event)"
        />

      <!-- deletion feedback -->
      <div
        v-if="showAlert"
        :class="alertClass"
        class="alert">
        {{ incVolSelError }}
        {{ incVolSelMessage }}
      </div>

    </div>

    <hr>

    <!-- upload volume -->
    <upload-volume-component
      v-if="allowUpload"
      @upload="handleUploadEvent" />
    
    <hr>

    <!-- footer -->
    <div class="d-flex flex-row justify-content-end align-items-center">
      <span
        @click="openModal({ modalId: 'aboutus' })"
        class="align-middle mr-2">
        <font-awesome-icon icon="question-circle"></font-awesome-icon>
      </span>
      <div
        @click="$emit('destroyMe')"
        :disabled="bothSelected"
        :class="nextStepClass"
        class="btn">
        Start
      </div>
    </div>
  </div>
</template>

<script>
import { makeHtmlFragmentForNifti } from '@/constants'
import UploadVolumeComponent from '@/components/UploadVolume'
import { mapActions, mapGetters, mapState } from 'vuex';
import InfoPopover from '@/components/InfoPopover'
import IncomingVolumeSelection from '@/components/IncomingVolumeSelection'

export default {
  components: {
    UploadVolumeComponent,
    InfoPopover,
    IncomingVolumeSelection
  },
  data: function () {
    return {
      timeoutId:null,
      incVolSelMessage: null,
      incVolSelError: null,
    }
  },
  computed: {
    ...mapGetters('dataSelectionStore', [
      'selectedReferenceVolume', 
      'selectedIncomingVolume'
    ]),
    ...mapState({
      allowUpload: 'allowUpload',
    }),
    showAlert: function () {
      return this.incVolSelError || this.incVolSelMessage
    },
    alertClass: function () {
      return this.incVolSelError
        ? 'alert-danger'
        : this.incVolSelMessage
          ? 'alert-success'
          : 'alert-info'
    },
    nextStepClass: function () {
      return this.bothSelected
        ? 'btn-primary'
        : 'btn-secondary disabled'
    },
    bothSelected: function () {
      return this.selectedReferenceVolume && this.selectedIncomingVolume
    },
  },
  beforeRouteLeave: function (to, from, next) {
    if (!this.bothSelected) {
      next(false)
    } else {
      next()
    }
  },
  methods: {
    ...mapActions({
      openModal:'openModal',
      modalMessage: 'modalMessage',
    }),
    ...mapActions('dataSelectionStore', [
      'updateIncVolumes'
    ]),
    handleMessageFromIncVol: function (type, { message }){
      if (this.timeoutId) clearTimeout(this.timeoutId)
      if (type === 'error') {
        this.incVolSelError = message
      } else {
        this.incVolSelMessage = message
      }

      this.timeoutId = setTimeout(() => {
        this.incVolSelError = null
        this.incVolSelMessage = null
        this.timeoutId = null
      }, 5000)
    },
    handleUploadEvent: function ({ complete, data } = {}) {
      if (complete) {

        const { nifti, warnings, fileName, ...rest } = data
        
        /**
         * select the just uploaded volume
         */
        this.selectIncomingVolumeWithId(`private/${fileName}`)

        this.modalMessage({
          variant: 'success',
          title: 'Upload Successful',
          htmlBody: makeHtmlFragmentForNifti({ nifti, warnings })
        })
        
        this.updateIncVolumes()
      }
    },
    showNiftiInfo: function (extra) {
      this.modalMessage({
        variant: 'success',
        title: 'Upload Successful',
        htmlBody: makeHtmlFragmentForNifti(extra)
      })
    },
    nextStep: function () {
      this.$store.dispatch('nextStep')
    }
  },
}
</script>

<style scoped>
.disabled
{
  pointer-events: none;
}
.container
{
  pointer-events: all;
}
.title
{
  margin-bottom: 1em;
}
</style>
