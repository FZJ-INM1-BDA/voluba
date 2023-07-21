<template>
  <div class="input-group">

    <select
      class="form-control form-control-sm"
      v-model="selectedReferenceVolumeId">
      <option
        :disabled="true"
        :value="dummyReferenceVolume.id">
        {{ dummyReferenceVolume.name }}
      </option>
      <option
        v-for="volume in referenceVolumes"
        :disabled="volume.disabled"
        :key="volume.id"
        :value="volume.id">
        {{ volume.name }}
      </option>
    </select>


  </div>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex';
export default {
  mounted: function () {

  },
  data: function () {
    return {
      dummyReferenceVolume: {
        id: null,
        name: '-- Please select an reference volume --',
        disabled: true
      },
    }
  },
  computed: {

    ...mapGetters('dataSelectionStore', [
      'referenceVolumes'
    ]),
    ...mapState('dataSelectionStore', {
      stateSelectedReferenceVolumeId: state => state.selectedReferenceVolumeId,
    }),

    selectedReferenceVolumeId: {
      get: function () {
        return this.stateSelectedReferenceVolumeId
      },
      set: function (id) {
        this.selectReferenceVolumeWithId(id)
      }
    },
  },
  methods: {
    ...mapActions('dataSelectionStore', [
      'selectReferenceVolumeWithId',
    ]),
  }
}
</script>
<style scoped>
.input-group {
  margin-bottom: 20px;
}
</style>
