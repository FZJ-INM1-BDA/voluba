<template>
  <div>
    <!-- layercontrol unit -->
    <layer-control :initOpen="true" class="pointer-events" />
  </div>
</template>
<script>
import LayerControl from '@/components/LayerControl'

export default {
  components: {
    LayerControl
  }
}
</script>
<style scoped>
.layerController {
  pointer-events: all;
  width: 22em;
  margin-left: 1em;
  margin-top: 1em;
  position: relative;
}


.pointer-events
{
  pointer-events: all;
}
</style>
