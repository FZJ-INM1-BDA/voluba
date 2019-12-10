<template>
  <div class="input-group">
    <select
      class="form-control form-control-sm"
      v-model="selectedIncomingVolumeId">
      <option
        :disabled="true"
        :value="dummyIncomingVolume.id">
        {{ dummyIncomingVolume.name }}
      </option>
      <optgroup
        v-for="groupV in groupedVolumes"
        :key="groupV[0]"
        :label="groupV[0]">
        <option
          v-for="volume in groupV[1]"
          :disabled="volume.disabled"
          :key="volume.id"
          :value="volume.id">
          {{ volume.name }}  
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

      <div
        v-b-tooltip.hover.right
        title="Refresh list"
        @click="updateIncVolumes"
        class="btn btn-default btn-sm">
        <font-awesome-icon icon="sync-alt"></font-awesome-icon>
      </div>

      <div
        v-if="selectedIncomingVolume && selectedIncomingVolume.extra"
        @click="showNiftiInfo(selectedIncomingVolume.extra)"
        class="d-inline-block btn-sm">
        <font-awesome-icon icon="info-circle"></font-awesome-icon>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { groupByVisibility } from '@/constants'
export default {
  mounted: function () {

    this.updateIncVolumes()
    this.$store.subscribeAction(({type, payload}) => {
      if (type === 'dataSelectionStore/updateIncVolumesResult') {
        const {message, error} = payload

        if (!message || !/^Delete/.test(message)) {
          return
        }

        this.$emit( error
          ? 'error'
          : 'message', { message })

        this.deletionInProgress = false
      }
    })
  },
  data: function () {
    return {
      deletionInProgress: false,
      dummyIncomingVolume: {
        id: null,
        name: '-- Please select an incoming volume --',
        disabled: true
      },
    }
  },
  computed: {

    ...mapGetters('dataSelectionStore', [
      'selectedIncomingVolume'
    ]),
    ...mapState('dataSelectionStore', {
      groupedVolumes: state => groupByVisibility(state.incomingVolumes),
      stateSelectedIncomingVolumeId: state => state.selectedIncomingVolumeId
    }),

    incomingVolumeCanBeDeleted: function () {
      return this.selectedIncomingVolume && this.selectedIncomingVolume.visibility === 'private'
    },
    selectedIncomingVolumeId: {
      get: function () {
        return this.stateSelectedIncomingVolumeId
      },
      set: function (id) {
        this.selectIncomingVolumeWithId(id)
      }
    },
    deleteBtnClass: function () {
      return this.incomingVolumeCanBeDeleted
        ? `btn-danger`
        : 'btn-secondary disabled'
    },
    deleteBtnTooltipText: function() {
      return this.incomingVolumeCanBeDeleted
        ? 'Delete this incoming volume.'
        : 'This volume cannot be deleted.'
    },
  },
  methods: {
    ...mapActions('dataSelectionStore', [
      'selectIncomingVolumeWithId',
      'updateIncVolumes',
      'deleteIncomingVolume'
    ]),
    ...mapActions([
      'modalMessage'
    ]),
    showNiftiInfo: function (extra) {
      this.modalMessage({
        variant: 'success',
        title: 'Upload Successful',
        htmlBody: makeHtmlFragmentForNifti(extra)
      })
    },
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
  }
}
</script>
<style scoped>
  
</style>