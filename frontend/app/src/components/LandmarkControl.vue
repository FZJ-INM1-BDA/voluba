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

      <!-- landmark footer -->

      <!-- divider -->
      <hr class="bg-light mb-0 mt-0">

      <!-- footer -->
      <div class="body bg-light">

        <!-- add lm -->
        <div
          v-if="!showV2"
          v-b-tooltip.bottom.hover="'save landmarks'"
          class="footer-icon rounded-circle btn btn-sm btn-success"
          @click="addLandmarkPair">

          <font-awesome-icon icon="plus"/>
        </div>
        <!-- save lms -->
        <div
          @click="saveLandmarks"
          v-b-tooltip.bottom.hover="'save landmarks'"
          class="footer-icon rounded-circle btn btn-sm btn-secondary">
          <font-awesome-icon icon="save"></font-awesome-icon>
        </div>

        <!-- load lms -->
        <div
          @click="$store.dispatch('loadLandmarks')"
          v-b-tooltip.bottom.hover="'load landmarks'"
          class="footer-icon rounded-circle btn btn-sm btn-secondary">
          <font-awesome-icon icon="folder-open"></font-awesome-icon>
        </div>

        <!-- calculate xform -->
        <ComputeXformBtn class="footer-icon" />
      </div>
    </template>
  </nib-component>
</template>
<script>
import { mapActions } from 'vuex'

import NibComponent from '@/components/layout/Nib'
import DraggableMixin from '@/mixins/DraggableMixin'
import LandmarkControlBody from '@/components/LandmarkControlBody'
import LandmarkControlBodyV2 from '@/components/LandmarkControlBodyV2'
import TransformationComponent from '@/components/TransformationComponent'
import ComputeXformBtn from '@/components/toolbars/ComputeXformBtn'

import axios from 'axios'

export default {
  components: {
    NibComponent,
    LandmarkControlBody,
    TransformationComponent,
    LandmarkControlBodyV2,
    ComputeXformBtn
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
      showLandmarksControl: this.initOpen
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
    ...mapActions({
      addLandmarkPair: 'addLandmarkPair',
      saveLandmarks: 'saveLandmarks'
    })
  }
}
</script>
<style scoped>

.rounded-circle
{
  width: 2rem;
}

.footer-icon
{
  margin: 1em 0.2em;
}

.footer-icon:first-child
{
  margin-left: 1em;
}

</style>
