<template>
  <div
    @mouseup.capture = "mouseup"
    @mousedown.capture = "mousedown"
    @mousemove.capture = "mousemove"
    class = "nehuba-container">

    <div
      @sliceRenderEvent = "sliceRenderEvent"
      @viewportToData = "viewportToData"
      class = "nehuba-element"
      :id = "cid">
      {{ placeholderText }}
    </div>

    <NehubaLandmarksOverlay
      ref = "lmOverlay"
      v-show = "!previewMode"
      v-if = "dataToViewport.length > 2"
      :dataToViewport = "dataToViewport"
      :landmarks = "referenceLandmarks"
      class = "landmarks-overlay"
    />
  </div>
</template>

<script>

import { defaultXform, getShader, testBigbrain, patchSliceViewPanel, determineElement, getRotationVec3, incomingTemplateActiveOpacity } from '@/components/constants'

import NehubaLandmarksOverlay from '@/components/NehubaLandmarksOverlay'
export default {
  data: function () {
    return {
      placeholderText: 'Loading nehuba ...',

      cid: null,
      nehubaViewer: null,

      /**
       * instance of managed layer
       */
      ngUserLayer: null,

      /**
       * managed layer state
       */
      mouseOverIncoming: false,
      movingIncoming: false,
      movingIncomingIndex: null,
      rotatingIncoming: false,
      mousemoveStart: null,
      rotateAbsoluteStart: null,
      activeViewportToData: null,
      subscriptions: [],
      dataToViewport: [
        defaultXform,
        defaultXform,
        defaultXform
      ],
      viewportToDatas: [],

      /**
       * all managed layers
       * TODO perhaps not necessary? since there is only a single user layer
       */
      userLayers: [],
      translation: null,
      rotation: null,
      committedTransform: null,
      viewerNavigationPosition: [0, 0, 0],
      viewerMousePosition: [0, 0, 0],
      viewerSliceOrientation: [0, 0, 0, 1],
      appendNehubaFlag: false,
      appendNehubaPromise: new Promise((resolve, reject) => {
        if ('export_nehuba' in window) {
          resolve()
        } else {
          const el = document.createElement('script')
          el.src = 'main.bundle.js'
          el.onload = () => {
            this.appendNehubaFlag = true
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

      /**
       * temporary. need to retrieve config separately
       */
      testConfig: testBigbrain
    }
  },
  mounted: function () {
    this.appendNehubaPromise
      .then(this.initNehuba)
      .then(this.clearnUp)
      .catch(e => {
        console.error('e', e)
        this.placeholderText = 'error loading nehuba'
      })

    this.$store.subscribeAction(({type, payload}) => {
      if (!this.appendNehubaFlag) return
      const { quat, mat4 } = window.export_nehuba
      switch (type) {
        case 'setPrimaryNehubaNavigation':
          const vec3 = window.export_nehuba.vec3
          this.nehubaViewer.setPosition(vec3.fromValues(...payload.coord.map(v => v * 1e6)), true)
          break
        case 'redrawNehuba':
          if (this.nehubaViewer) {
            this.nehubaViewer.redraw()
          }
          setTimeout(() => this.navigationChanged())
          break
        case 'alignReference':
          this.nehubaViewer.ngviewer.navigationState.pose.orientation.restoreState([0, 0, 0, 1])
          break
        case 'alignIncoming':
          if (!this.committedTransform) return
          const newQuat = mat4.getRotation(quat.create(), mat4.fromValues(...this.committedTransform))
          // quat.invert(newQuat, newQuat)
          this.nehubaViewer.ngviewer.navigationState.pose.orientation.restoreState(Array.from(newQuat))
          break
        default:
      }
    })
  },
  watch: {
    incomingColor: function (rgba) {
      if (this.ngUserLayer) {
        this.ngUserLayer.layer.fragmentMain.restoreState(getShader(rgba))
        this.ngUserLayer.layer.opacity.restoreState(rgba[3])
      }
    },
    cid: function (val) {
      if (val === null) {
        this.$emit('ready', null)
      }
    },
    selectedIncomingVolumeIndex: function (idx) {
      this.clearUserLayers()
      if (idx !== null && idx >= 0) {
        const url = this.$store.state.incomingVolumes[idx].value
        this.addUserLayer(url)
      }
    },
    mouseOverIncoming: function (val) {
      this.setNavigationActive(!val)
    },
    incomingTransformMatrix: function (mat) {
      if (!this.ngUserLayer) return
      if (!this.appendNehubaFlag) return
      if (!mat) return

      const { mat4, vec3 } = window.export_nehuba

      if (this.committedTransform) {
        const committedTransformMat = mat4.fromValues(...this.committedTransform)
        const commitedScalingVec3 = mat4.getScaling(vec3.create(), committedTransformMat)
        const commitedScalingMat4 = mat4.fromScaling(mat4.create(), commitedScalingVec3)
        const finalMat = mat4.create()
        mat4.invert(commitedScalingMat4, commitedScalingMat4)
        /**
         * apply commitedTransformMat first, then undo scaling
         */
        mat4.mul(finalMat, commitedScalingMat4, committedTransformMat)
        mat4.mul(this.ngUserLayer.layer.transform.transform, mat, finalMat)
      } else {
        this.ngUserLayer.layer.transform.transform = mat
      }
      this.ngUserLayer.layer.transform.changed.dispatch()
    },
    previewMode: function (val) {
      if (this.ngUserLayer) {
        console.log(this.$store.state.landmarkInverseMatrix)
        this.ngUserLayer.layer.transform.restoreState(this.calculatedTransformMatrix)
        this.ngUserLayer.layer.transform.changed.dispatch()
        this.ngUserLayer.setVisible(val)
      }
    },
    $route: function (from, to) {
      if (this.ngUserLayer) {
        this.ngUserLayer.setVisible(this.previewMode || to.path === '/step2')
      }
    }
  },
  beforeMount: function () {
    this.cid = 'neuroglancer-container'
  },
  methods: {
    sliceRenderEvent: function (event) {
      if (
        this.dataToViewport[0] !== defaultXform &&
        this.dataToViewport[1] !== defaultXform &&
        this.dataToViewport[2] !== defaultXform
      ) {
        return
      }

      const element = event.srcElement || event.originalTarget
      this.dataToViewport[determineElement(element)] = event.detail.nanometersToOffsetPixels

      if (
        this.dataToViewport[0] !== defaultXform &&
        this.dataToViewport[1] !== defaultXform &&
        this.dataToViewport[2] !== defaultXform
      ) {
        this.navigationChanged()
      }
    },
    viewportToData: function (event) {
      if (this.viewportToDatas[0] && this.viewportToDatas[1] && this.viewportToDatas[2]) {
        return
      }
      const element = event.srcElement || event.originalTarget
      this.viewportToDatas[determineElement(element)] = event.detail.viewportToData
    },
    mouseup: function () {
      if (this.movingIncoming || this.rotatingIncoming) {
        this.committedTransform = Array.from(this.ngUserLayer.layer.transform.transform)
      }
      this.rotatingIncoming = false
      this.movingIncoming = false
      this.mousemoveStart = null
      this.movingIncomingIndex = null
      this.rotateAbsoluteStart = null

      this.translation = null
      this.rotation = null
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
      if ((this.translationByDragEnabled && this.movingIncoming) || (this.rotationByDragEnabled && this.rotatingIncoming)) {
        const {vec3, quat} = window.export_nehuba

        const deltaX = event.screenX - this.mousemoveStart[0]
        const deltaY = event.screenY - this.mousemoveStart[1]
        if (this.translationByDragEnabled && this.movingIncoming) {
          let pos = vec3.fromValues(deltaX, deltaY, 0)
          vec3.transformMat4(pos, pos, this.viewportToDatas[this.movingIncomingIndex])
          vec3.subtract(pos, pos, vec3.fromValues(...this.viewerNavigationPosition))
          this.translation = Array.from(pos)
        }

        if (this.rotationByDragEnabled && this.rotatingIncoming) {
          let { vec31, vec32 } = getRotationVec3(this.movingIncomingIndex)
          if (vec31 === null || vec32 === null) {
            return
          }

          vec3.transformQuat(vec31, vec31, quat.fromValues(...this.viewerSliceOrientation))
          vec3.transformQuat(vec32, vec32, quat.fromValues(...this.viewerSliceOrientation))

          let finalRotation = quat.create()
          quat.mul(
            finalRotation,
            quat.setAxisAngle(
              quat.create(),
              vec31,
              -deltaX * Math.PI / 180
            ),
            quat.setAxisAngle(
              quat.create(),
              vec32,
              deltaY * Math.PI / 180
            )
          )
          this.rotation = Array.from(finalRotation)
        }
      }
    },
    /**
     * overwrites NG original behaviour, so that on mouse down, the view port does not move
     */
    setNavigationActive: function (bool) {
      if (bool) {
        this.ngUserLayer.layer.opacity.restoreState(this.incomingColor[3])
        this.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:mousedown0')
        this.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:shift+mousedown0')
      } else {
        this.ngUserLayer.layer.opacity.restoreState(incomingTemplateActiveOpacity)
        if (this.translationByDragEnabled) {
          this.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:mousedown0', {stopPropagation: true})
        }
        if (this.rotationByDragEnabled) {
          this.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:shift+mousedown0', {stopPropagation: true})
        }
      }
    },
    updateState: function ({mouseOverUserlayer}) {
      this.mouseOverIncoming = mouseOverUserlayer
      this.$store.dispatch(this.mouseOverIncoming
        ? 'mouseOverIncmoingLayer'
        : 'mouseOutIncomingLayer')
    },
    initNehuba: function () {
      this.nehubaViewer = window.export_nehuba.createNehubaViewer(this.testConfig, (e) => {
        console.log('nehuba throwing error')
      })

      /**
       * clear window.viewer object
       */
      window.primaryViewer = window.viewer
      window.viewer = null
      const transform = window.primaryViewer.layerManager.managedLayers[0].layer.transform.toJSON()
      this.$store.commit('setReferenceTemplateTransform', {transform})

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
            this.$store.dispatch('primaryNehubaNavigationPositionChanged', Array.from(fa))
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
      this.subscriptions.push(
        this.nehubaViewer.navigationState.full.subscribe(() => {
          this.navigationChanged()
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
      window['viewer'] = null
    },
    navigationChanged: function () {
      this.$refs.lmOverlay.$forceUpdate()
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
        opacity: this.incomingColor[3],
        shader: getShader(this.incomingColor)
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
    translationByDragEnabled: function () {
      return !this.previewMode && true
    },
    rotationByDragEnabled: function () {
      return false
    },
    translationVec3: {
      get: function () {
        if (this.appendNehubaFlag) {
          const { vec3 } = window.export_nehuba
          return this.translation
            ? vec3.fromValues(...this.translation)
            : vec3.fromValues(0, 0, 0)
        } else {
          return null
        }
      }
    },
    rotationQuat: {
      get: function () {
        if (this.appendNehubaFlag) {
          const { quat } = window.export_nehuba
          return this.rotation
            ? quat.fromValues(...this.rotation)
            : quat.fromValues(0, 0, 0, 1)
        } else {
          return null
        }
      }
    },
    scaleVec3: {
      get: function () {
        if (this.appendNehubaFlag) {
          const { vec3 } = window.export_nehuba
          return vec3.fromValues(...this.$store.state.incomingScale)
        } else {
          return null
        }
      }
    },
    incomingTransformMatrix: {
      get: function () {
        if (this.appendNehubaFlag) {
          const { mat4, vec3 } = window.export_nehuba

          const rotateAbsoluteStart = this.rotateAbsoluteStart
            ? this.rotateAbsoluteStart
            : [0, 0, 0]

          return mat4.fromRotationTranslationScaleOrigin(
            mat4.create(),
            this.rotationQuat,
            this.translationVec3,
            this.scaleVec3,
            vec3.fromValues(...rotateAbsoluteStart)
          )
        }
        return null
      }
    },
    calculatedTransformMatrix: function () {
      return this.$store.state.landmarkInverseMatrix.map((arr, i) => arr.map((v, idx) => i !== 3 && idx === 3 ? v * 1e6 : v))
    },
    incomingColor: function () {
      return this.$store.state.incomingColor.map((v, idx) => idx === 3 ? v : v / 255)
    },
    selectedIncomingVolumeIndex: function () {
      return this.$store.state.selectedIncomingVolumeIndex
    },
    viewerIncomingScale: function () {
      return this.$store.state.incomingScale
    },
    referenceLandmarks: function () {
      return this.$store.state.landmarkPairs
        .map(lmp => {
          const lm = this.$store.state.referenceLandmarks.find(lm => lm.id === lmp.refId)
          return lm
            ? {
              ...lm,
              color: lmp.color,
              active: lmp.active
            }
            : null
        })
        .filter(refLm => refLm !== null)
    },
    previewMode: function () {
      return this.$store.state.previewMode
    }
  },
  beforeDestroy () {
    this.subscriptions.forEach(s => s.unsubscribe())
  },
  components: {
    NehubaLandmarksOverlay
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

.nehuba-container,
.nehuba-element
{
  width: 100%;
  height: 100%;
}

.nehuba-container
{
  position:relative;
}

.nehuba-container > .nehuba-element
{
  position: relative;
}
.nehuba-container > .landmarks-overlay
{
  position: absolute;
  left: 0;
  top: 0;
}

.nehuba-element
{
  z-index: 10;
}

.landmarks-overlay
{
  z-index: 11;
}
</style>
