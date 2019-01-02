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
import { getShader, patchSliceViewPanel, determineElement, testBigbrain, getRotationVec3, incomingTemplateActiveOpacity, incomingTemplateInactiveOpacity } from './constants'

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
      movingIncomingIndex: null,
      rotatingIncoming: false,
      mousemoveStart: null,
      rotateAbsoluteStart: null,
      activeViewportToData: null,
      subscriptions: [],
      viewportToDatas: [],
      userLayers: [],
      tempMat4: null,
      viewerNavigationPosition: [0, 0, 0],
      viewerMousePosition: [0, 0, 0],
      viewerSliceOrientation: [0, 0, 0, 1],
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
      userlayerSubscription$: null,
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
      this.setNavigationActive(!val)
    },
    incomingTransformMatrix: function (val) {
      this.setIncomingLayerTransform(val)
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
      if ((this.movingIncoming || this.rotatingIncoming) && this.tempMat4) {
        this.$store.dispatch('incomingTransformMatrixChanged', Array.from(this.tempMat4))
      }
      this.rotatingIncoming = false
      this.movingIncoming = false
      this.mousemoveStart = null
      this.movingIncomingIndex = null
      this.rotateAbsoluteStart = null
    },
    mousedown: function (event) {
      if (this.mouseOverIncoming) {
        this.mousemoveStart = [event.screenX, event.screenY]

        if (event.shiftKey) {
          this.rotatingIncoming = true
          this.rotateAbsoluteStart = this.viewerMousePosition
        } else {
          this.movingIncoming = true
        }

        const element = event.srcElement || event.originalTarget
        this.movingIncomingIndex = determineElement(element)
      }
    },
    mousemove: function (event) {
      if (this.movingIncoming || this.rotatingIncoming) {
        this.tempMat4 = window.export_nehuba.mat4.create()

        const deltaX = event.screenX - this.mousemoveStart[0]
        const deltaY = event.screenY - this.mousemoveStart[1]
        if (this.movingIncoming) {
          let pos = window.export_nehuba.vec3.fromValues(deltaX, deltaY, 0)
          window.export_nehuba.vec3.transformMat4(pos, pos, this.viewportToDatas[this.movingIncomingIndex])
          window.export_nehuba.vec3.subtract(pos, pos, window.export_nehuba.vec3.fromValues(...this.viewerNavigationPosition))
          window.export_nehuba.mat4.fromTranslation(this.tempMat4, pos)
        }

        if (this.rotatingIncoming) {
          let { vec31, vec32 } = getRotationVec3(this.movingIncomingIndex)
          if (vec31 === null || vec32 === null) {
            return
          }

          window.export_nehuba.vec3.transformQuat(vec31, vec31, window.export_nehuba.quat.fromValues(...this.viewerSliceOrientation))
          window.export_nehuba.vec3.transformQuat(vec32, vec32, window.export_nehuba.quat.fromValues(...this.viewerSliceOrientation))

          const vec3id = window.export_nehuba.vec3.fromValues(1, 1, 1)

          let finalRotation = window.export_nehuba.quat.create()
          window.export_nehuba.quat.mul(
            finalRotation,
            window.export_nehuba.quat.setAxisAngle(
              window.export_nehuba.quat.create(),
              vec31,
              -deltaX * Math.PI / 180
            ),
            window.export_nehuba.quat.setAxisAngle(
              window.export_nehuba.quat.create(),
              vec32,
              deltaY * Math.PI / 180
            )
          )
          window.export_nehuba.mat4.fromRotationTranslationScaleOrigin(
            this.tempMat4,
            finalRotation,
            vec3id,
            vec3id,
            // window.export_nehuba.vec3.fromValues(this.viewerIncomingScale),
            window.export_nehuba.vec3.fromValues(...this.rotateAbsoluteStart)
          )
        }

        window.export_nehuba.mat4.transpose(this.tempMat4, this.tempMat4)

        if (this.incomingTransformMatrix) {
          const _tempmat4 = window.export_nehuba.mat4.fromValues(...this.incomingTransformMatrix)
          this.tempMat4 = window.export_nehuba.mat4.mul(window.export_nehuba.mat4.create(), _tempmat4, this.tempMat4)
        }
        this.setIncomingLayerTransform(Array.from(this.tempMat4))
      }
    },
    setNavigationActive: function (bool) {
      if (bool) {
        this.ngUserLayer.layer.opacity.restoreState(incomingTemplateInactiveOpacity)
        this.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:mousedown0')
        this.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:shift+mousedown0')
      } else {
        this.ngUserLayer.layer.opacity.restoreState(incomingTemplateActiveOpacity)
        this.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:mousedown0', {stopPropagation: true})
        this.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:shift+mousedown0', {stopPropagation: true})
      }
    },
    updateState: function ({mouseOverUserlayer}) {
      this.mouseOverIncoming = mouseOverUserlayer
        ? true
        : false
      this.$store.dispatch(this.mouseOverIncoming
        ? 'mouseOverIncmoingLayer'
        : 'mouseOutIncomingLayer')
    },
    initNehuba: function () {
      this.nehubaViewer = window.export_nehuba.createNehubaViewer(this.testConfig, (e) => {
        console.log('nehuba throwing error')
      })

      /**
       * TODO
       */
      this.nehubaViewer.setMeshesToLoad([100, 200])
      this.subscriptions.push(
        this.nehubaViewer.mouseOver.image
          .filter(v => v.layer.name === 'userlayer-0')
          .filter(v => typeof v !== 'undefined')
          .map(ev => ev.value !== null)
          .distinctUntilChanged()
          .map(bool => ({mouseOverUserlayer: bool}))
          .subscribe(this.updateState)
      )
      this.subscriptions.push(
        this.nehubaViewer.navigationState.position.inRealSpace
          .subscribe(fa => {
            this.viewerNavigationPosition = Array.from(fa)
            this.$store.dispatch('viewerNavigationPositionChanged', Array.from(fa))
          })
      )
      this.subscriptions.push(
        this.nehubaViewer.mousePosition.inRealSpace
          .subscribe(fa => {
            const array = fa === null
              ? [0, 0, 0]
              : Array.from(fa)
            this.viewerMousePosition = array
            this.$store.dispatch('viewerMousePositionChanged', array)
          })
      )
      this.subscriptions.push(
        this.nehubaViewer.navigationState.orientation
          .subscribe(fa => {
            const array = fa === null
              ? [0, 0, 0, 1]
              : Array.from(fa)
            this.viewerSliceOrientation = array
            this.$store.dispatch('viewerSliceOrientationChanged', array)
          })
      )
    },
    clearnUp: function () {
      this.cid = null
      setTimeout(() => {
        this.nehubaViewer.ngviewer.display.panels.forEach(patchSliceViewPanel)
      })
      /**
       * TODO remove window.nehubaViewer in prod
       */
      window['nehubaViewer'] = this.nehubaViewer
      window['nehubaVue'] = this
      // window['viewer'] = null
    },
    setIncomingLayerTransform: function (array) {
      this.ngUserLayer.layer.transform.restoreState(array)
      this.ngUserLayer.layer.transform.changed.dispatch()
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
      const name = `userlayer-0`
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
    },
    incomingTransformMatrix: function () {
      return this.$store.state.incomingTransformMatrix
    },
    viewerIncomingScale: function () {
      return this.$store.state.incomingScale
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
