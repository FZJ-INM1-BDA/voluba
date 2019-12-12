<template>
<div class="container">
  <!-- new upload container -->
  <div class="uploadUI">
    <h4>
      {{ inputTitle }}
    </h4>

    <div
      v-if="!production"
      class="input-group mb-1">
      <div class="input-group-prepend">
        <span class="input-group-text">
          POST URL
        </span>
      </div>
      <input
        :value="url"
        @change="uploadUrlChanged"
        class="form-control"
        type="text" />
    </div>

    <!-- file input -->
    <input
      @change="fileInputChanged"
      ref="fileInput"
      type="file"
      class="form-control mb-3" />

    <!-- upload options -->
    <!-- is segment -->
    <div class="d-flex flex-row flex-nowrap align-items-center" v-if="showNiftiCheckbox">
      <input
        v-model="isSegmentation"
        :disabled="!allowNiftiCheckboxToggle"
        id="segmentationCheckBox"
        name="segmentationCheckBox"
        type="checkbox">
      <label
        class="ml-2 mr-2 mb-0 d-inline-block"
        :class="allowNiftiCheckboxToggle ? '' : 'text-muted'"
        for="segmentationCheckBox">segmentation nifti </label>
      <font-awesome-icon
        :class="allowNiftiCheckboxToggle ? '' : 'text-muted'"
        v-b-tooltip.hover.right="segmentationExplanation"
        icon="question" />
    </div>

    <!-- upload btn -->
    <div
      @click.stop.prevent="upload"
      :class="uploadBtnDisabled?'disabled pe-none btn-secondary':'btn-primary'"
      class="d-inline-flex align-items-center justify-content-center btn mb-2">

      <span
        v-if="uploadInProgress"
        class="d-inline-block spinnerAnimationCircle mr-2">
      </span>
      <span>
        {{ uploadInProgress ? 'Uploading' : 'Upload'}}
      </span>
    </div>

    <div
      @click="cancelUpload"
      v-if="cancelTokenSource"
      class="btn btn-link"> 
      cancel
    </div>

    <div
      v-if="preflightError"
      class="ml-2 d-inline-block alert alert-danger">
      <font-awesome-icon icon="exclamation-triangle"></font-awesome-icon>
      {{ preflightError }}
    </div>

    <div
      v-if="preflightNiftiInfo"
      @click="showNiftiInfo(preflightNiftiInfo)"
      class="d-inline-block btn-sm">
      <font-awesome-icon icon="info-circle"></font-awesome-icon>
    </div>

    <InfoPopover
      class="text-warning"
      icon="exclamation-triangle"
      v-if="preflightWarnings && preflightWarnings.length > 0"
      placement="right"
      triggers="click blur">
      
      <div
        class="text-left mb-1 mt-1"
        :key="idx"
        v-for="(warning,idx) in preflightWarnings">
        <small class="d-inline-block lh-1">
        {{ warning }}
        </small>
      </div>
      
    </InfoPopover>

    <div
      v-if="uploadInProgress && !uploadError"
      class="progress">
      <div
        :style="{width:uploadProgressPercentage}"
        role="progressbar"
        class="progress-bar">
        {{ uploadProgressPercentage }}
      </div>
    </div>
    <div
      v-if="uploadFinished && !uploadError"
      class="alert alert-success">
      Upload Complete!
    </div>
    <div class="alert alert-danger" v-if="uploadError">
      <font-awesome-icon icon="exclamation-triangle" /> {{ uploadError }}
    </div>    
  </div>

  <div v-if="!user && production" class="uploadScreenOverlay">
    <h5>
      You must sign in before you can upload volumes.
    </h5>
    <div class="card">
      <SigningComponent />
    </div>
  </div>

</div>
</template>
<script>
import axios from 'axios'
import { mapState, mapActions, mapMutations } from 'vuex'
import { arrayBufferToBase64String, IMAGE_SERVICE_NAME, SEGMENTATION_EXPLANATION, makeHtmlFragmentForNifti } from '@/constants'
import SigningComponent from '@/components/SigninComponent'
import InfoPopover from '@/components/InfoPopover'
/**
 * /preflight
 * /upload
 * /list
 * /user/nifti/filename.nii
 * /user/nifti/filename.nii.gz
 */
export default {

  /**
   * TODO write tests for props
   */
  props: {
    inputTitle: {
      type: String,
      default: 'Upload a volume'
    },
    showNiftiCheckbox: {
      type: Boolean,
      default: true
    },
    defaultNiftiCheckboxState: {
      type: Boolean,
      default: false
    },
    allowNiftiCheckboxToggle: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    return {
      uploadFinished: false,
      uploadInProgress: false,
      uploadProgress: 0,
      uploadError: null,
      preflightInProgress: false,
      preflightError: null,
      preflightNiftiInfo: null,
      selectedFile: null,
      preflightWarnings: [],
      cancelTokenSource: null,
      segmentationExplanation: SEGMENTATION_EXPLANATION,
      isSegmentation: this.defaultNiftiCheckboxState
    }
  },
  components: {
    SigningComponent,
    InfoPopover
  },
  computed: {
    ...mapState('authStore', [
      'user'
    ]),
    ...mapState('dataSelectionStore', {
      url: ({ uploadUrl }) => uploadUrl
    }),
    ...mapState([
      'production'
    ]),
    uploadUrl: function () {
      return `${this.url}/upload`
    },
    preflightUrl: function () {
      return `${this.url}/preflight`
    },
    uploadHeader: function () {
      const idToken = this.user && this.user.idToken || process.env.VUE_APP_ID_TOKEN
      return idToken
        ? { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + idToken }
        : { 'Content-Type': 'multipart/form-data' }
    },
    uploadProgressPercentage: function () {
      return (this.uploadProgress * 100).toFixed(2) + '%'
    },
    uploadBtnDisabled: function () {
      return this.uploadInProgress || this.preflightInProgress || this.preflightError || !this.selectedFile
    },
    customHeader: function () {
      const header = {}
      header[`X-${IMAGE_SERVICE_NAME}-FILESIZE`] = this.selectedFile && this.selectedFile.size
        ? this.selectedFile.size
        : 'UNKNOWN'
      header[`X-${IMAGE_SERVICE_NAME}-SEGMENTATION`] = this.isSegmentation
      return header
    }
  },
  methods: {
    ...mapActions({
      modalMessage: 'modalMessage',
      log: 'log'
    }),
    ...mapMutations('dataSelectionStore', [
      'setUploadUrl'
    ]),
    showNiftiInfo: function (info) {
      this.modalMessage({
        variant: 'info',
        title: 'Nifti info',
        htmlBody: makeHtmlFragmentForNifti({
          warnings: this.preflightWarnings,
          nifti: this.preflightNiftiInfo
        })
      })
    },
    cancelUpload: function () {
      if (this.cancelTokenSource && this.cancelTokenSource.cancel && this.cancelTokenSource.cancel instanceof Function) {
        this.cancelTokenSource.cancel('Cancelled by user')
        this.$emit('upload', {
          cancelled: 'Cancelled by user'
        })
      }
    },
    uploadUrlChanged: function (ev) {
      const value = ev && ev.target && ev.target.value
      if (value)
        this.setUploadUrl({
          uploadUrl: value
        })
    },
    fileInputChanged: function (ev) {
      
      /**
       * File reader is available in webworker
       */
      const fileInput = this.$refs.fileInput
      const file = fileInput.files[0]

      this.selectedFile = file

      if (!file) return

      const blob = file.slice(0, 2048)
      const fileReader = new FileReader()
      fileReader.onload = ev => {
        const result = ev && ev.target && ev.target.result
        if (result) {
          const _2048B64 = arrayBufferToBase64String(result)
          const { name, size, type } = file
          /**
           * DO PREFLIGHT HERE
           */
          this.log({
            name, size, type, _2048B64
          })

          /**
           * or use formdata
           */
          const blob = new Blob([new Uint8Array(result)])
          const slicedFile = new File([blob], name)

          const formData = new FormData()
          formData.append('image', slicedFile)

          this.preflightInProgress = true
          this.preflightWarnings = []
          this.preflightNiftiInfo = null
          this.preflightError = null
          axios.post(this.preflightUrl, formData, {
            headers: { ...this.uploadHeader, ...this.customHeader }
          })
            .then(resp => {
              const { data } = resp
              const { warnings, nifti } = data
              this.preflightInProgress = false
              this.preflightError = null

              this.preflightWarnings = warnings
              this.preflightNiftiInfo = nifti

              this.$emit('preflight', { data })
            })
            .catch(error => {
              this.preflightInProgress = false
              this.log(['Prefligght error', { error }])
              const errorMessage = (error && error.response && error.response.data) || 'An unknown preflight error errored'
              this.preflightError = errorMessage

              this.$emit('preflight', {error: errorMessage})
            })
          
        } else {
          /**
           * TODO handle error
           */
        }
      }
      fileReader.onerror = (err) => {
        /**
         * TODO handle error
         */
      }
      fileReader.readAsArrayBuffer(blob)
    },
    showUploadResult: function () {
      this.modalMessage({ 
        title: 'hello', 
        htmlBody: `<span style="color:red">wolrd</span>`, 
        variant: 'info'
      })
    },
    upload: function () {
      if (this.url === 'http://example.com') {
        return
      }
      if (this.uploadInProgress) {
        return 
      }
      
      const formData = new FormData()
      this.uploadError = null
      const fileInput = this.$refs.fileInput
      formData.append('image', fileInput.files[0])
      this.uploadProgress = 0
      this.uploadInProgress = true

      this.cancelTokenSource = axios.CancelToken.source()

      this.$emit('upload', {
        started: true
      })

      axios({
        method: 'POST',
        url: this.uploadUrl,
        data: formData,
        headers:  {...this.uploadHeader, ...this.customHeader },
        cancelToken: this.cancelTokenSource.token,
        onUploadProgress: ({loaded, total}) => {
          this.uploadProgress = loaded/total
        }
      }).then(({ data }) => {
        fileInput.value = null
        this.selectedFile = null
        this.cancelTokenSource = null
        this.uploadFinished = true
        setTimeout(() => {
          this.uploadFinished = false
        }, 3000)
        this.uploadInProgress = false
        
        this.preflightNiftiInfo = null
        this.preflightWarnings = []
        this.preflightError = null

        this.$emit('upload', { 
          complete: true,
          data
        })

      }).catch(e => {
        this.cancelTokenSource = null
        this.log(['upload error', { error: e }])
        this.uploadError = (e && e.response && e.response.data) || (e && e.message) ||  'Error: Canont send the file...'
        this.uploadInProgress = false
        
        this.$emit('upload', {
          error: this.uploadError
        })
      })
    }
  }
}
</script>
<style scoped>
.container
{
  position: relative;
}

.container > .uploadUI
{
  position: relative;
  top: 0;
  left: 0;
}

.container > .uploadScreenOverlay
{
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.8);
  color: black;
  padding: 2em 1em;
  width: 100%;
  height: 100%;
}
.spinnerAnimationCircle
{
  width: 1em;
  height: 1em;
}
</style>
