<template>
  <div>

    <!-- header -->
    <div class="card bg-light" @mousedown="$emit('header-mousedown', $event)">
      <h5 class="title">
        Landmark Control V2
      </h5>
    </div>

    <div class="bg-light">

      <!-- add load save -->
      <div class="btn-group mb-3">
        <button
          type="button"
          @click="$store.dispatch('loadLandmarks')"
          class="btn btn-lg btn-secondary">
          <font-awesome-icon icon="file-upload"/>
          Load
        </button>
      </div>
    </div>

    <div class="bg-light">
      <b-tabs>
        <b-tab @click="toggleLandmark('reference')" :active="_step2OverlayFocus === 'reference'" title="Reference">

        </b-tab>
        <b-tab @click="toggleLandmark('incoming')" :active="_step2OverlayFocus === 'incoming'" title="Incoming">

        </b-tab>
      </b-tabs>
    </div>

    <LandmarkListV2
      v-if="_step2OverlayFocus === 'incoming'"
      :showLink="true"
      :landmarks="incomingLandmarks"
      class="body bg-light" />

    <LandmarkListV2
      v-if="_step2OverlayFocus === 'reference'"
      :showLink="true"
      :landmarks="referenceLandmarks"
      class="body bg-light" />

  </div>
</template>
<script>
import LandmarkListV2 from '@/components/LandmarkListV2'
export default {
  components: {
    LandmarkListV2
  },
  methods: {
    toggleLandmark: function (mode) {
      this.$store.commit('_setStep2OverlayFocus', { mode })
    }
  },
  computed: {
    _step2OverlayFocus: function () {
      return this.$store.state._step2OverlayFocus
    },
    incomingLandmarks: function () {
      return this.$store.state.incomingLandmarks
    },
    referenceLandmarks: function () {
      return this.$store.state.referenceLandmarks
    }
  }
}
</script>
<style scoped>
.title
{
  padding-left: 1em;
  padding-right: 1.5em;
  padding-top: 3em;
  padding-bottom:0.5em;
  margin-bottom:0;

  transition: linear 150ms all;
}
.title:hover
{
  background-color: rgba(125,125,125,0.15);
  cursor: move;
}

.body
{
  padding: 1em;
}
</style>
