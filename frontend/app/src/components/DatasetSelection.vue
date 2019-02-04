<template>
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
          v-model = "selectedReferenceVolumeId">
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

        <!-- incoming volume control -->
        <!-- currently only supports delete -->
        <div v-if="selectedIncomingVolumeId" class="input-group-append">
          <!-- wrapper required because .disabled has pointer-events: none -->
          <!-- relevant SO issue: -->
          <!-- https://github.com/twbs/bootstrap/issues/10049 -->
          <!-- https://github.com/twbs/bootstrap/pull/11094 -->
          <div
            :title="deleteBtnTooltipText"
            v-b-tooltip.hover.right>
            <div
              @click="removeSelectedIncVolume()"
              :class="deleteBtnClass"
              class="input-group-btn btn">
              <font-awesome-icon icon="trash-alt" />
              Delete
            </div>
          </div>
        </div>
      </div>

      <!-- deletion feedback -->
      <div
        v-if="showAlert"
        :class="alertClass"
        class="alert">
        {{ deletionError }}
        {{ deletionMessage }}
      </div>

    </div>

    <upload-volume-component />
    <hr />
    <router-link to = "/step1">
      <div
        :disabled="bothSelected"
        :class = "nextStepClass"
        class="float-sm-right btn">
        Start registration!
      </div>
    </router-link>
  </div>
</template>

<script>
import UploadVolumeComponent from '@/components/UploadVolume'
export default {
  components: {
    UploadVolumeComponent
  },
  data: function () {
    return {
      dummyIncomingVolume: {
        id: null,
        name: '-- Please select an incoming volume --',
        disabled: true
      },
      deletionInProgress: false,
      deletionError: null,
      deletionMessage: null,
      timeoutId:null
    }
  },
  computed: {
    showAlert: function () {
      return this.deletionError || this.deletionMessage
    },
    alertClass: function () {
      return this.deletionError
        ? 'alert-danger'
        : this.deletionMessage
          ? 'alert-success'
            : 'alert-info'
    },
    deleteBtnClass: function () {
      return this.incomingVolumeCanBeDeleted
        ? `btn-danger ${this.deletionInProgress ? 'disabled' : ''}`
        : 'btn-secondary disabled'
    },
    deleteBtnTooltipText: function() {
      return this.incomingVolumeCanBeDeleted
        ? 'Delete this incoming volume.'
        : 'This volume cannot be deleted.'
    },
    incomingVolumeCanBeDeleted: function () {
      return this.selectedIncomingVolumeId && /^user-/.test(this.selectedIncomingVolumeId)
    },
    selectedReferenceVolumeId: {
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
      return this.selectedReferenceVolumeId && this.selectedIncomingVolumeId
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
  mounted() {
    this.$store.subscribeAction(({type, payload}) => {
      if (type === 'updateIncVolumesResult') {
        const {message, error} = payload

        if (!message || !/^Delete/.test(message)) {
          return
        }

        if (this.timeoutId) {
          clearTimeout(this.timeoutId)
        }

        if (error) {
          this.deletionError = message
        } else {
          this.deletionMessage = message
        }
        this.timeoutId = setTimeout(() => {
          this.deletionError = null
          this.deletionMessage = null
        }, 5000)
      }
    })
  },
  methods: {
    removeSelectedIncVolume: function () {
      const confirm = window.confirm(`Are you sure you would like to delete the incoming volume: ${this.selectedIncomingVolumeId}?
      
      Please note, this action is non-reversible`)
      if (!confirm) {
        return
      }
      this.deletionInProgress = true
      this.$store.dispatch('deleteIncomingVolume', { id: this.selectedIncomingVolumeId })
    },
    nextStep: function () {
      this.$store.dispatch('nextStep')
    }
  },
}
</script>

<style scoped>
.container
{
  pointer-events: all;
}
.title
{
  margin-bottom: 1em;
}
</style>
