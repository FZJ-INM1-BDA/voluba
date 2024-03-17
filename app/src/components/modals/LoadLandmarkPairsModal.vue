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
      v-if="!production"
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
import { oldJson, openFileDialog, EXPORT_LANDMARKS_TYPE } from '@//constants'
import { LOAD_LM_WARNING } from '@/text'
import { mapActions, mapState, mapMutations } from 'vuex'

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
    ...mapActions({
      log: 'log'
    }),
    ...mapMutations('landmarksStore', [
      'setReferenceLandmarks',
      'setIncomingLandmarks',
      'setLandmarkPairs'
    ]),
    ...mapActions('landmarksStore', [
      'loadOldJson'
    ]),
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
      this.loadOldJson({
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

        if (jsonData['@type'] && jsonData['@type'] !== EXPORT_LANDMARKS_TYPE) {
          throw new Error(`JSON is not a landmarks json file!`)
        }

        if (!('reference_landmarks' in jsonData) || !('incoming_landmarks' in jsonData) || !('landmark_pairs' in jsonData)) {
          this.errorMessage = 'Can not load Landmark-Pairs! Please check if the following keys exists: "reference_landmarks", "incoming_landmarks", "landmark_pairs".'
          this.showAlert = true
          return
        }

        this.showAlert = false

        this.setReferenceLandmarks({
          referenceLandmarks: jsonData.reference_landmarks
        })
        this.setIncomingLandmarks({
          incomingLandmarks: jsonData.incoming_landmarks
        })
        this.setLandmarkPairs({
          landmarkPairs: jsonData.landmark_pairs
        })

        this.errorMessage = ''
        this.hideModal()

      } catch(e) {
        this.log(e)
        this.errorMessage = e.toString()
        this.showAlert = true
      }
    }
  },
  computed: {
    ...mapState({
      production: 'production'
    }),
    loadLmWarning: function () {
      return LOAD_LM_WARNING
    }
  }
}
</script>

<style scoped>
</style>
