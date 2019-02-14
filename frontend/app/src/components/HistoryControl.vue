<template>
  <nib-component
    @toggleOpen="$emit('changeNibState', $event)"
    :initOpen="initOpen"
    :style="draggingMixin__Style">
    
    <!-- icon -->
    <template slot="icon">
      <div class="rounded-circle layer-control-toggle btn btn-sm btn-secondary">
        <font-awesome-icon icon="times"/>
      </div>
    </template>

    <!-- body -->
    <template slot="body">
      <HistoryBody
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
  },
}
</script>
<style scoped>

.rounded-circle
{
  width: 2rem;
}
</style>
