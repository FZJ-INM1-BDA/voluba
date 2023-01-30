<template>
  <div class="container">

    <div class="container d-flex flex-row vertical-separator-container">

      <!-- new workflow -->
      <div class = "flex-grow-1 flex-shrink-1">

        <h4>
          New workflow
        </h4>

        <!-- select reference volumes -->
        <div>
          <div class="title">
            <strong>
              Reference Volume
            </strong>
          </div>

          <ReferenveVolumeSelection
              @error="handleMessageFromIncVol('error', $event)"
              @message="handleMessageFromIncVol('message', $event)"
          />

        </div>

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

        <div class="d-flex flex-row">


          <!-- upload volume -->
          <upload-volume-component
            class="flex-grow-1 flex-shrink-1"
            v-if="allowUpload"
            @upload="handleUploadEvent" />
        </div>
    
      </div>

      <!-- saved workflows -->
      <ResumeWorkflowComponent
        v-if="resumeWorkflow"
        @destroy-me="$emit('destroy-me')"
        class="flex-grow-1 flex-shrink-1" />
    </div>

    <hr>

    <!-- footer -->
    <div class="d-flex flex-row justify-content-end align-items-center">
      <span
        @click="openModal({ modalId: 'aboutus' })"
        class="align-middle mr-2">
        <font-awesome-icon icon="question-circle"></font-awesome-icon>
      </span>
      <div
        @click="$emit('destroy-me')"
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
import ResumeWorkflowComponent from '@/components/ResumeWorkflow'
import { mapActions, mapGetters, mapState } from 'vuex';
import InfoPopover from '@/components/InfoPopover'
import IncomingVolumeSelection from '@/components/IncomingVolumeSelection'
import ReferenveVolumeSelection from '@/components/ReferenveVolumeSelection'

export default {
  components: {
    UploadVolumeComponent,
    InfoPopover,
    IncomingVolumeSelection,
    ReferenveVolumeSelection,
    ResumeWorkflowComponent
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
      'selectedIncomingVolume',
      'selectedReferenceVolumeId',
      'selectedPrivateReferenceVolumeId'
    ]),
    ...mapState({
      allowUpload: 'allowUpload',
      resumeWorkflow: state => state && state.experimentalFeatures && state.experimentalFeatures.resumeWorkflow
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
      return (this.selectedReferenceVolumeId || this.selectedPrivateReferenceVolumeId) && this.selectedIncomingVolume
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
    ...mapActions([
      'openModal',
      'modalMessage',
    ]),
    ...mapActions('dataSelectionStore', [
      'updateIncVolumes',
      'selectIncomingVolumeWithId'
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
  max-height: 90vh;
  overflow: auto;
}
.title
{
  margin-bottom: 1em;
}

.vertical-separator-container > *
{
  flex-basis: 0;
}

.vertical-separator-container > *:not(:last-child)
{
  padding-right:1rem;
  margin-right:1rem;
  border-right: 1px rgba(128, 128, 128, 0.5) solid;
}
</style>
