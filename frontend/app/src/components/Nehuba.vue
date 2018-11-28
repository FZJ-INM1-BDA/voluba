<template>
  <div @mouseup.capture = "mouseup" @mousedown.capture = "mousedown" @mousemove.capture = "mousemove" id="nehubaContainer">
    <div @viewportToData = "viewportToData" class = "ng-container" :id = "cid">
      {{ placeholderText }}
    </div>
  </div>
</template>

<script>

import 'third_party/export_nehuba/main.bundle.js'
import 'third_party/export_nehuba/chunk_worker.bundle.js'
import { getShader, patchSliceViewPanel, determineElement, testBigbrain } from './constants'

export default {
  name: 'nehuba-component',
  created: function () {
  },
  data: function () {
    return {
      placeholderText: 'Loading nehuba ...',
      cid: null,
      nehubaViewer: null,
      ngUserLayer: null,
      mouseOverIncoming: false,
      movingIncoming: false,
      mousemoveStart: null,
      activeViewportToData: null,
      subscriptions: [],
      viewportToDatas: [],
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
      testConfig: testBigbrain
    }
  },
  mounted: function () {
    this.appendNehubaPromise
      .then(this.initNehuba)
      .then(this.clearnUp)
      .catch(e => {
        console.error('e')
        this.placeholderText = 'error loading nehuba'
      })
  },
  watch: {
    cid: function (val) {
      if (val === null) {
        this.$emit('ready', null)
      }
    },
    selectIncomingTemplate: function (val) {
      this.clearUserLayers()
      this.addUserLayer(val)
    },
    mouseOverIncoming: function (val) {
      this.ngUserLayer.layer.opacity.restoreState(val
        ? 1.0
        : 0.5)
      this.setNavigationActive(!val)
    }
  },
  beforeMount: function () {
    this.cid = 'neuroglancer-container'
  },
  methods: {
    viewportToData: function (event) {
      if (this.viewportToDatas[0] && this.viewportToDatas[1] && this.viewportToDatas[2]) {
        return
      }
      const element = event.srcElement || event.originalTarget
      this.viewportToDatas[determineElement(element)] = event.detail.viewportToData
    },
    mouseup: function () {
      this.movingIncoming = false
      this.mousemoveStart = null
    },
    mousedown: function (event) {
      if (this.mouseOverIncoming) {
        this.movingIncoming = true
        this.mousemoveStart = [event.screenX, event.screenY]
      }
    },
    mousemove: function (event) {
      if (this.movingIncoming) {
        const element = event.srcElement || event.originalTarget

        // debugger
        const deltaX = event.screenX - this.mousemoveStart[0]
        const deltaY = event.screenY - this.mousemoveStart[1]
        let pos = window.export_nehuba.vec3.fromValues(deltaX, deltaY, 0)
        window.export_nehuba.vec3.transformMat4(pos, pos, this.viewportToDatas[determineElement(element)])
        let mat = window.export_nehuba.mat4.fromTranslation(window.export_nehuba.mat4.create(), pos)
        window.export_nehuba.mat4.transpose(mat, mat)
        this.ngUserLayer.layer.transform.restoreState(Array.from(mat))
        this.ngUserLayer.layer.transform.changed.dispatch()
      }
    },
    setNavigationActive: function (bool) {
      if (bool) {
        this.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:mousedown0')
      } else {
        this.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:mousedown0', {stopPropagation: true})
      }
    },
    initNehuba: function () {
      this.nehubaViewer = window.export_nehuba.createNehubaViewer(this.testConfig, (e) => {
        console.log('nehuba throwing error')
      })

      /**
       * TODO
       */
      // this.nehubaViewer.setMeshesToLoad([100, 200])
      this.subscriptions.push(
        this.nehubaViewer.mouseOver.image
          .filter(v => v.layer.name === 'userlayer-0')
          .map(ev => ev.value !== null && ev.value !== 0)
          .distinctUntilChanged()
          .subscribe(mouseOver => {
            this.mouseOverIncoming = mouseOver
          })
      )
    },
    clearnUp: function () {
      this.cid = null
      setTimeout(() => {
        this.nehubaViewer.ngviewer.display.panels.forEach(patchSliceViewPanel)
      })
      // window['viewer'] = null
    },
    clearUserLayers: function () {
      if (!this.nehubaViewer) {
        return
      }
      this.ngUserLayer = null
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
        source: uri,
        opacity: 0.5,
        shader: getShader([1.0, 1.0, 0.0])
      }
      const newNgLayer = viewer.layerSpecification.getLayer(name, newLayer)
      this.ngUserLayer = viewer.layerManager.addManagedLayer(newNgLayer)
      this.userLayers.push(
        Object.assign({}, newLayer, {
          name
        })
      )
    }
  },
  computed: {
    selectIncomingTemplate: function () {
      return this.$store.state.incomingTemplate
    }
  },
  beforeDestroy () {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
}
</script>

<style>
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

#nehubaContainer,
.ng-container
{
  width: 100%;
  height: 100%;
}

#nehubaContainer
{
  position:relative;
}

.ng-container
{
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
}
</style>
