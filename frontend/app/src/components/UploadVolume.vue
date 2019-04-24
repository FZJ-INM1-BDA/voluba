<template>
<div class="container">
  <hr />

  <!-- new upload container -->
  <div class="uploadUI">
    <h4>
      Upload a volume
    </h4>

    <div class="input-group mb-1">
      <div class="input-group-prepend">
        <span class="input-group-text">
          POST URL
        </span>
      </div>
      <input
        v-model="url"
        class="form-control"
        type="text" />
    </div>
    <input
      @change="fileInputChanged"
      ref="fileInput"
      type="file"
      class="form-control mb-3" />
    <div
      @click.stop.prevent="upload"
      :class="uploadInProgress?'disabled btn-secondary':'btn-primary'"
      class="btn mb-2">
      {{ uploadInProgress ? 'Uploading in progress...' : 'Upload to Server!'}}
    </div>
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

  <div v-if="!user" class="uploadScreenOverlay">
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
import { mapState, mapActions } from 'vuex'
import { processImageMetaData, arrayBufferToBase64String } from '@/constants'
import SigningComponent from '@/components/SigninComponent'
/**
 * /upload
 * /list
 * /user/nifti/filename.nii
 * /user/nifti/filename.nii.gz
 */
import { UPLOAD_URL } from '@/constants'
export default {
  data: function () {
    return {
      url: `${UPLOAD_URL}/upload`,
      uploadFinished: false,
      uploadInProgress: false,
      uploadProgress: 0,
      uploadError: null
    }
  },
  components: {
    SigningComponent
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    uploadProgressPercentage: function () {
      return (this.uploadProgress * 100).toFixed(2) + '%'
    }
  },
  mounted: function() {
    this.updateIncVolumes()
  },
  watch: {
    uploadFinished: function (val) {
      if (val) {
        setTimeout(() => {
          this.uploadFinished = false
        }, 5000)
      }
    }
  },
  methods: {
    ...mapActions({
      modalMessage: 'modalMessage',
      updateIncVolumes: 'updateIncVolumes'
    }),
    fileInputChanged: function (ev) {
      
      /**
       * File reader is available in webworker
       */
      const fileInput = this.$refs.fileInput
      const file = fileInput.files[0]

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
          console.log({
            name, size, type, _2048B64
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

      const idToken = this.user && this.user.idToken || process.env.VUE_APP_ID_TOKEN
      const headers = idToken
        ? { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + idToken }
        : { 'Content-Type': 'multipart/form-data' }
      console.log({headers})

      axios.post(this.url, formData, {
        headers,
        onUploadProgress: ({loaded, total}) => {
          this.uploadProgress = loaded/total
        }
      }).then(({ data }) => {
        this.uploadFinished = true
        this.uploadInProgress = false
        const { nifti, warnings, ...rest } = data

        const returnHtmlArray = []

        if (warnings && warnings.forEach) {
          warnings.forEach(warning => {
            returnHtmlArray.push(
              `<div class="alert alert-warning">${warning}</div>`
            )
          })
        }
        for (let key in nifti) {
          if (nifti[key])
            returnHtmlArray.push(
              `<div class="text-left">${key}<div class="text-muted">${nifti[key]}</div></div>`
            )  
        }

        this.modalMessage({
          variant: 'success',
          title: 'Upload Successful',
          htmlBody: returnHtmlArray.join('\n')
        })
        
        this.updateIncVolumes()
      }).catch(e => {
        console.log({e})
        this.uploadError = (e && e.response && e.response.data) || (e && e.message) ||  'Error: Canont send the file...'
        this.uploadFinished = true
        this.uploadInProgress = false
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
</style>
