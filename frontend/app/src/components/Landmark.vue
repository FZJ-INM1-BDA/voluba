<template>
  <div
    :style = "{opacity: active ? '1.0' : '0.3'}"
    class="input-group mb-1">
    <div class="input-group-prepend">

      <!-- select -->
      <div @click = "toggleActive" class="input-group-text">
        <input type="checkbox" :checked = "active" />
      </div>

      <!-- color -->
      <div
        :title = "color"
        v-b-tooltip.hover
        :style = "{backgroundColor : color}"
        class="input-group-text color-container">
        &nbsp;
      </div>
      
    </div>

    <!-- name -->
    <input
      class="form-control"
      type="text"
      :value = "name"
      @change = "changeName">

    <div class="input-group-append">

      <!-- go to landmark -->
      <button
        @click.stop.prevent = "gotoLandmark"
        type="button"
        class="btn btn-sm btn-primary"
        v-b-tooltip.hover title="Go to landmark-pair">
        <font-awesome-icon icon = "map-marker-alt"/>
      </button>

      <!-- relocate landmark -->
      <button
        v-b-tooltip.hover
        title="Reset landmark-pair to current location"
        @click.stop.prevent = "focusLandmark"
        type="button"
        class="btn btn-sm btn-warning">
        <font-awesome-icon icon="thumbtack" style="color: white;"/>
      </button>

      <!-- trash landmark -->
      <button
        @click.stop.prevent = "removeLandmarkPair"
        type="button"
        class="btn btn-sm btn-danger"
        v-b-tooltip.hover title="Remove landmark-pair">
        <font-awesome-icon icon="trash-alt"/>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Landmark',
  props: {
    id: String,
    name: String,
    color: String,
    active: Boolean,
    visible: Boolean
  },
  watch: {
  },
  methods: {
    changeName: function (ev) {
      const element = ev.srcElement || ev.originalTarget
      this.$store.dispatch('changeLandmarkPairName', {
        id: this.id,
        name: element.value
      })
    },
    toggleActive: function () {
      this.$store.dispatch('toggleLandmarkPairActive', {
        id: this.id
      })
    },
    toggleVisibility: function () {
      this.$store.dispatch('toggleLandmarkPairVisibility', {
        id: this.id
      })
    },
    gotoLandmark: function () {
      this.$store.dispatch('gotoLandmark', {
        pairId: this.id
      })
    },
    focusLandmark: function () {
      this.$store.dispatch('focusLandmarkPair', {
        id: this.id
      })
    },
    removeLandmarkPair: function () {
      this.$store.dispatch('removeLandmarkPair', { id: this.id })
      this.$store.dispatch('removeReferenceLandmark', { id: this.refId })
      this.$store.dispatch('removeIncomingLandmark', { id: this.incId })
    },
  },
  computed: {}
}
</script>

<style scoped>
.color-container:hover
{
  cursor: default;
}
</style>
