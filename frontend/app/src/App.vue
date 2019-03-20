<template>
  <div
    @keydown.capture="keydown"
    id="app">

    <!-- header -->
    <header-component class = "app-header"/>

    <main class="app-main">

      <!-- main container -->
      <div class="underlay">
        <nehuba-component
          @ready = "mainNehubaReady"
          ref = "templatenehuba" />
        <SimpleNehubaComponent
          v-if="primaryNehubaReady && simpleNehubaConfig && showSimpleNehuba"
          :baseConfig="simpleNehubaConfig"
          ref="incomingnehuba"
          v-show="showSimpleNehuba" />
      </div>

      <!-- floating layer -->
      <div
        v-if="appendNehubaFlag"
        class = "overlay">
        <toolbar-component />
      </div>
    </main>

    <!-- modals -->
    <div>
      <load-landmark-pairs-modal
        ref="loadLandmarkPairsModal"
        id="loadLandmarkPairsModal"
        ok-disabled="true" />
      <transformation-matrix-modal
        ref="transformationMatrixModal"
        id="transformationMatrixModal"
        :transformationMatrix="this.$store.state.landmarkTransformationMatrix" />
      <upload-modal
        ref="uploadModal"
        id="uploadModal" />
      <MessageModal
        :message="messageModalMessage"
        id="messageModal"
        ref="messageModal"/>
      <b-modal
        centered
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
          </ul>
          Would you like to proceed?
      </b-modal>
      <SelectVolumesModal
        v-if="showSelectVolumesModal"
        @destroyMe="showSelectVolumesModal=false" />
    </div>
    <!--<footer-component/>-->
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import HeaderComponent from '@/components/TheHeader'
import NehubaComponent from '@/components/Nehuba'
import SimpleNehubaComponent from '@/components/SimpleNehuba'
import ToolbarComponent from '@/components/Toolbar'
import { getDefaultNehubaConfigLight } from '@/constants'
import { START_FROM_SCRATCH_MODAL_TITLE } from '@/text'

import LoadLandmarkPairsModal from '@/components/modals/LoadLandmarkPairsModal'
import TransformationMatrixModal from '@/components/modals/TransformationMatrixModal'
import UploadModal from '@/components/modals/UploadModal'
import SelectVolumesModal from '@/components/modals/SelectVolumesModal'
import MessageModal from '@/components/modals/MessageModal'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    NehubaComponent,
    SimpleNehubaComponent,
    ToolbarComponent,

    TransformationMatrixModal,
    LoadLandmarkPairsModal,
    UploadModal,
    SelectVolumesModal,
    MessageModal
  },
  data: function () {
    return {
      showSecondNehuba: true,
      primaryNehubaReady: false,
      showSelectVolumesModal: false,
      messageModalMessage: ''
    }
  },
  mounted: function () {
    this.$store.dispatch('appendNehuba')
    this.$store.subscribeAction(({ type, payload }) => {
      switch (type) {
        case 'openModal': {
          const modalId = payload && payload.modalId
          const modal = modalId && this.$refs[modalId]
          if (modal) {
            (modal.showModal && modal.showModal()) || (modal.show && modal.show())
          }
          break
        }
        case 'startFromScratch': {
          this.showSelectVolumesModal = true
          break;
        }
        default:
      }
    })
  },
  computed: {
    ...mapState({
      appendNehubaFlag: 'appendNehubaFlag',
      undoStack: 'undoStack',
      redoStack: 'redoStack',
      incTransformMatrix: 'incTransformMatrix'
    }),
    startFromScratchTitle: function () {
      return START_FROM_SCRATCH_MODAL_TITLE
    },
    sidebarWidth: function () {
      return this.$store.state.sidebarWidth
    },
    simpleNehubaConfig: function () {
      const id = this.$store.state.selectedIncomingVolumeId
      const incVol = id && this.$store.state.incomingVolumes.find(v => v.id === id)
      return incVol && incVol.imageSource && getDefaultNehubaConfigLight(incVol.imageSource)
    },
    showSimpleNehuba: function () {
      return this.showSecondNehuba && this.primaryNehubaReady && this.$store.state._step2Mode === 'classic'
    }
  },
  methods: {
    ...mapActions({
      startFromScratch: 'startFromScratch'
    }),
    keydown: function (event) {
      /**
       * stop/prevent is needed if user focus is on one of the popover text field
       * otherwise changeLandmarkName undo stack does not get resolved properly. 
       */
      const {key, ctrlKey} = event
      if (ctrlKey) {
        if (key === 'z') {
          this.$store.dispatch('undo')
          event.stopPropagation()
          event.preventDefault()
        }
        if (key === 'y') {
          this.$store.dispatch('redo')
          event.stopPropagation()
          event.preventDefault()
        }
      }
    },
    mainNehubaReady: function () {
      this.primaryNehubaReady = true
    }
  },
  watch: {
    appendNehubaFlag: function (flag) {
      this.showSelectVolumesModal = flag
    },
    showSimpleNehuba: function () {
      this.$store.dispatch('redrawNehuba')
    }
  }
}
</script>

<style>
#app
{
  position:absolute;
  left: 0;
  top: 0;
}
.app-header
{
  width: 100%;
  height: 0;
  position: relative;
  left: 0;
  top: 0;
}
.app-main
{
  overflow:hidden;
  position:relative;
  width: 100%;
  height: 100%;
}

.underlay
{
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
}

.underlay > *
{
  flex: 1 1 0;
}

.overlay
{
  position:absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;

}

.nehuba-container
{
  display: flex;
  flex-direction: row;
  height: 100%;
}

.nehuba-container > *
{
  flex: 1 1 0;
}

#main {
  width: 100%;
}

@keyframes spinning
{
  from {
    transform: rotate(0deg);
  }
  to{
    transform: rotate(359deg);
  }
}

.spinner
{
  animation: spinning 700ms linear infinite running;
}
</style>
