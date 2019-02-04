<template>
<div>

  <div v-if="false">
    <b-button
      @click="$store.dispatch('uploadVolume')"
      variant="link">
      <font-awesome-icon icon="upload"/> 
      <span>Upload</span>
    </b-button>
  </div>
  <hr />

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
  <input ref = "fileInput" type="file" class="form-control mb-3" />
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
  <div v-if="uploadFinished && !uploadError" class="alert alert-success">
    Upload Complete!
  </div>
  <div class="alert alert-danger" v-if="uploadError">
     <font-awesome-icon icon="exclamation-triangle" /> {{ uploadError }}
  </div>
</div>
</template>
<script>
import axios from 'axios'
/**
 * /upload
 * /user/list
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
  computed: {
    uploadProgressPercentage: function () {
      return (this.uploadProgress * 100).toFixed(2) + '%'
    }
  },
  mounted: function() {
    this.fetchUploadedVolumes()
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
    fetchUploadedVolumes: function () {
      this.$store.dispatch('updateIncVolumes')
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
      axios.post(this.url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: ({loaded, total}) => {
          this.uploadProgress = loaded/total
        }
      }).then(() => {
        this.uploadFinished = true
        this.uploadInProgress = false
        this.fetchUploadedVolumes()
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
.progress
{
  
}
</style>
