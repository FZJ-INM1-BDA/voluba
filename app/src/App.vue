<template>
  <div @keydown.capture="keydown" id="app">
    <!-- header -->
    <header-component v-if="appendNehubaFlag" class="app-header"/>

    <main class="app-main">
      <!-- main container -->
      <div class="underlay">
        <nehuba-component
          @ready="mainNehubaReady"
          ref="templatenehuba"/>
        <SimpleNehubaComponent
          v-if="primaryNehubaReady && simpleNehubaConfig && showSimpleNehuba"
          :baseConfig="simpleNehubaConfig"
          ref="incomingnehuba"
          v-show="showSimpleNehuba" />
      </div>

      <!-- floating layer -->
      <div v-if="appendNehubaFlag" class="overlay">
        <toolbar-component/>
      </div>
    </main>

    <!-- data selection screen -->
    <div
      v-if="showSelectVolumesModal"
      class="overlay-screen">
      <DataSelection
        @destroyMe="startRegistration"
        class="p-5 bg-light data-selection" />
    </div>

    <!-- modals -->
    <div>
      <load-landmark-pairs-modal
        ref="loadLandmarkPairsModal"
        id="loadLandmarkPairsModal"
        ok-disabled="true"
      />
      <transformation-matrix-modal
        ref="transformationMatrixModal"
        id="transformationMatrixModal"
        :transformationMatrix="this.$store.state.landmarkTransformationMatrix"
      />
      <upload-modal ref="uploadModal" id="uploadModal"/>
      <MessageModal
        @hidden="onModalHide"
        :message="messageModalMessage"
        id="messageModal"
        ref="messageModal"/>
      <b-modal
        @hidden="onModalHide"
        centered
        :hide-footer="true"
        :hide-header="true"
        ref="aboutus">
        <AboutUs />
      </b-modal>
      <b-modal
        centered
        @hidden="onModalHide"
        title="Cookie Disclaimer"
        header-text-variant="light"
        ref="cookie"
        :ok-only="true"
        header-bg-variant="info">
        <Cookie />
      </b-modal>
      <b-modal
        centered
        @hidden="onModalHide"
        ref="startFromScratchModal"
        header-bg-variant="danger"
        header-text-variant="light"
        @ok="startFromScratch"
        ok-variant="danger"
        ok-title="Yes, reset everything"
        :title="startFromScratchTitle">
        This action would
        <ul>
          <li>unload the incoming volume</li>
          <li>remove all existing landmarks</li>
          <li>resets your current progress</li>
        </ul>Would you like to proceed?
      </b-modal>
      <!-- <SelectVolumesModal v-if="showSelectVolumesModal" @destroyMe="showSelectVolumesModal=false"/> -->
    </div>
    <!--<footer-component/>-->
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import HeaderComponent from "@/components/TheHeader";
import NehubaComponent from "@/components/Nehuba";
import SimpleNehubaComponent from "@/components/SimpleNehuba";
import ToolbarComponent from "@/components/Toolbar";
import { getDefaultNehubaConfigLight } from "@/constants";
import { START_FROM_SCRATCH_MODAL_TITLE } from "@/text";

import LoadLandmarkPairsModal from "@/components/modals/LoadLandmarkPairsModal";
import TransformationMatrixModal from "@/components/modals/TransformationMatrixModal";
import UploadModal from "@/components/modals/UploadModal";
import SelectVolumesModal from "@/components/modals/SelectVolumesModal";
import MessageModal from "@/components/modals/MessageModal";
import DataSelection from '@/components/DatasetSelection'
import AboutUs from '@/components/AboutUs'
import Cookie from '@/components/Cookie'

const DEBUG = !!process.env.VUE_APP_DEBUG

export default {
  name: "App",
  components: {
    HeaderComponent,
    NehubaComponent,
    SimpleNehubaComponent,
    ToolbarComponent,

    TransformationMatrixModal,
    LoadLandmarkPairsModal,
    UploadModal,
    DataSelection,
    MessageModal,
    AboutUs,
    Cookie
  },
  data: function() {
    return {
      showSecondNehuba: true,
      primaryNehubaReady: false,
      showSelectVolumesModal: false,
      messageModalMessage: "",
      onModalHide: () => {}
    };
  },
  mounted: function() {
    if (DEBUG) {
      window.setProduction = (arg) => this.setProduction(arg)
    }
    this.initAppendNehuba();
    this.$store.subscribeAction(({ type = '', payload = {} } = {}) => {
      switch (type) {
        case "openModal": {
          const { modalId, onHiddenCb } = payload
          const modal = modalId && this.$refs[modalId]
          this.log('open modal', modal)
          if (modal) {
            (modal.showModal && modal.showModal()) ||
              (modal.show && modal.show())

            if (onHiddenCb && onHiddenCb instanceof Function) {
              modal.$on('hidden', onHiddenCb)
            }
          }
          break;
        }
        case "startFromScratch": {
          this.showSelectVolumesModal = true;
          break;
        }
        default:
      }
    });
  },
  computed: {
    ...mapState('nehubaStore', [
      'appendNehubaFlag'
    ]),
    ...mapState({
      production: 'production',
      incTransformMatrix: 'incTransformMatrix'
    }),
    ...mapState('undoStore', [
      'undoStack',
      'redoStack'
    ]),
    ...mapState('dataSelectionStore',[
      'selectedIncomingVolumeId',
      'incomingVolumes'
    ]),
    ...mapState('landmarksStore', [
      'addLandmarkMode'
    ]),
    startFromScratchTitle: function() {
      return START_FROM_SCRATCH_MODAL_TITLE;
    },
    sidebarWidth: function() {
      return this.$store.state.sidebarWidth;
    },
    simpleNehubaConfig: function() {
      const incVol = this.selectedIncomingVolumeId
        && this.incomingVolumes.find(v => v.id === this.selectedIncomingVolumeId);
      return (
        incVol &&
        incVol.imageSource &&
        getDefaultNehubaConfigLight(incVol.imageSource)
      );
    },
    showSimpleNehuba: function() {
      return (
        this.showSecondNehuba &&
        this.primaryNehubaReady &&
        this.$store.state._step2Mode === 'classic'
      );
    }
  },
  methods: {
    ...mapActions('nehubaStore', [
      'initAppendNehuba'
    ]),
    ...mapMutations({
      setProduction: 'setProduction'
    }),
    ...mapActions([
      'startFromScratch',
      'log'
    ]),
    ...mapActions('landmarksStore', [
      'changeLandmarkMode',
    ]),
    ...mapActions('undoStore', [
      'undo',
      'redo'
    ]),
    ...mapActions('nehubaStore', [
      'redrawNehuba'
    ]),
    startRegistration: function () {
      this.showSelectVolumesModal = false
    },
    keydown: function(event) {
      /**
       * stop/prevent is needed if user focus is on one of the popover text field
       * otherwise changeLandmarkName undo stack does not get resolved properly.
       */
      const { key, ctrlKey } = event;
      if (ctrlKey) {
        if (key === "z") {
          this.undo()
          event.stopPropagation();
          event.preventDefault();
        }
        if (key === "y") {
          this.redo()
          event.stopPropagation();
          event.preventDefault();
        }
      }
      if (key.toLowerCase() === 'escape') {
        if (this.addLandmarkMode) {
          this.changeLandmarkMode({ mode: false })
        }
      }
    },
    mainNehubaReady: function() {
      this.primaryNehubaReady = true;
    }
  },
  watch: {
    appendNehubaFlag: function(flag) {
      this.showSelectVolumesModal = flag;
    },
    showSimpleNehuba: function() {
      this.redrawNehuba()
    }
  }
};
</script>

<style>
#app {
  position: absolute;
  left: 0;
  top: 0;
}
.app-header {
  width: 100%;
  height: 0;
  position: relative;
  left: 0;
  top: 0;
}
.app-main {
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
}

.underlay {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
}

.underlay > * {
  flex: 1 1 0;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.nehuba-container {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.nehuba-container > * {
  flex: 1 1 0;
}

#main {
  width: 100%;
}

@keyframes spinning {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}

.spinner {
  animation: spinning 700ms linear infinite running;
}

@keyframes blink {
  0% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(0.2);
  }
  100% {
    transform: scaleX(1);
  }
}

.blink {
  animation: blink 250ms infinite;
}

.no-pe
{
  pointer-events: none;
}

.overlay-screen
{
  position:absolute;
  top:0;
  left:0;
  content: ' ';
  width: 100%;
  height: 100%;
  background-color: rgba(128,128,128,0.8);
  z-index: 12;
}

.pe-none
{
  pointer-events: none;
}

.pe-all
{
  pointer-events: all;
}

.h-50
{
  height:50%;
}

.mh-20-em
{
  max-height: 20em;
}

.lh-1
{
  line-height: 1;
}

.data-selection
{
  flex-basis: 50%!important;
}

.rounded-circle.btn
{
  width: 2.5em;
  height: 2.5em;

  display:flex;
  align-items: center;
  justify-content: center;
}

.hover-move:hover
{
  background-color: rgba(125,125,125,0.15);
  cursor: move;
}

</style>
