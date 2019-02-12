<template>
  
  <!-- landmark controls -->
  <nib-component
    @toggleOpen="$emit('changeNibState', $event)"
    :initOpen="initOpen"
    :style="draggingMixin__Style">

    <!-- icon -->
    <template slot="icon">
      <div
        class="rounded-circle landmarks-control-toggle btn-shadow btn-sm btn btn-secondary">
        <font-awesome-icon icon="times"/>
      </div>
    </template>

    <!-- body -->
    <template slot="body">

      <!-- landmark-control-body -->
      <LandmarkControlBodyV2
        id="content"
        class="landmarks-control"
        @header-mousedown="draggingMixin__StartDragging"
        v-if="showLandmarksControl && showV2" />

      <LandmarkControlBody
        id="content"
        class="landmarks-control"
        @header-mousedown="draggingMixin__StartDragging"
        v-if="showLandmarksControl && !showV2" />

      <!-- transformation -->
      <TransformationComponent v-if="!showV2" />

      <!-- Sync Zoom  -->
      <div v-if="!showV2" style = "pointer-events: all">
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
import LandmarkControlBodyV2 from '@/components/LandmarkControlBodyV2'
import TransformationComponent from '@/components/TransformationComponent'
import axios from 'axios'

export default {
  components: {
    NibComponent,
    LandmarkControlBody,
    TransformationComponent,
    LandmarkControlBodyV2
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
      this.$emit('changeNibState', bool)
    },
    synchronizeCursor: function () {
      this.enableSynchronizeCursor()
    }
  },
  computed: {
    showV2: function () {
      return this.mode === 'overlay'
    },
    mode: function () {
      return this.$store.state._step2Mode
    },
    synchronizeZoom: {
      get: function () {
        return this.$store.state.synchronizeZoom
      },
      set: function (bool) {
      }
    },
    computedTransformationAvailable: function () {
      return this.$store.state.landmarkTransformationMatrix
    }
  },
  methods: {
  }
}
</script>
<style scoped>

.rounded-circle
{
  width: 2rem;
}
</style>
