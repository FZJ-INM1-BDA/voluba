<template>
  <div id="flexcontainer">

    <div class="horizontalContainer flex-items">
      <div
        @click="showIcons = !showIcons"
        class="pointer-events addBtnLg rounded-circle btn btn-lg btn-light">
        <font-awesome-icon :icon="hamburgerIcon"></font-awesome-icon>
      </div>
    </div>
    
    <!-- toggle double pane mode -->
    <div
      v-if="showIcons"
      class="horizontalContainer flex-items">
      <div
        v-b-tooltip.hover.right="modeBtnTooltipText"
        @click="toggleMode"
        :class="modeBtnClass"
        class="addBtn rounded-circle btn btn-sm">
        <font-awesome-icon icon="columns"></font-awesome-icon>
      </div>
    </div>

    <!-- toggle history -->
    <div
      v-if="showIcons"
      class="horizontalContainer flex-items">
      <div
        v-b-tooltip.right.hover="'undo history'"
        :class="showHistory ? 'btn-info' : 'btn-secondary'"
      @click="showHistory = !showHistory"
        class="addBtn rounded-circle layer-control-toggle btn btn-sm">
        <font-awesome-icon icon="history" />
      </div>

      <HistoryControl
        @changeNibState="showHistory=$event"
        v-if="showHistory">

      </HistoryControl>
    </div>

    <!-- layer control -->
    <div
      v-if="showIcons"
      class="horizontalContainer flex-items">
      <div
        v-b-tooltip.right.hover="'configure incoming volume'"
        :class="showLayerControl ? 'btn-info' : 'btn-secondary'"
        @click="showLayerControl=!showLayerControl"
        class="addBtn rounded-circle layer-control-toggle btn btn-sm">
        
        <font-awesome-icon icon="sliders-h" />
      </div>
      <LayerControl
        @changeNibState="showLayerControl=$event"
        v-if="showLayerControl"
        :initOpen="true"
        class="row-flex-items" />
    </div>

    <!-- landmark-control -->
    <div
      v-if="showIcons"
      class="horizontalContainer flex-items">

      <div
        v-b-tooltip.right.hover="'Edit landmarks'"
        @click="landmarkControlVisibilityChanged({visible : !landmarkControlVisible })"
        :class="landmarkControlVisible ? 'btn-info' : 'btn-secondary'"
        class="addBtn rounded-circle landmarks-control-toggle btn-shadow btn-sm btn">
        <font-awesome-icon icon="map-marker-alt"/>
      </div>
      <landmark-control
        :initOpen="true"
        v-if="landmarkControlVisible"
        @changeNibState="landmarkControlVisibilityChanged({visible : $event })"
        class="row-flex-items" />
    </div>

    <!-- add btn -->
    <div
      v-if="showIcons"
      class="horizontalContainer flex-items">
      <div class="btn-group">

        <div
          id="addLm"
          @click="addLandmark"
          v-b-tooltip.right.hover="'Toggle add landmark mode'"
          class="addBtn pointer-events rounded-circle btn btn-sm btn-success">
          <font-awesome-icon icon="plus" />
        </div>

        <div
          class="btn btn-sm btn-secondary additionalAddLmBtn"
          v-if="addLandmarkMode">
          &nbsp;
        </div>
        <div
          @click="toggleAddLmMode"
          class="btn btn-sm btn-secondary pointer-events "
          v-if="addLandmarkMode">
          {{ addLmMode }}
        </div>
        <div
          @click="$store.commit('setLandmarkMode', {mode : false})"
          v-if="addLandmarkMode"
          class=" pointer-events btn btn-sm btn-danger">
          cancel
        </div>
      </div>
    </div>

    <!-- compute xform -->
    <div
      v-if="showIcons"
      class="horizontalContainer flex-items">
      <div
        @click="calculateXform"
        v-b-tooltip.right.hover="ableToComputeTransformationMatrix ? 'Compute and display transform based on landmarks.' : 'Need at least three (3) active landmarks to compute transformation.'"
        :class="ableToComputeTransformationMatrix && !backendQueryInProgress ? '' : 'lmr-disabled'"
        class="addBtn rounded-circle landmarks-control-toggle btn btn-sm btn-primary">
        <font-awesome-icon icon="calculator"></font-awesome-icon>
      </div>
    </div>
    
    <!-- save export control -->
    <div
      v-if="showIcons"
      class="horizontalContainer flex-items">

      <div
        v-b-tooltip.right.hover="'Save Transformation params and results.'"
        @click="showSaveExportControl = !showSaveExportControl"
        class="addBtn pointer-events rounded-circle save-control-toggle btn-shadow btn btn-sm btn-secondary">
        <font-awesome-icon icon="save" />
      </div>

      <SaveExportControl
        v-if="showSaveExportControl"
        @changeNibState="showSaveExportControl = $event"
        class="row-flex-items"/>
    </div>


    <!-- start from scratch btn -->
    <div
      v-if="showIcons"
      class="horizontalContainer flex-items">
      <div
        @click="$store.dispatch('startFromScratch')"
        class="addBtn pointer-events rounded-circle btn btn-sm btn-danger"
        v-b-tooltip.right.hover
        title="Start from scratch">
        <font-awesome-icon icon="backward" />
      </div>
    </div>
    
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import LayerControl from '@/components/LayerControl'
import LandmarkControl from '@/components/LandmarkControl'
import SaveExportControl from '@/components/SaveExportControl'
import HistoryControl from '@/components/HistoryControl'

export default {
  components: {
    LandmarkControl,
    LayerControl,
    SaveExportControl,
    HistoryControl
  },
  data: function () {
    return {
      showLayerControl: false,
      showSaveExportControl: false,
      showIcons: false,
      showHistory: false,
      addLmMode: 'reference'
    }
  },
  computed: {
    ...mapState({
      backendQueryInProgress: 'backendQueryInProgress',
      addLandmarkMode: 'addLandmarkMode',
      landmarkControlVisible: 'landmarkControlVisible',
      ableToComputeTransformationMatrix: state => state.landmarkPairs.length >= 3
    }),
    hamburgerIcon: function () {
      return this.showIcons
        ? 'times'
        : 'bars'
    },
    mode: {
      get: function () {
        return this.$store.state._step2Mode
      },
      set: function (mode) {
        /**
         * TODO remove this in release
         */
        this.$store.commit('_setStep2Mode', { mode })
      }
    },
    addBtnStyle: function () {
      return {
      }
    },
    modeBtnClass: function () {
      return this.mode === 'overlay'
        ? 'btn-secondary'
        : 'btn-info'
    },
    modeBtnTooltipText: function () {
      return `debug: toggle step 2 mode`
    }
  },
  methods: {
    ...mapActions({
      'landmarkControlVisibilityChanged': 'landmarkControlVisibilityChanged'
    }),
    toggleAddLmMode: function () {
      this.addLmMode = this.addLmMode === 'reference'
        ? 'incoming'
        : 'reference'
      this.$store.commit('setLandmarkMode', { mode: this.addLmMode })
    },
    calculateXform: function () {
      if (!this.ableToComputeTransformationMatrix) {
        return
      }
      this.$store.dispatch('computeXform')
    },
    addLandmark: function () {
      if (this.mode === 'overlay') {
        this.$store.commit('setLandmarkMode', { mode : this.addLandmarkMode === false ? this.addLmMode : false })
      } else {
        /**
         * classic mode
         */
        this.$store.dispatch('addLandmarkPair')
      }
    },
    toggleMode: function () {
      this.mode = this.mode === 'overlay'
        ? 'classic'
        : 'overlay'
    },
    getYTranslateStyle: function (idx) {
      return {
        marginTop: `${idx * 2.5}em`
      }
    }
  }
}
</script>
<style scoped>
#addLm
{
  z-index: 1;
}

.additionalAddLmBtn.btn.btn-sm
{
  margin-left:-2.5em;
}

.pointer-events
{
  pointer-events: all;
}

#flexcontainer
{
  display: flex;
  flex-direction: column;
  width: 2em;
}

#flexcontainer > *
{
  flex: 0 0 0;
}

.horizontalContainer
{
  width: 50em;
}

.horizontalContainer > *
{
  display:inline-block;
}

.flex-items:not(:first-child)
{
  margin-top: -1em;
}
.addBtn
{
  pointer-events: all;
  display: inline-block;
  margin: 1.2rem;
  width: 2rem;
}

.addBtnLg
{
  margin: 0.6em;
  box-sizing: border-box;
  width: 2.5em;
  height: 2.5em;
}

.btn-shadow {
  box-shadow: 0 0.4em 0.4em -0.1em rgba(50, 50, 50, 0.2);
}
.btn-shadow:hover {
  box-shadow: 0 0.6em 0.6em -0.2em rgba(50, 50, 50, 0.2);
}

.btn.lmr-disabled
{
  opacity:0.5;
}

.btn.lmr-disabled:hover
{
  cursor: default;
}
</style>
