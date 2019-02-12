<template>
  <nib-component
    :initOpen="true"
    @toggleOpen="$emit('changeNibState', $event)"
    :style="draggingMixin__Style">

    <!-- icon -->
    <template slot="icon">
      <div
        class="point-events rounded-circle save-control-toggle btn-shadow btn btn-sm btn-secondary">
        <font-awesome-icon icon="times" />
      </div>
    </template>

    <!-- body -->
    <template slot="body">
      <SaveControl
        class="point-events"
        @header-mousedown="draggingMixin__StartDragging"
        />
    </template>
  </nib-component>
</template>
<script>
import NibComponent from '@/components/layout/Nib'
import DraggableMixin from '@/mixins/DraggableMixin'
import SaveControl from '@/components/SaveControl'

export default {
  mixins: [
    DraggableMixin
  ],
  components: {
    SaveControl,
    NibComponent
  },
  data: function () {
    return {
      nibShow: false,
      saveIconTooltip: 'Save Transformation params and results.'
    }
  },
  methods: {
  },
}
</script>

<style scoped>
.point-events
{
  pointer-events: all;
}
.save-export-container
{
  background-color:white;
}
.rounded-circle
{
  width: 2rem;
}
</style>
