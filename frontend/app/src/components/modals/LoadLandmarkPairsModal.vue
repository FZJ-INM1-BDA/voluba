<template>
  <b-modal
    :id="id"
    centered
    ref="modal"
    title="Load Landmark-Pairs"
    header-bg-variant="secondary"
    header-text-variant="light"
    ok-variant="secondary"
    ok-title="Cancel"
    ok-only>

    <div class="alert alert-danger">
      <font-awesome-icon icon="exclamation-triangle"></font-awesome-icon>
      {{ loadLmWarning }}
    </div>
    
    <button
      type="button"
      @click="loadDefaultLandmarkPairs"
      class="btn btn-primary">
      Load old JSON
    </button>

    <button
      type="button"
      @click="showfileDialog"
      class="btn btn-primary">
      Browse ...
    </button>

    <b-alert :show="showAlert" variant="danger" dismissible>{{ errorMessage }}</b-alert>
  </b-modal>

</template>

<script>
import { oldJson, openFileDialog, loadFromFile } from '@//constants'
import { LOAD_LM_WARNING } from '@/text'

export default {
  name: 'UploadModal',
  props: {
    id: String
  },
  data: function () {
    return {
      errorMessage: '',
      showAlert: false
    }
  },
  methods: {
    hideModal: function () {
      this.$refs.modal.hide()
    },
    showModal: function () {
      this.$refs.modal.show()
    },
    loadDefaultLandmarkPairs: function () {
      this.errorMessage = ''
      this.showAlert = false
      this.hideModal()

      this.$store.dispatch('loadOldJson', {
        json: oldJson,
        config: {
          fixCenterTranslation: true
        }
      })
    },
    showfileDialog: function () {
      openFileDialog('file', 'application/json', null, this.loadLandmarkPairs)
    },
    loadLandmarkPairs: function (fileContent) {
      try {
        var jsonData = JSON.parse(fileContent)

        if (!('reference_landmarks' in jsonData) || !('incoming_landmarks' in jsonData) || !('landmark_pairs' in jsonData)) {
          this.errorMessage = 'Can not load Landmark-Pairs! Please check if the following keys exists: "reference_landmarks", "incoming_landmarks", "landmark_pairs".'
          this.showAlert = true
          return
        }

        this.$store.state.referenceLandmarks = jsonData.reference_landmarks
        this.$store.state.incomingLandmarks = jsonData.incoming_landmarks
        this.$store.state.landmarkPairs = jsonData.landmark_pairs

        this.errorMessage = ''
        this.hideModal()

      } catch(e) {
        console.log(e)
        this.errorMessage = 'Can not load Landmark-Pairs! Error: "Invalid JSON".'
        this.showAlert = true
      }
    }
  },
  computed: {
    loadLmWarning: function () {
      return LOAD_LM_WARNING
    }
  }
}
</script>

<style scoped>
</style>
