<template>
  <div id="flexcontainer">
    <div class="horizontalContainer">
      <img class="logo" id="logo" src="../assets/HBP_Primary_RGB_BlackText.png" alt="">
    </div>

    <!-- layer control -->
    <div
      class="horizontalContainer d-flex flex-items">
      <div
        v-b-tooltip.right.hover="incVolXformTitle"
        :class="showLayerControl ? 'btn-info' : 'btn-secondary'"
        @click="showLayerControl=!showLayerControl"
        class="addBtn transformBtn rounded-circle layer-control-toggle btn btn-sm btn-transition">
        
        <font-awesome-icon icon="brain" />
      </div>
      <LayerControl
        @changeNibState="showLayerControl=$event"
        v-if="showLayerControl"
        :initOpen="true"
        class="row-flex-items" />
    </div>

    <!-- landmark-control -->
    <div
      class="horizontalContainer d-flex flex-items">

      <div
        v-b-tooltip.right.hover="editLandmarksTitle"
        @click="landmarkControlVisibilityChanged({visible : !landmarkControlVisible })"
        :class="landmarkControlVisible ? 'btn-info' : 'btn-secondary'"
        class="addBtn landmarksBtn rounded-circle landmarks-control-toggle btn-shadow btn-sm btn">
        <font-awesome-icon icon="map-marker-alt"/>
      </div>
      <landmark-control
        :initOpen="true"
        v-if="landmarkControlVisible"
        @changeNibState="landmarkControlVisibilityChanged({visible : $event })"
        class="row-flex-items" />
    </div>

    <!-- cortical alignment btn -->
    <div v-if="enableCorticalAlignment" class="horizontalContainer d-flex flex-items">
      <div
        v-b-tooltip.right.hover="corticalPatchAlignmentTitle"
        @click="corticalAlignmentVisibilityChanged({ visible: !corticalAlignmentVisible })"
        :class="corticalAlignmentVisible ? 'btn-info' : 'btn-secondary'"
        class="addBtn corticalBtn rounded-circle landmarks-control-toggle btn-shadow btn-sm btn">
        <font-awesome-icon icon="ruler"></font-awesome-icon>
      </div>
      
      <CorticalAlignment
        @close="corticalAlignmentVisibilityChanged({ visible: false })"
        v-if="corticalAlignmentVisible"/>
    </div>

    <!-- toggle history -->
    <div
      class="horizontalContainer d-flex flex-items">
      <div
        v-b-tooltip.right.hover="historyBrowserTitle"
        :class="showHistory ? 'btn-info' : 'btn-secondary'"
        @click="showHistory = !showHistory"
        class="addBtn historyBtn rounded-circle layer-control-toggle btn btn-sm">
        <font-awesome-icon icon="history" />
      </div>

      <HistoryControl
        @changeNibState="showHistory=$event"
        v-if="showHistory">

      </HistoryControl>
    </div>

    <!-- save export control -->
    <div class="horizontalContainer d-flex flex-items">

      <div
        v-b-tooltip.right.hover="'Use result'"
        @click="showSaveExportControl = !showSaveExportControl"
        :class="showSaveExportControl ? 'btn-info' : 'btn-secondary'"
        class="addBtn shareBtn pointer-events rounded-circle save-control-toggle btn-shadow btn btn-sm">
        <font-awesome-icon icon="share-alt" />
      </div>

      <SaveExportControl
        v-if="showSaveExportControl"
        @changeNibState="showSaveExportControl = $event"
        class="row-flex-items"/>
    </div>
    
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import LayerControl from '@/components/LayerControl'
import LandmarkControl from '@/components/LandmarkControl'
import SaveExportControl from '@/components/SaveExportControl'
import HistoryControl from '@/components/HistoryControl'
import CorticalAlignment from '@/components/CorticalAlignment'
import ComputeXformBtn from '@/components/toolbars/ComputeXformBtn'

import { INC_VOL_XFORM_TITLE, EDIT_LANDMARKS_TITLE, HISTORY_BROWSER_TITLE, CORTICAL_ALIGNMENT } from '@/text'

export default {
  components: {
    LandmarkControl,
    LayerControl,
    SaveExportControl,
    HistoryControl,
    ComputeXformBtn,
    CorticalAlignment
  },
  data: function () {
    return {
      showLayerControl: false,
      showSaveExportControl: false,
      showHistory: false,
      addLmMode: 'reference',
      timeoutId: null
    }
  },
  computed: {
    ...mapState({
      landmarkControlVisible: 'landmarkControlVisible',
      corticalAlignmentVisible: 'corticalAlignmentVisible',
      enableCorticalAlignment: state => state && state.experimentalFeatures && state.experimentalFeatures.enableCorticalAlignment
    }),
    ...mapState('landmarksStore', [
      'addLandmarkMode'
    ]),
    historyBrowserTitle: function () {
      return HISTORY_BROWSER_TITLE
    },
    incVolXformTitle: function () {
      return INC_VOL_XFORM_TITLE
    },
    editLandmarksTitle: function () {
      return EDIT_LANDMARKS_TITLE
    },
    corticalPatchAlignmentTitle: function () {
      return CORTICAL_ALIGNMENT
    },
    addLmTooltipText: function(){
      return this.mode === 'overlay'
        ? 'Toggle add landmark mode'
        : 'Add a landmark pair'
    },
    addLmBttnClass: function () {
      return this.mode === 'classic' || this.addLandmarkMode
        ? 'btn-success'
        : 'btn-secondary'
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
    }
  },
  methods: {
    ...mapActions({
      landmarkControlVisibilityChanged: 'landmarkControlVisibilityChanged',
      corticalAlignmentVisibilityChanged: 'corticalAlignmentVisibilityChanged'
    }),
    ...mapActions('landmarksStore', [
      'changeLandmarkMode',
      'addLandmarkPair'
    ]),
    toggleAddLmMode: function () {
      this.addLmMode = this.addLmMode === 'reference'
        ? 'incoming'
        : 'reference'
      this.changeLandmarkMode({ mode: this.addLmMode })
    },
    addLandmark: function () {
      if (this.mode === 'overlay') {
        this.changeLandmarkMode({ mode : this.addLandmarkMode === false ? this.addLmMode : false })
      } else {
        /**
         * classic mode
         */
        this.addLandmarkPair()
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

.transformBtn {
  background-color: #E06058;
  border: none;
}
.landmarksBtn {
  background-color: #4B8EB0;
  border: none;
}
.corticalBtn {
  background-color: #F28705;
  border: none;
}
.shareBtn {
  background-color: #234F73;
  border: none;
}

.btn-shadow {
  box-shadow: 0 0.4em 0.4em -0.1em rgba(50, 50, 50, 0.2);
}
.btn-shadow:hover {
  box-shadow: 0 0.6em 0.6em -0.2em rgba(50, 50, 50, 0.2);
}

.logo
{
  height: 7rem;
  box-sizing: border-box;
  padding: 1em;
}
</style>
