<template>
  <nib-component
    ref="nib"
    @toggleOpen="$emit('changeNibState', $event)"
    :initOpen="initOpen"
    :style="draggingMixin__Style">
    
    <!-- icon -->
    <template slot="icon">
    </template>

    <!-- body -->
    <template slot="body">
      <HistoryBody
        @close="close"
        @header-mousedown="draggingMixin__StartDragging"
        class="layer-control"/>
    </template>
  </nib-component>
  
</template>
<script>
import NibComponent from '@/components/layout/Nib'
import DraggableMixin from '@/mixins/DraggableMixin'
import HistoryBody from '@/components/HistoryBody'
export default {
  components: {
    NibComponent,
    HistoryBody
  },
  mixins: [
    DraggableMixin
  ],
  data: function () {
    return {
      initOpen: true
    }
  },
  methods: {
    close: function () {
      const nib = this.$refs.nib
      if (nib) {
        nib.open = false
        this.$emit('changeNibState', false)
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
