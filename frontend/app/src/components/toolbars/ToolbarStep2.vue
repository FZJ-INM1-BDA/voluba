<template>
  <div>

    <!-- landmark controls -->
    <nib-component :style="draggingMixin__Style">
      <template slot="icon">
        <div
          v-b-tooltip.right.hover
          :title="landmarkTooltip"
          @click="toggleLandmarksControl"
          id="icon"
          class="point-events rounded-circle landmarks-control-toggle btn-shadow btn-sm btn btn-secondary">
          <font-awesome-icon :icon="icon"/>
        </div>
      </template>
      <template slot="body">
        <LandmarkControl
          id="content"
          class="point-events landmarks-control"
          @header-mousedown="draggingMixin__StartDragging"
          v-if="showLandmarksControl" />
        <TransformationComponent class="point-events" />
      </template>

      <!-- not being displayed  -->
      <template>
        
        <div v-show = "false" id = "accordion" rol = "tablist">

          <!-- Landmark-Pairs -->
          <card-component :id = "'landmark-pairs'" :initialVisibility = "true">
            <template slot = "header">
              <h6><strong>Landmark-Pairs</strong></h6>
            </template>
            <template slot = "body">
              <div>
                <input type="checkbox" id="synchronize-zoom" name="synchronize-zoom" v-model="synchronizeZoom"/>
                <label for="synchronize-zoom">Synchronize Zoom</label>
              </div>
              <div>
                <input type="checkbox" id="synchronize-cursor" name="synchronize-cursor" v-model="synchronizeCursor"/>
                <label for="synchronize-cursor">Synchronize Cursor</label>
              </div>
              <div>
                <input type="checkbox" id="preview-mode" name="preview-mode" />
                <label for="preview-mode">Preview Mode</label>
              </div>
              <landmark-list />
            </template>
          </card-component>

        </div>
      </template>
    </nib-component>

    <!-- add btn -->
    <div
      :style="addBtnStyle">
      <div
        v-if="!showLandmarksControl"
        @click="$store.dispatch('addLandmarkPair')"
        class="point-events rounded-circle btn btn-sm btn-success"
        v-b-tooltip.right.hover
        title="Add Landmark Pair">
        <font-awesome-icon icon="plus" />
      </div>
    </div>
    
  </div>
</template>
<script>
import axios from 'axios'
import CardComponent from '@/components/Card'
import LandmarkList from '@/components/LandmarkList'
import LandmarkControl from '@/components/LandmarkControl'
import DraggableMixin from '@/mixins/DraggableMixin'
import NibComponent from '@/components/NibComponent'
import TransformationComponent from '@/components/TransformationComponent'

// Vue-Color
import { Compact } from 'vue-color'

export default {
  mixins: [
    DraggableMixin
  ],
  components: {
    TransformationComponent,
    CardComponent,
    LandmarkList,
    'compact-picker': Compact,
    LandmarkControl,
    NibComponent
  },
  data: function () {
    return {
      showLandmarksControl: false,
      synchronizeZoom: this.$store.state.synchronizeZoom,
      synchronizeCursor: this.$store.state.synchronizeCursor,
    }
  },
  watch: {
    synchronizeZoom: function () {
      this.enableSynchronizeZoom()
    },
    synchronizeCursor: function () {
      this.enableSynchronizeCursor()
    }
  },
  computed: {
    addBtnStyle: function () {
      return {
        display: 'inline-block',
        margin: '1em',
        transform: 'translateY(2.5em)'
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
    },
    enableSynchronizeZoom: function () {
      this.$store.dispatch('enableSynchronizeZoom', this.synchronizeZoom)
    },
    enableSynchronizeCursor: function () {
      this.$store.dispatch('enableSynchronizeCursor', this.synchronizeCursor)
    }
  }
}
</script>
<style scoped>
.point-events
{
  pointer-events: all;
}

.btn-shadow {
  box-shadow: 0 0.4em 0.4em -0.1em rgba(50, 50, 50, 0.2);
}
.btn-shadow:hover {
  box-shadow: 0 0.6em 0.6em -0.2em rgba(50, 50, 50, 0.2);
}
</style>
