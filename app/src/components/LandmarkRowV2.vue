<template>
  <div
    class="input-group">
    
    <!-- prepend -->
    <slot name="prepend"></slot>

    <!-- landmark name -->
    <input
      v-if="showInput"
      :style="rowStyle"
      type="text"
      :class="size ? 'form-control-' + size : ''"
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
    showInput: {
      type: Boolean,
      default: false
    },
    showAppend: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: null
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
  computed: {
    rowStyle: function () {
      return {
        opacity: this.landmark.active ? 1.0 : 0.3
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
.form-control
{
  background-color: rgba(0, 0, 0, 0);
}
</style>
