<template>
  <div>
    <nib-component :style="draggingMixin__Style">

      <!-- icon -->
      <template slot="icon">
        <div
          v-b-tooltip.right.hover
          :title="configureIncVolTooltip"
          :class="showLayerControl ? '' : 'btn-shadow'"
          @click="toggleShowLayerControl"
          class="rounded-circle layer-control-toggle btn btn-sm btn-secondary point-events">
          <font-awesome-icon :icon="icon"/>
        </div>
      </template>

      <!-- body -->
      <template slot="body">
        <layer-control
          @header-mousedown="draggingMixin__StartDragging"
          class="point-events layer-control"
          v-if="computedShowLayerControl"/>
      </template>
    </nib-component>
  </div>
</template>
<script>
import LayerControl from "@/components/LayerControl"
import NibComponent from '@/components/NibComponent'
import DraggableMixin from '@/mixins/DraggableMixin'

export default {
  mixins: [
    DraggableMixin
  ],
  components: {
    LayerControl,
    NibComponent
  },
  data: function() {
    return {
      nehubaAppended: false,
      showLayerControl: false,
    };
  },
  computed: {
    incVolSelected: function () {
      return this.$store.state.incomingVolumeSelected
    },
    configureIncVolTooltip: function() {
      return `configure incoming volume`
    },
    computedShowLayerControl: function() {
      return this.nehubaAppended && this.showLayerControl
    },
    icon: function() {
      return this.showLayerControl
        ? "sliders-h" // 'times'
        : "sliders-h"
    }
  },
  methods: {
    toggleShowLayerControl: function () {
      this.showLayerControl = !this.showLayerControl
      if (!this.showLayerControl) {
        this.draggingMixin__ResetPosition()
      }
    }
  },
  mounted() {
    this.$store.state.appendNehubaPromise
      .then(() => this.nehubaAppended = true)
      .catch(console.error)
  }
};
</script>
<style scoped>
.layerController {
  pointer-events: all;
  width: 22em;
  margin-left: 1em;
  margin-top: 1em;
  position: relative;
}


.point-events
{
  pointer-events: all;
}
</style>
