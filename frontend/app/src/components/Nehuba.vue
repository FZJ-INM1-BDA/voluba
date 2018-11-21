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
      cid: null,
      nehubaViewer: null,
      appendNehubaPromise: new Promise((resolve, reject) => {
        if ('export_nehuba' in window) {
          resolve()
        } else {
          const el = document.createElement('script')
          el.src = 'main.bundle.js'
          el.onload = resolve
          el.onerror = reject
          document.head.appendChild(el)
        }
      }),
      // eslint-disable-next-line
      testConfig: {"globals":{"hideNullImageValues":true, "useNehubaLayout":true, "useNehubaMeshLayer":true, "useCustomSegmentColors":true}, "zoomWithoutCtrl":true, "hideNeuroglancerUI":true, "rightClickWithCtrl":true, "rotateAtViewCentre":true, "zoomAtViewCentre":true, "enableMeshLoadingControl":true, "layout":{"useNehubaPerspective":{"fixedZoomPerspectiveSlices":{"sliceViewportWidth":300, "sliceViewportHeight":300, "sliceZoom":724698.1843689409, "sliceViewportSizeMultiplier":2}, "centerToOrigin":true, "mesh":{"removeBasedOnNavigation":true, "flipRemovedOctant":true, "surfaceParcellation":true}, "removePerspectiveSlicesBackground":{"mode":"=="}, "waitForMesh":true, "drawSubstrates":{"color":[0.5, 0.5, 1, 0.2]}, "drawZoomLevels":{"cutOff":150000}, "restrictZoomLevel":{"minZoom":2500000, "maxZoom":3500000}}}, "dataset":{"imageBackground":[0, 0, 0, 1], "initialNgState":{"showDefaultAnnotations":false, "layers":{"colin":{"type":"image", "visible":true, "source":"precomputed://https://neuroglancer.humanbrainproject.org/precomputed/JuBrain/v2.2c/colin27_seg", "transform":[[1, 0, 0, -75500000], [0, 1, 0, -111500000], [0, 0, 1, -67500000], [0, 0, 0, 1]]}, "atlas":{"type":"segmentation", "source":"precomputed://https://neuroglancer.humanbrainproject.org/precomputed/JuBrain/v2.2c/MPM", "transform":[[1, 0, 0, -75500000], [0, 1, 0, -111500000], [0, 0, 1, -67500000], [0, 0, 0, 1]]}}, "navigation":{"pose":{"position":{"voxelSize":[1000000, 1000000, 1000000], "voxelCoordinates":[0, -32, 0]}}, "zoomFactor":1000000}, "perspectiveOrientation":[-0.2753947079181671, 0.6631333827972412, -0.6360703706741333, 0.2825356423854828], "perspectiveZoom":3000000}}}
    }
  },
  mounted: function () {
    this.appendNehubaPromise
      .then(() => {
        this.cid = 'neuroglancer-container'
      })
      .then(() => {
        this.nehubaViewer = window.export_nehuba.createNehubaViewer(this.testConfig, (e) => {
          console.log('nehuba throwing error')
        })
      })
      .catch((e) => {
        console.log(e)
        this.placeholderText = 'loading nehuba failed'
      })
  },
  computed: {
  }
}
</script>

<style scoped>
.ng-container
{
  height: 500px;
}
</style>
