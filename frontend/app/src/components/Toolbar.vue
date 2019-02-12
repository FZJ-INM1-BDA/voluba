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
        @click="showLandmarksControl=!showLandmarksControl"
        :class="showLandmarksControl ? 'btn-info' : 'btn-secondary'"
        class="addBtn rounded-circle landmarks-control-toggle btn-shadow btn-sm btn">
        <font-awesome-icon icon="map-marker-alt"/>
      </div>
      <landmark-control
        :initOpen="true"
        v-if="showLandmarksControl"
        @changeNibState="showLandmarksControl=$event"
        class="row-flex-items" />
    </div>

    <!-- add btn -->
    <div
      v-if="showIcons"
      class="horizontalContainer flex-items">
      <div
        @click="$store.dispatch(mode === 'overlay' ? 'addLandmark' : 'addLandmarkPair')"
        class="addBtn point-events rounded-circle btn btn-sm btn-success"
        v-b-tooltip.right.hover
        title="Add landmark pair">
        <font-awesome-icon icon="plus" />
      </div>
    </div>
    
    <!-- save export control -->
    <div
      v-if="showIcons"
      class="horizontalContainer flex-items">

      <div
        v-b-tooltip.right.hover="'Save Transformation params and results.'"
        @click="showSaveExportControl = !showSaveExportControl"
        class="addBtn point-events rounded-circle save-control-toggle btn-shadow btn btn-sm btn-secondary">
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
        class="addBtn point-events rounded-circle btn btn-sm btn-danger"
        v-b-tooltip.right.hover
        title="Start from scratch">
        <font-awesome-icon icon="backward" />
      </div>
    </div>
    
  </div>
</template>
<script>

import LayerControl from '@/components/LayerControl'
import LandmarkControl from '@/components/LandmarkControl'
import SaveExportControl from '@/components/SaveExportControl'

export default {
  components: {
    LandmarkControl,
    LayerControl,
    SaveExportControl
  },
  data: function () {
    return {
      showLandmarksControl: false,
      showLayerControl: false,
      showSaveExportControl: false,
      showIcons: false
    }
  },
  computed: {
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
}

.btn-shadow {
  box-shadow: 0 0.4em 0.4em -0.1em rgba(50, 50, 50, 0.2);
}
.btn-shadow:hover {
  box-shadow: 0 0.6em 0.6em -0.2em rgba(50, 50, 50, 0.2);
}
</style>
