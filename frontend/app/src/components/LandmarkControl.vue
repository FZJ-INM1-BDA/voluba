<template>
  
  <!-- landmark controls -->
  <nib-component
    ref="nib"
    @toggleOpen="$emit('changeNibState', $event)"
    :initOpen="initOpen"
    :style="draggingMixin__Style">

    <!-- body -->
    <template slot="body">

      <!-- landmark-control-body -->
      <LandmarkControlBodyV2
        @close="close"
        id="content"
        class="landmarks-control"
        @header-mousedown="draggingMixin__StartDragging"/>

      <!-- landmark footer -->

      <!-- divider -->
      <hr class="bg-light mb-0 mt-0">

      <!-- footer -->
      <div class="body bg-light">

        <!-- add lm -->

        <div class="d-flex align-items-center">

          <div
            :class="addLandmarkMode ? 'btn-success' : 'btn-outline-secondary'"
            v-b-tooltip.bottom.hover="'Add a landmark pair'"
            class="footer-icon rounded-circle btn btn-sm"
            @click="addLmMode">

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
            @click="loadLandmarks"
            v-b-tooltip.bottom.hover="'load landmarks'"
            class="footer-icon rounded-circle btn btn-sm btn-secondary">
            <font-awesome-icon icon="folder-open"></font-awesome-icon>
          </div>

          <!-- calculate xform -->
          <ComputeXformBtn class="footer-icon" />

          <transition name="fade">
            <small
              style="display:inline-block"
              v-if="showSuccessMessage"
              class="footer-icon pt-1 pb-1 alert alert-success">
              <span>
                Success
              </span>
            </small>
          </transition>
        </div>
      </div>
    </template>
  </nib-component>
</template>
<script>
import { mapActions, mapState } from 'vuex'

import NibComponent from '@/components/layout/Nib'
import DraggableMixin from '@/mixins/DraggableMixin'
import LandmarkControlBodyV2 from '@/components/LandmarkControlBodyV2'
import TransformationComponent from '@/components/TransformationComponent'
import ComputeXformBtn from '@/components/toolbars/ComputeXformBtn'

import axios from 'axios'

export default {
  components: {
    NibComponent,
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
      showLandmarksControl: this.initOpen,
      computeXformResultAvailable: false,
      timeoutId: null
    }
  },
  watch: {
    showLandmarksControl: function (bool) {
      this.$emit('changeNibState', bool)
    },
    backendQueryInProgress: function (inProgress) {
      if (!inProgress && !this.backendQueryError) {
        this.computeXformResultAvailable = true
        if (this.timeoutId) clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => this.computeXformResultAvailable = false, 5000)
      }
    }
  },
  computed: {
    ...mapState('linearStore', [
      'backendQueryInProgress',
      'backendQueryError'
    ]),
    ...mapState('landmarksStore', [
      'addLandmarkMode'
    ]),
    showSuccessMessage: function () {
      return this.computeXformResultAvailable && this.mode === 'overlay'
    },
    showV2: function () {
      return this.mode === 'overlay'
    },
    mode: function () {
      return this.$store.state._step2Mode
    },
  },
  methods: {
    ...mapActions('landmarksStore', [
      'saveLandmarks',
      'loadLandmarks'
    ]),
    ...mapActions('landmarksStore', [
      'changeLandmarkMode',
      'addLandmarkPair'
    ]),
    close: function () {
      const nib = this.$refs.nib
      if (nib) {
        nib.open = false
        this.$emit('changeNibState', false)
      }
    },
    addLmMode: function () {
      this.changeLandmarkMode({
        mode: this.addLandmarkMode ? false : 'reference'
      })
    }
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
