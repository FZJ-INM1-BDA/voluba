<template>
  <div>
    <div class="jumbotron jumbotron-fluid">
      <div class="container">
        <h1>
          Spatial Registration
        </h1>
        <span>
          Select a reference volume and an incoming volume to get started.
        </span>
      </div>
    </div>
    <div class = "container">

    <!-- select reference volumes -->
    <div class="mb-1 input-group">
      <div class="input-group-prepend">
        <span class="input-group-text">
          Reference Volume
        </span>
      </div>

      <select
        class = "form-control"
        v-model = "selectReferenceIdx">
        <option
          v-for="referenceVolume in referenceVolumes"
          :key="referenceVolume.id"
          :value="referenceVolume.id">
          {{ referenceVolume.name }}
        </option>
      </select>
    </div>
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text">Incoming Volume</span>
      </div>

      <select
        class = "form-control"
        v-model = "selectedIncomingIdx">
        <option
          v-for = "incomingVolume in incomingVolumes"
          :key = "incomingVolume.id"
          :value = "incomingVolume.id">
          {{ incomingVolume.name }}
        </option>
      </select>

      <div class="input-group-append">
        <b-button variant="secondary" v-b-modal.uploadModal>
          <font-awesome-icon icon="upload"/>
          <span>Upload</span>
        </b-button>
      </div>
    </div>

    <hr />
    <div
      :disabled="bothSelected"
      :class = "nextStepClass"
      class="btn">
      next step
    </div>

    <upload-modal id="uploadModal" />
    </div>
  </div>
</template>

<script>
import UploadModal from '@/components/modals/UploadModal'
export default {
  data: function () {
    return {
      selectReferenceIdx: null,
      selectedIncomingIdx: null
    }
  },
  computed: {
    nextStepClass: function () {
      return this.bothSelected
        ? 'btn-primary'
        : 'btn-secondary disabled'
    },
    bothSelected: function () {
      return this.selectReferenceIdx !== null && this.selectedIncomingIdx !== null
    },
    referenceVolumes: function () {
      return this.$store.state.referenceVolumes
    },
    incomingVolumes: function () {
      return this.$store.state.incomingVolumes
    }
  },
  watch: {
    selectReference: function (val) {
      console.log(val)
    }
  },
  components: {
    UploadModal
  }
}
</script>

<style scoped>
</style>
