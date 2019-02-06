<template>
  <nib-component
    :initOpen="initOpen"
    :style="draggingMixin__Style">

    <!-- icon -->
    <template slot="icon">
      <div
        v-b-tooltip.right.hover
        :title="configureIncVolTooltip"
        :class="showLayerControl ? '' : 'btn-shadow'"
        @click="toggleShowLayerControl"
        class="rounded-circle layer-control-toggle btn btn-sm btn-secondary">
        <font-awesome-icon :icon="icon"/>
      </div>
    </template>

    <!-- body -->
    <template slot="body">
      <LayerControlBody
        @header-mousedown="draggingMixin__StartDragging"
        class="layer-control"
        v-if="computedShowLayerControl"/>
    </template>
  </nib-component>
</template>
<script>
import LayerControlBody from '@/components/LayerControlBody'
import NibComponent from '@/components/layout/Nib'
import DraggableMixin from '@/mixins/DraggableMixin'
export default {
  components: {
    NibComponent,
    LayerControlBody
  },
  mixins: [
    DraggableMixin
  ],
  props: {
    initOpen: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      nehubaAppended: false,
      showLayerControl: this.initOpen,
    };
  },
  mounted() {
    this.$store.state.appendNehubaPromise
      .then(() => this.nehubaAppended = true)
      .catch(console.error)
  },
  computed: {
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
}
</script>
<style scoped>

</style>
