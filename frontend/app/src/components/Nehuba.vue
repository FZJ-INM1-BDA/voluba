<template>
  <div class = "ng-container" :id = "cid">
    {{ placeholderText }}
  </div>
</template>

<script>

import 'third_party/export_nehuba/main.bundle.js'
import 'third_party/export_nehuba/chunk_worker.bundle.js'

export default {
  name: 'nehuba-component',
  created: function () {
  },
  data: function () {
    return {
      placeholderText: 'Loading nehuba ...',
      cid: 'neuroglancer-container',
      nehubaViewer: null,
      userLayers: [],
      appendNehubaPromise: new Promise((resolve, reject) => {
        if ('export_nehuba' in window) {
          resolve()
        } else {
          const el = document.createElement('script')
          el.src = 'main.bundle.js'
          el.onload = () => {
            /**
             * patching nehuba/neuroglancer default behaviour of altering hash
             */
            const { UrlHashBinding } = window['export_nehuba'].getNgPatchableObj()
            UrlHashBinding.prototype.setUrlHash = () => {
              // console.log('seturl hash')
              // console.log('setting url hash')
            }
            UrlHashBinding.prototype.updateFromUrlHash = () => {
              // console.log('update hash binding')
            }
            /* TODO find a more permanent fix to disable double click */
            // LayerManager.prototype.invokeAction = (arg) => {
            //   const region = this.regionsLabelIndexMap.get(this.mouseOverSegment)
            //   if (arg === 'select' && region) {
            //     this.regionSelectionEmitter.emit(region)
            //   }
            // }
            resolve()
          }
          el.onerror = reject
          document.head.appendChild(el)
        }
      }),
      // eslint-disable-next-line
      testConfig: {"configName":"BigBrain","globals":{"hideNullImageValues":true,"useNehubaLayout":{"keepDefaultLayouts":false},"useNehubaMeshLayer":true,"rightClickWithCtrlGlobal":false,"zoomWithoutCtrlGlobal":false,"useCustomSegmentColors":true},"zoomWithoutCtrl":true,"hideNeuroglancerUI":true,"rightClickWithCtrl":true,"rotateAtViewCentre":true,"enableMeshLoadingControl":true,"zoomAtViewCentre":true,"restrictUserNavigation":true,"disableSegmentSelection":true,"dataset":{"imageBackground":[1,1,1,1],"initialNgState":{"showDefaultAnnotations":false,"layers":{" grey value: ":{"type":"image","source":"precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/8bit","transform":[[1,0,0,-70677184],[0,1,0,-70010000],[0,0,1,-58788284],[0,0,0,1]]}," tissue type: ":{"type":"segmentation","source":"precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/classif","segments":["0"],"selectedAlpha":0,"notSelectedAlpha":0,"transform":[[1,0,0,-70666600],[0,1,0,-72910000],[0,0,1,-58777700],[0,0,0,1]]}},"navigation":{"pose":{"position":{"voxelSize":[21166.666015625,20000,21166.666015625],"voxelCoordinates":[-21.8844051361084,16.288618087768555,28.418994903564453]}},"zoomFactor":350000},"perspectiveOrientation":[0.3140767216682434,-0.7418519854545593,0.4988985061645508,-0.3195493221282959],"perspectiveZoom":1922235.5293810747}},"layout":{"views":"hbp-neuro","planarSlicesBackground":[1,1,1,1],"useNehubaPerspective":{"enableShiftDrag":false,"doNotRestrictUserNavigation":false,"perspectiveSlicesBackground":[1,1,1,1],"removePerspectiveSlicesBackground":{"color":[1,1,1,1],"mode":"=="},"perspectiveBackground":[1,1,1,1],"fixedZoomPerspectiveSlices":{"sliceViewportWidth":300,"sliceViewportHeight":300,"sliceZoom":563818.3562426177,"sliceViewportSizeMultiplier":2},"mesh":{"backFaceColor":[1,1,1,1],"removeBasedOnNavigation":true,"flipRemovedOctant":true},"centerToOrigin":true,"drawSubstrates":{"color":[0,0,0.5,0.15]},"drawZoomLevels":{"cutOff":200000,"color":[0.5,0,0,0.15]},"hideImages":false,"waitForMesh":true,"restrictZoomLevel":{"minZoom":1200000,"maxZoom":3500000}}}}
    }
  },
  mounted: function () {
    this.appendNehubaPromise
      .then(() => {
        this.nehubaViewer = window.export_nehuba.createNehubaViewer(this.testConfig, (e) => {
          console.log('nehuba throwing error')
        })
      })
      .then(() => {
        this.cid = null
      })
      .then(() => {
        window['viewer'] = null
        this.nehubaViewer.setMeshesToLoad([100, 200])
        window['nehubaViewer'] = this.nehubaViewer
      })
      .catch((e) => {
        console.log(e)
        this.placeholderText = 'loading nehuba failed'
      })
  },
  watch: {
    cid: function (val) {
      if (val === null) {
        this.$emit('ready', null)
      }
    },
    selectIncomingTemplate: function (val) {
      console.log('selectIncomingTemplate change', val)
      this.clearUserLayers()
      this.addUserLayer(val)
    }
  },
  methods: {
    clearUserLayers: function () {
      if (!this.nehubaViewer) {
        return
      }
      const lm = this.nehubaViewer.ngviewer.layerManager
      this.userLayers
        .map(ul => ul.name)
        .map(layerName => lm.getLayerByName(layerName))
        .forEach(layer => lm.removeManagedLayer(layer))
      this.userLayers = []
    },
    addUserLayer: function (uri) {
      if (!this.nehubaViewer) {
        return
      }
      if (!uri) {
        return
      }
      const viewer = this.nehubaViewer.ngviewer
      const name = `userlayer-${this.userLayers.length}`
      const newLayer = {
        name,
        source: uri
      }
      const newNgLayer = viewer.layerSpecification.getLayer(name, {source: uri})
      viewer.layerManager.addManagedLayer(newNgLayer)
      this.userLayers.push(
        newLayer
      )
    }
  },
  computed: {
    selectIncomingTemplate: function () {
      return this.$store.state.incomingTemplate
    }
  }
}
</script>

<style>
.ng-container
{
  height: 100%;
}

div.scale-bar-container
{
  text-align: center;
  background-color: rgba(0,0,0,.3);
  position: absolute;
  left: 1em;
  bottom: 1em;
  padding: 2px;
  font-weight: 700;
  pointer-events: none;
}

div.scale-bar
{
  min-height: 1ex;
  background-color: #fff;
  padding: 0;
  margin: 0;
  margin-top: 2px;
}

div.scale-bar-container
{
  font-weight:500;
  color: #1a1a1a;
  background-color:hsla(0,0%,80%,0.5);
}

[darktheme="true"] .scale-bar-container
{
  color:#f2f2f2;
  background-color:hsla(0,0%,60%,0.2);
}
</style>
