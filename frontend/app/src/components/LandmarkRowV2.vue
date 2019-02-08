<template>
  <div
    :style="rowStyle"
    class="input-group mb-1">
    
    <!-- prepend -->
    <div v-if="false" class="input-group-prepend">
      <div class="input-group-text">
        <input type="checkbox" :checked="landmark.active"/>
      </div>
    </div>

    <!-- landmark name -->
    <input
      type="text"
      class="form-control"
      :value="name"
      @change="changeName" />

    <!-- append -->
    <div
      @mouseleave="showIcon=false"
      class="input-group-append">

      <!-- go to landmark -->
      <button
        v-if="showIcon"
        @click.stop.prevent = "gotoLandmark"
        type="button"
        class="btn btn-sm btn-primary"
        v-b-tooltip.hover title="Go to landmark">
        <font-awesome-icon icon = "map-marker-alt"/>
      </button>

      <!-- relocate landmark -->
      <button
        v-if="showIcon"
        v-b-tooltip.hover
        title="Reset landmark to current location"
        @click.stop.prevent = "resetLandmark"
        type="button"
        class="btn btn-sm btn-warning">
        <font-awesome-icon icon="thumbtack" style="color: white;"/>
      </button>

      <!-- trash landmark -->
      <button
        v-if="showIcon"
        @click.stop.prevent = "removeLandmark"
        type="button"
        class="btn btn-sm btn-danger"
        v-b-tooltip.hover title="Remove landmark">
        <font-awesome-icon icon="trash-alt"/>
      </button>

      <!-- link btn -->
      <button
        v-if="showLink && showIcon"
        type="button"
        v-b-tooltip.hover title="Paired landmark"
        class="btn btn-sm btn-secondary">
        <font-awesome-icon icon="link"/>
      </button>

      <button
        @mouseover="showIcon=true"
        v-if="!showIcon"
        class="btn btn-sm btn-secondary">
        <font-awesome-icon icon="ellipsis-h"></font-awesome-icon>
      </button>
    </div>
  </div>  
</template>
<script>
export default {
  props: {
    showLink: {
      type: Boolean,
      default: false
    },
    landmark: {
      type: Object,
      default: function () {
        return null
      }
    }
  },
  data: function () {
    return {
      showIcon: false
    }
  },
  methods: {
    removeLandmark: function () {

    },
    gotoLandmark: function () {

    },
    resetLandmark: function () {

    },
    changeName: function (val) {
      this.$emit('changeName', val)
      console.log('changename', val)
    }
  },
  computed: {
    rowStyle: function () {
      return {
        // opacity: this.landmark.active ? 1.0 : 0.3
      }
    },
    name: function () {
      return this.landmark
        ? this.landmark.name
        : `Untitled`
    }
  }
}
</script>
<style scoped>

</style>
