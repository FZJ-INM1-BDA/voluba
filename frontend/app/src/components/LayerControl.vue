<template>
  <nib-component
    @toggleOpen="$emit('changeNibState', $event)"
    :initOpen="initOpen"
    :style="draggingMixin__Style">

    <!-- icon -->
    <template slot="icon">
      <div
        :class="showLayerControl ? '' : 'btn-shadow'"
        @click="toggleShowLayerControl"
        class="rounded-circle layer-control-toggle btn btn-sm btn-secondary">
        <font-awesome-icon icon="times"/>
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
      nehubaAppended: false,
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
