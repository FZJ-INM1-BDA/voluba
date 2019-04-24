<template>
  <nib-component
    ref="nib"
    @toggleOpen="$emit('changeNibState', $event)"
    :initOpen="initOpen"
    :style="draggingMixin__Style">

    <!-- body -->
    <template slot="body">
      <LayerControlBody
        @close="close"
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
import { mapState } from 'vuex'
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
      showLayerControl: this.initOpen,
    };
  },
  computed: {
    ...mapState({
      nehubaAppended: 'appendNehubaFlag'
    }),
    computedShowLayerControl: function() {
      return this.nehubaAppended && this.showLayerControl
    }
  },
  methods: {
    close: function () {
      const nib = this.$refs.nib
      if (nib) {
        nib.open = false
        this.$emit('changeNibState', false)
      }
    },
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
.rounded-circle
{
  width: 2rem;
}
</style>
