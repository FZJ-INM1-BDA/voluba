<template>
  <div class="input-group">

    <div class="private-volume-selector">
      <input type="checkbox" id="checkbox" class="mr-2" v-model="privateVolumesEnabled" 
            :disabled="!(privateVolumes && privateVolumes.length)"/>
      <label for="checkbox">{{ 'Select private volume as a reference volume.' }}</label>
    </div>

    <select
      v-if="!privateVolumesEnabled"
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

    <select
      v-if="privateVolumesEnabled"
      class="form-control form-control-sm"
      v-model="selectedPrivateReferenceVolumeId">
      <option
        :disabled="true"
        :value="dummyReferenceVolume.id">
        {{ dummyReferenceVolume.name }}
      </option>
      <option
        v-for="volume in privateVolumes"
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
      privateVolumesEnabled: false
    }
  },
  computed: {

    ...mapGetters('dataSelectionStore', [
      'referenceVolumes',
    ]),
    ...mapState('dataSelectionStore', {
      privateVolumes: state => state.incomingVolumes.filter(iv => iv.visibility === 'private'),
      stateSelectedReferenceVolumeId: state => state.selectedReferenceVolumeId,
      stateSelectedPrivateReferenceVolumeId: state => state.selectedPrivateReferenceVolumeId,
    }),

    selectedReferenceVolumeId: {
      get: function () {
        return this.stateSelectedReferenceVolumeId
      },
      set: function (id) {
        this.selectReferenceVolumeWithId(id)
      }
    },

    selectedPrivateReferenceVolumeId: {
      get: function () {
        return this.stateSelectedPrivateReferenceVolumeId
      },
      set: function (id) {
        this.selectPrivateReferenceVolumeWithId(id)
      }
    },
  },
  watch: {
    privateVolumesEnabled(val) {
      this.selectedPrivateReferenceVolumeId = val? this.privateVolumes[0].id : null
    }
  },
  methods: {
    ...mapActions('dataSelectionStore', [
      'selectReferenceVolumeWithId',
      'selectPrivateReferenceVolumeWithId'
    ])
  }
}
</script>
<style scoped>
.input-group {
  margin-bottom: 20px;
  display: inline-flex;
  flex-direction: column;
}
.form-control {
  width: 100% !important;
}
.private-volume-selector {
  display: flex;
  flex-wrap: nowrap;
}
</style>
