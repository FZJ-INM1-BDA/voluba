<template>
  <div
    :style="rowStyle"
    class="input-group">
    
    <!-- prepend -->
    <slot name="prepend"></slot>

    <!-- landmark name -->
    <input
      type="text"
      class="form-control"
      v-model="landmarkName"
      />

    <!-- append -->
    <slot name="append"></slot>
  </div>  
</template>
<script>
export default {
  props: {
    showAppend: {
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

    }
  },
  computed: {
    rowStyle: function () {
      return {
        // opacity: this.landmark.active ? 1.0 : 0.3
      }
    },
    landmarkName: {
      get: function () {
        return this.landmark && typeof this.landmark.name !== 'undefined' && this.landmark.name !== null
          ? this.landmark.name
          : `Untitled`
      },
      set: function (name) {
        this.$emit('changeName', { name })
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
