<template>
  <div class = "splashscreen-container">
    <div v-if = "false" class="jumbotron jumbotron-fluid">
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
    <div id="referenceDataset" class="mb-5">
      <div class="title">
        <strong>
          Reference Volume:
        </strong>
      </div>
      <div class="mb-1 input-group">

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
    </div>

    <!-- incoming voluems -->
    <div>
      <div class = "title">
        <strong>
          Incoming Volume
        </strong>
      </div>
      <div class="input-group">
        <select
          class = "form-control"
          v-model = "selectedIncomingVolumeId">
          <option
            v-for = "incomingVolume in incomingVolumes"
            :disabled = "incomingVolume.disabled"
            :key = "incomingVolume.id"
            :value = "incomingVolume.id">
            {{ incomingVolume.name }}
          </option>
        </select>

      </div>
      <div>
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
        class="float-sm-right btn">
        Start registration!
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
      dummyIncomingVolume: {
        id: null,
        name: '-- Please select an incoming volume --',
        disabled: true
      }
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
        return (selIncVol && selIncVol.id) || null
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
      return this.selectReferenceVolumeId && this.selectedIncomingVolumeId
    },
    referenceVolumes: function () {
      return this.$store.state.referenceVolumes
    },
    incomingVolumes: function () {
      return [this.dummyIncomingVolume, ...this.$store.state.incomingVolumes]
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
.title
{
  margin-bottom: 1em;
}
</style>
