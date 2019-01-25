<template>
  <div class = "splashscreen-container">
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
        v-model = "selectReferenceVolumeId">
        <option
          v-for="referenceVolume in referenceVolumes"
          :key="referenceVolume.id"
          :value="referenceVolume.id">
          {{ referenceVolume.name }}
        </option>
      </select>
    </div>

    <!-- incoming voluems -->
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text">Incoming Volume</span>
      </div>
      <select
        class = "form-control"
        v-model = "selectedIncomingVolumeId">
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
    <router-link to = "/step1">
      <div
        :disabled="bothSelected"
        :class = "nextStepClass"
        class="btn">
        next step
      </div>
    </router-link>
    <upload-modal id="uploadModal" />
    </div>
  </div>
</template>

<script>
import UploadModal from '@/components/modals/UploadModal'
export default {
  data: function () {
    return {
      
    }
  },
  computed: {
    selectReferenceVolumeIdx: {
      get: function () {
        return this.$store.state.selectReferenceVolumeIdx
      },
      set: function (idx) {
        this.$store.dispatch('selectReferenceVolumeWithIndex', idx)
      }
    },
    selectReferenceVolumeId: {
      get: function () {
        return this.$store.state.selectedReferenceVolumeId
      },
      set: function (id) {
        this.$store.dispatch('selectReferenceVolumeWithId', id)
      }
    },
    selectedIncomingVolumeId: {
      get: function () {
        const id = this.$store.state.selectedIncomingVolumeId
        const selIncVol = this.$store.state.incomingVolumes.find(v => v.id === id)
        return selIncVol && selIncVol.id
      },
      set: function (id) {
        this.$store.dispatch('selectIncomingVolumeWithId', id)
      }
    },
    nextStepClass: function () {
      return this.bothSelected
        ? 'btn-primary'
        : 'btn-secondary disabled'
    },
    bothSelected: function () {
      return this.selectReferenceVolumeId !== null && this.selectedIncomingVolumeId !== null
    },
    referenceVolumes: function () {
      return this.$store.state.referenceVolumes
    },
    incomingVolumes: function () {
      return this.$store.state.incomingVolumes
    }
  },
  beforeRouteLeave: function (to, from, next) {
    if (!this.bothSelected) {
      next(false)
    } else {
      next()
    }
  },
  components: {
    UploadModal
  },
  methods: {
    nextStep: function () {
      this.$store.dispatch('nextStep')
    }
  },
}
</script>

<style scoped>
.splashscreen-container
{
  pointer-events: all;
}
</style>
