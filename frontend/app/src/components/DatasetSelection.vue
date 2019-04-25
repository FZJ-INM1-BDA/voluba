<template>
  <div class = "container">

    <!-- select reference volumes -->
    <div v-if="false" id="referenceDataset" class="mb-5">
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
          class = "form-control form-control-sm"
          v-model = "selectedIncomingVolumeId">
          <option
            :disabled="true"
            :value="dummyIncomingVolume.id">
            {{ dummyIncomingVolume.name }}
          </option>
          <optgroup label="Bundled volumes">
            <option
              v-for = "incomingVolume in defaultIncomingVolumes"
              :disabled = "incomingVolume.disabled"
              :key = "incomingVolume.id"
              :value = "incomingVolume.id">
              {{ incomingVolume.name }}
            </option>
          </optgroup>
          <optgroup v-if="publicIncomingVolumes.length > 0" label="Public volumes">
            <option
              v-for = "incomingVolume in publicIncomingVolumes"
              :disabled = "incomingVolume.disabled"
              :key = "incomingVolume.id"
              :value = "incomingVolume.id">
              {{ incomingVolume.name }}
            </option>
          </optgroup>
          <optgroup v-if="privateIncomingVolumes.length > 0" label="Private volumes">
            <option
              v-for = "incomingVolume in privateIncomingVolumes"
              :disabled = "incomingVolume.disabled"
              :key = "incomingVolume.id"
              :value = "incomingVolume.id">
              {{ incomingVolume.name }}
            </option>
          </optgroup>
        </select>

        <!-- incoming volume control -->
        <!-- currently only supports delete -->
        <div v-if="selectedIncomingVolume" class="input-group-append btn-group">

          <div
            @click="removeSelectedIncVolume"
            :class="deleteBtnClass"
            v-if="incomingVolumeCanBeDeleted"
            class="btn btn-sm"
            :title="deleteBtnTooltipText"
            v-b-tooltip.hover.right>
            <font-awesome-icon icon="trash-alt" />
          </div>
          <InfoPopover
            v-if="selectedIncomingVolume && selectedIncomingVolume.extra"
            placement="right"
            triggers="click blur"
            :popoverObj="selectedIncomingVolume.extra.nifti" />
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
    <div
      @click="$emit('destroyMe')"
      :disabled="bothSelected"
      :class="nextStepClass"
      class="float-sm-right btn">
      Start
    </div>
  </div>
</template>

<script>
import UploadVolumeComponent from '@/components/UploadVolume'
import { mapActions, mapGetters, mapState } from 'vuex';
import InfoPopover from '@/components/InfoPopover'

export default {
  components: {
    UploadVolumeComponent,
    InfoPopover
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
    ...mapGetters({
      selectedIncomingVolume: 'selectedIncomingVolume'
    }),
    ...mapState({
      defaultIncomingVolumes: state => state.incomingVolumes.filter(v => !v.visibility),
      publicIncomingVolumes: state => state.incomingVolumes.filter(v => v.visibility === 'public'),
      privateIncomingVolumes: state => state.incomingVolumes.filter(v => v.visibility === 'private')
    }),
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
      /**
       * temporary disabling deletion
       */
      // return false
      return this.selectedIncomingVolume && this.selectedIncomingVolume.visibility === 'private'
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
    ...mapActions({
      deleteIncomingVolume: 'deleteIncomingVolume'
    }),
    removeSelectedIncVolume: function () {
      const confirm = window.confirm(`Are you sure you would like to delete the incoming volume: ${this.selectedIncomingVolumeId}?
      
      Please note, this action is non-reversible`)
      if (!confirm) {
        return
      }
      this.deletionInProgress = true
      this.deleteIncomingVolume({
        id: this.selectedIncomingVolumeId,
        incomingVolume: this.selectedIncomingVolume
      })
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
}
.title
{
  margin-bottom: 1em;
}
</style>
