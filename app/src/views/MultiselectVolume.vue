<template>
  <div>
    <b-card
      v-for="groupV in groupedVolumes"
      :key="groupV[0]"
      class="mt-2"
      no-body
      :header="groupV[0]"
    >
      <b-list-group flush>
        <b-list-group-item
          v-for="volume in groupV[1]"
          @click="toggleVolumeSelection(volume)"
          :key="volume.id"
          :data-volume-id="volume.id"
          button
          :active="checkedId.indexOf(volume.id) >= 0"
        >
          <span :class="checkedId.indexOf(volume.id) >= 0 ? 'visible' : 'invisible'">
            <font-awesome-icon icon="check" />
          </span>

          <span class="ml-1 d-inline-block d-inline-flex align-items-center">
            <span>
              {{ volume.name }}
            </span>
            <AddXform
              @xformsChanged="xformChangedHandler({ event: $event, id: volume.id })"
              class="d-inline-block ml-2"
              :applyCurrentXform="selectedIncomingVolumeId === volume.id"
              :show="checkedId.indexOf(volume.id) >= 0"
              :showAddBtn="checkedId.indexOf(volume.id) >= 0"/>
          </span>
        </b-list-group-item>
      </b-list-group>
    </b-card>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { groupByVisibility } from "@/constants";
import AddXform from "@/components/AddXform";
import { getTransformMatrixInNm } from '@/constants'
export default {
  components: {
    AddXform
  },
  data: function() {
    return {
      checkedId: [],
      xformMap: new Map()
    };
  },
  computed: {
    ...mapState("dataSelectionStore", [
      "selectedIncomingVolumeId",
      "incomingVolumes"
    ]),
    ...mapState('nehubaStore', [
      'incTransformMatrix'
    ]),
    ...mapState("dataSelectionStore", {
      groupedVolumes: state => groupByVisibility(state.incomingVolumes)
    }),
    bundledVolume: function() {
      return this.checkedId.map(cId => {
        const foundVol = this.incomingVolumes.find(({ id }) => id === cId);
        if (foundVol) return foundVol;
        else {
          this.log({
            message: `volumeId ${cId} not found in incomingvolumes`,
            incomingVol: this.incomingVolumes
          });
          return null;
        }
      });
    }
  },
  mounted: function() {
    this.checkedId = [this.selectedIncomingVolumeId];
  },
  methods: {
    ...mapActions(["log"]),
    xformChangedHandler: function ({ id, event: xforms }) {
      const compileddXforms = xforms
        .map(({ type, matrix }) => type === 'incTransformMatrix'
          ? getTransformMatrixInNm(this.incTransformMatrix)
          : matrix)
      this.xformMap.set(id, compileddXforms)
    },
    toggleVolumeSelection: function({ id }) {
      if (this.checkedId.indexOf(id) >= 0) {
        this.checkedId = this.checkedId.filter(i => i !== id);
      } else {
        this.checkedId = [...this.checkedId, id];
      }
    }
  }
};
</script>

<style>
.visible {
  visibility: visible !important;
}

.invisible {
  visibility: hidden !important;
}
</style>