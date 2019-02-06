<template>
  
  <!-- landmark controls -->
  <nib-component :initOpen="initOpen" :style="draggingMixin__Style">

    <!-- icon -->
    <template slot="icon">
      <div
        v-b-tooltip.right.hover
        :title="landmarkTooltip"
        @click="toggleLandmarksControl"
        id="icon"
        class="rounded-circle landmarks-control-toggle btn-shadow btn-sm btn btn-secondary">
        <font-awesome-icon :icon="icon"/>
      </div>
    </template>

    <!-- body -->
    <template slot="body">

      <!-- landmark-control-body -->
      <LandmarkControlBody
        id="content"
        class="landmarks-control"
        @header-mousedown="draggingMixin__StartDragging"
        v-if="showLandmarksControl" />

      <!-- transformation -->
      <TransformationComponent />

      <!-- Sync Zoom  -->
      <div style = "pointer-events: all">
        <input type="checkbox" id="synchronize-zoom" name="synchronize-zoom" v-model="synchronizeZoom"/>
        <label for="synchronize-zoom">Synchronize Zoom</label>
      </div>
    </template>
  </nib-component>
</template>
<script>

import NibComponent from '@/components/layout/Nib'
import DraggableMixin from '@/mixins/DraggableMixin'
import LandmarkControlBody from '@/components/LandmarkControlBody'
import TransformationComponent from '@/components/TransformationComponent'
import axios from 'axios'
import { Compact } from 'vue-color'

export default {
  components: {
    NibComponent,
    LandmarkControlBody,
    'compact-picker': Compact,
    TransformationComponent,
    
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
  data: function () {
    return {
      showLandmarksControl: this.initOpen,
      synchronizeCursor: this.$store.state.synchronizeCursor,
    }
  },
  watch: {
    showLandmarksControl: function (bool) {
      this.$emit('showLandmarksControl', bool)
    },
    synchronizeCursor: function () {
      this.enableSynchronizeCursor()
    }
  },
  computed: {
    synchronizeZoom: {
      get: function () {
        return this.$store.state.synchronizeZoom
      },
      set: function (bool) {
        console.log(bool)
        // this.$store.dispatch('enableSynchronizeZoom', bool)
      }
    },
    landmarkTooltip: function () {
      return `Edit Landmarks`
    },
    icon: function () {
      return `map-marker-alt`
    },
    computedTransformationAvailable: function () {
      return this.$store.state.landmarkTransformationMatrix
    }
  },
  methods: {
    toggleLandmarksControl: function () {
      this.showLandmarksControl = !this.showLandmarksControl
      if (!this.showLandmarksControl) {
        this.draggingMixin__ResetPosition()
      }
    }
  }
}
</script>
<style scoped>

</style>
