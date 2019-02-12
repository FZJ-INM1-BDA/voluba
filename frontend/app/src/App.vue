<template>
  <div id="app">

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
          :config="simpleNehubaConfig"
          ref="incomingnehuba"
          v-show="showSimpleNehuba" />
      </div>

      <!-- floating layer -->
      <div class = "overlay">
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
      <SelectVolumesModal
        v-if="showSelectVolumesModal"
        @destroyMe="showSelectVolumesModal=false" />
    </div>
    <!--<footer-component/>-->
  </div>
</template>

<script>
import HeaderComponent from '@/components/TheHeader'
import NehubaComponent from '@/components/Nehuba'
import SimpleNehubaComponent from '@/components/SimpleNehuba'
import ToolbarComponent from '@/components/Toolbar'
import { getDefaultNehubaConfigLight } from '@/constants'

import LoadLandmarkPairsModal from '@/components/modals/LoadLandmarkPairsModal'
import TransformationMatrixModal from '@/components/modals/TransformationMatrixModal'
import UploadModal from '@/components/modals/UploadModal'
import SelectVolumesModal from '@/components/modals/SelectVolumesModal'

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
    SelectVolumesModal
  },
  data: function () {
    return {
      showSecondNehuba: true,
      primaryNehubaReady: false,
      showSelectVolumesModal: true
    }
  },
  mounted: function () {
    this.$store.subscribeAction(({ type, payload }) => {
      switch (type) {
        case 'openModal': {
          const modalId = payload && payload.modalId
          const modal = modalId && this.$refs[modalId]
          if (modal) {
            modal.showModal()
          }
          break
        }
        default:
      }
    })
  },
  computed: {
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
    mainNehubaReady: function () {
      this.primaryNehubaReady = true
    }
  },
  watch: {
    showSimpleNehuba: function () {
      this.$store.dispatch('redrawNehuba')
    }
  }
}
</script>

<style>
#app
{
  display:flex;
  flex-direction: column;
}
.app-header
{
  flex: 0 0 58px;
}
.app-main
{
  overflow:hidden;
  flex: 1 1 0;
  position:relative;
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
</style>
