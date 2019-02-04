<template>
  <div
    id="container">

    <!-- icon -->
    <div
      @click="open = !open"
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
  }
}
</script>
<style scoped>
#container
{
  position:relative;
}

.icon
{
  margin: 1em;
  position:absolute;
  z-index: 1;
}
.layer-control,
.layer-control-toggle {
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  box-shadow: 0 0.4em 0.4em -0.2em rgba(50, 50, 50, 0.2);
}

.layer-control
{
  width: 20em;
}
</style>
