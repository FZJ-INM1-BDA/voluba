<template>
  <div
    :style="nibStyle"
    id="container">

    <!-- icon -->
    <div
      @click="toggleOpen"
      :class="open ? '' : 'btn-shadow'"
      class="icon">
      <slot name="icon"></slot>
    </div>

    <!-- body -->
    <div
      v-if="open"
      class="layer-control">
      <slot name="body"></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    tooltip: {
      type: String,
      default: null
    },
    initOpen: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      open: this.initOpen
    }
  },
  methods: {
    toggleOpen: function () {
      this.open = !this.open
      this.$emit('toggleOpen', this.open)
    }
  },
  computed: {
    nibStyle: function () {
      return {
        zIndex: this.open
          ? 5
          : 1
      }
    }
  },
}
</script>
<style scoped>
#container
{
  position:relative;
  display:inline-block;
}

.icon
{
  margin: 1em;
  position:relative;
  display: inline-block;
  z-index: 1;
  pointer-events: all;
}
.layer-control
{
  position: absolute;
  display: inline-block;
  z-index: 0;
  top: 0;
  left: 0;
  pointer-events: all;
  box-shadow: 0 0.4em 0.4em -0.2em rgba(50, 50, 50, 0.2);
}

.layer-control
{
  width: 20em;
}
</style>
