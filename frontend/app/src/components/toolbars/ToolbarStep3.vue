<template>
  <div>
    <!-- save component -->
    <nib-component :initOpen="true" :style="draggingMixin__Style">

      <!-- icon -->
      <template slot="icon">
        <div
          v-b-tooltip.right.hover
          :title="saveIconTooltip"
          @click="toggleNibControl"
          id="icon"
          class="point-events rounded-circle save-control-toggle btn-shadow btn btn-sm btn-secondary">
          <font-awesome-icon icon="save" />
        </div>
      </template>

      <!-- body -->
      <template slot="body">
        <SaveControl
          class="point-events"
          v-if="nibShow"
          @header-mousedown="draggingMixin__StartDragging"
          />
      </template>
    </nib-component>

    <!-- not being shown -->
    <template>
      <b-card-body v-if="false" class = "save-export-container">
      </b-card-body>
    </template>
  </div>
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
    toggleNibControl: function () {
      this.nibShow = !this.nibShow
      if (!this.nibShow) {
        this.draggingMixin__ResetPosition()
      }
    }
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
</style>
