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

import { annotationColorBlur, annotationColorFocus, getShader, testBigbrain, patchSliceViewPanel, determineElement, getRotationVec3, incomingTemplateActiveOpacity } from '@//constants'

import NehubaBaseMixin from '@/mixins/NehubaBase'
import NehubaLandmarksOverlay from '@/components/NehubaLandmarksOverlay'

export default {
  mixins: [
    NehubaBaseMixin
  ],
  data: function () {
    return {
      placeholderText: 'Loading nehuba ...',

      cid: null,

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
      viewportToDatas: [],
      incomingVolumeSelected: false,

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

      /**
       * temporary. need to retrieve config separately
       */
      testConfig: testBigbrain
    }
  },
  mounted: function () {
    this.$store.state.appendNehubaPromise
      .then(() => this.appendNehubaFlag = true)
      .then(this.initNehuba)
      .then(this.clearnUp)
      .then(() => {
        if (this.selectedIncomingVolumeId) {
          const incVol = this.selectedIncomingVolumeId && this.$store.state.incomingVolumes.find(v => v && (v.id === this.selectedIncomingVolumeId))
          if (incVol) {
            const url = incVol.imageSource
            this.addUserLayer(url)
          }
        }
      })
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
          this.$options.nonReactiveData.nehubaViewer.setPosition(vec3.fromValues(...payload.coord.map(v => v * 1e6)), true)
          break
        case 'alignReference':
          this.$options.nonReactiveData.nehubaViewer.ngviewer.navigationState.pose.orientation.restoreState([0, 0, 0, 1])
          break
        case 'alignIncoming':
          if (!this.committedTransform) return
          const newQuat = mat4.getRotation(quat.create(), mat4.fromValues(...this.committedTransform))
          // quat.invert(newQuat, newQuat)
          this.$options.nonReactiveData.nehubaViewer.ngviewer.navigationState.pose.orientation.restoreState(Array.from(newQuat))
          break
        default:
      }
    })
  },
  watch: {
    incTransformMatrix: function (array) {
      const { mat4 } = window.export_nehuba
      const matrix = mat4.fromValues(...array)
      /**
       * xform matrix sometimes a bit wonky
       */
      this.$options.nonReactiveData.ngUserLayer.layer.transform.transform = matrix
      this.$options.nonReactiveData.ngUserLayer.layer.transform.changed.dispatch()
    },
    incomingVolumeSelected: function (bool) {
      this.$options.nonReactiveData.managedLayers.forEach(layer => layer.layer.annotationColor.restoreState(bool ? annotationColorBlur : annotationColorFocus))
      this.$options.nonReactiveData.ngUserLayer.layer.annotationColor.restoreState(bool ? annotationColorFocus : annotationColorBlur)
      this.$store.dispatch('highlightIncomingVolume', bool)
    },
    incomingColor: function (rgba) {
      if (this.$options.nonReactiveData.ngUserLayer) {
        this.$options.nonReactiveData.ngUserLayer.layer.fragmentMain.restoreState(getShader(rgba))
        this.$options.nonReactiveData.ngUserLayer.layer.opacity.restoreState(rgba[3])
      }
    },
    selectedIncomingVolumeId: function (id) {
      this.clearUserLayers()
      const incVol = id && this.$store.state.incomingVolumes.find(v => v.id === id)
      if (incVol) {
        const url = incVol.imageSource
        this.addUserLayer(url)
      }
    },
    mouseOverIncoming: function (val) {
      this.setNavigationActive(!val)
    },
    incomingTransformMatrix: function (mat) {
      if (!this.$options.nonReactiveData.ngUserLayer) return
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
        mat4.mul(this.$options.nonReactiveData.ngUserLayer.layer.transform.transform, mat, finalMat)
      } else {
        this.$options.nonReactiveData.ngUserLayer.layer.transform.transform = mat
      }
      this.$options.nonReactiveData.ngUserLayer.layer.transform.changed.dispatch()
    },
    previewMode: function (val) {
      if (this.$options.nonReactiveData.ngUserLayer) {
        this.$options.nonReactiveData.ngUserLayer.layer.transform.restoreState(this.calculatedTransformMatrix)
        this.$options.nonReactiveData.ngUserLayer.layer.transform.changed.dispatch()
        // this.$options.nonReactiveData.ngUserLayer.setVisible(val)
      }
    },
    $route: function (to, from) {
      if (this.$options.nonReactiveData.ngUserLayer && to.path === '/step2') {
        const { lower, upper } = this.$options.nonReactiveData.ngUserLayer.layer.renderLayer.boundingBox
        const { vec3, mat4 } = window.export_nehuba
        const boundingVec3 = vec3.subtract(vec3.create(), upper, lower)
        const incXM = mat4.fromValues(...this.incTransformMatrix)

        const translVec3 = mat4.getTranslation(vec3.create(), incXM)
        const scalingVec3 = mat4.getScaling(vec3.create(), incXM)
        /**
         * TODO can scaling ever be genative?
         */
        const actualDimVec3 = vec3.mul(vec3.create(), boundingVec3, scalingVec3)

        const centerVec3 = vec3.scaleAndAdd(vec3.create(), translVec3, actualDimVec3, 0.5)
        const nm = Math.min(...actualDimVec3)

        /**
         * set viewer center
         */
        this.$options.nonReactiveData.nehubaViewer.setPosition(centerVec3, true)
        
        /**
         * set viewer zoomlevel
         */
        const viewportMin = Math.min(window.innerHeight, window.innerWidth /2 )
        this.$options.nonReactiveData.nehubaViewer.ngviewer.navigationState.zoomFactor.restoreState(nm / viewportMin)
      }
    }
  },
  beforeMount: function () {
    this.cid = 'neuroglancer-container'
  },
  nonReactiveData: {
    subscriptions: [],
    ngUserLayer: null,
    managedLayers: [],
    nehubaViewer: null,
    mousedownMatrix: null,
    timeoutId: null
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
      // if (this.movingIncoming || this.rotatingIncoming) {
      //   this.committedTransform = Array.from(this.$options.nonReactiveData.ngUserLayer.layer.transform.transform)
      // }
    },
    mousedown: function (event) {
      if (this.mouseOverIncoming) {
        this.incomingVolumeSelected = true
        this.$options.nonReactiveData.mousedownMatrix = Array.from(this.incTransformMatrix)

        this.mousemoveStart = [event.screenX, event.screenY]

        if (event.shiftKey) {
          this.rotatingIncoming = true
          this.rotateAbsoluteStart = this.viewerMousePosition
        } else {
          this.movingIncoming = true
        }

        const element = event.srcElement || event.originalTarget
        this.movingIncomingIndex = determineElement(element)

        document.addEventListener('mouseup', ev => {

          /**
           * instead of attaching mouseup listener to this element, attach to the whole body
           * so when user mousedown on nehuba, then mouseover other elements, things don't break
           */
          this.rotatingIncoming = false
          this.movingIncoming = false
          this.mousemoveStart = null
          this.movingIncomingIndex = null
          this.rotateAbsoluteStart = null

          this.$options.nonReactiveData.mousedownMatrix = null
        }, {
          once: true,
          capture: true
        })
      } else {

        /**
         * allows for user drag whole volume, without deselecting incoming volume
         */
        this.$options.nonReactiveData.timeoutId = setTimeout(() => {
          this.incomingVolumeSelected = false
          this.$options.nonReactiveData.timeoutId = null
        }, 300)
      }
    },
    mousemove: function (event) {

      /**
       * allows for user drag whole volume, without deselecting incoming volume
       */
      if (this.$options.nonReactiveData.timeoutId) {
        clearTimeout(this.$options.nonReactiveData.timeoutId)
      }
      if ((this.translationByDragEnabled && this.movingIncoming) || (this.rotationByDragEnabled && this.rotatingIncoming)) {
        const {vec3, mat4, quat} = window.export_nehuba

        const deltaX = event.movementX
        const deltaY = event.movementY

        if (this.translationByDragEnabled && this.movingIncoming) {
          /**
           * first, translation mouse delta into 3d delta
           */
          let pos = vec3.fromValues(deltaX, deltaY, 0)
          vec3.transformMat4(pos, pos, this.viewportToDatas[this.movingIncomingIndex])
          
          /**
           * account for navigation movement
           */
          vec3.subtract(pos, pos, vec3.fromValues(...this.viewerNavigationPosition))

          /**
           * get xformOnMousedown
           */
          const xformOnMousedown = mat4.fromValues(...this.$options.nonReactiveData.mousedownMatrix)
          
          /**
           * apply scale to delta pos
           */
          const scaleOnMousedown = mat4.getScaling(vec3.create(), xformOnMousedown)
          vec3.divide(pos, pos, scaleOnMousedown)

          /**
           * account for the internal rotation of inc volume
           */
          const incRot = mat4.getRotation(quat.create(), mat4.fromValues(...this.incTransformMatrix))
          quat.invert(incRot, incRot)
          vec3.transformQuat(pos, pos, incRot)
          
          this.$store.dispatch('translIncBy', {
            axis: 'xyz',
            value: Array.from(pos).map(v => v / 1e6)
          })
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
          // this.$store.dispatch('setRotateIncByQuat', { quaternion: Array.from(finalRotation) })
          this.$store.dispatch('rotIncBy', {quaternion: Array.from(finalRotation)})
        }
      }
    },
    /**
     * overwrites NG original behaviour, so that on mouse down, the view port does not move
     */
    setNavigationActive: function (bool) {
      if (bool) {
        this.$options.nonReactiveData.ngUserLayer.layer.opacity.restoreState(this.incomingColor[3])
        this.$options.nonReactiveData.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:mousedown0')
        this.$options.nonReactiveData.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:shift+mousedown0')
      } else {
        this.$options.nonReactiveData.ngUserLayer.layer.opacity.restoreState(incomingTemplateActiveOpacity)
        if (this.translationByDragEnabled) {
          this.$options.nonReactiveData.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:mousedown0', {stopPropagation: true})
        }
        if (this.rotationByDragEnabled) {
          this.$options.nonReactiveData.nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:shift+mousedown0', {stopPropagation: true})
        }
      }
    },
    updateState: function ({mouseOverUserlayer}) {
      this.mouseOverIncoming = mouseOverUserlayer
      this.$store.dispatch(this.mouseOverIncoming
        ? 'mouseOverIncomingLayer'
        : 'mouseOutIncomingLayer')
    },
    initNehuba: function () {
      this.$options.nonReactiveData.nehubaViewer = window.export_nehuba.createNehubaViewer(this.testConfig, (e) => {
        console.log('nehuba throwing error')
      })

      /**
       * clear window.viewer object
       */
      window.primaryViewer = window.viewer
      window.primaryNehubaViewer = this.$options.nonReactiveData.nehubaViewer
      window.viewer = null
      const transform = window.primaryViewer.layerManager.managedLayers[0].layer.transform.toJSON()
      this.$store.commit('setReferenceTemplateTransform', {transform})

      /**
       * TODO
       */
      this.$options.nonReactiveData.nehubaViewer.setMeshesToLoad([100, 200])
      this.$options.nonReactiveData.subscriptions.push(
        this.$options.nonReactiveData.nehubaViewer.mouseOver.image
          .filter(v => v.layer.name === 'userlayer-0')
          .filter(v => typeof v !== 'undefined')
          .map(ev => ev.value !== null)
          .distinctUntilChanged()
          .map(bool => ({mouseOverUserlayer: bool}))
          .subscribe(this.updateState)
      )
      this.$options.nonReactiveData.subscriptions.push(
        this.$options.nonReactiveData.nehubaViewer.navigationState.position.inRealSpace
          .subscribe(fa => {
            this.viewerNavigationPosition = Array.from(fa)
            this.$store.dispatch('primaryNehubaNavigationPositionChanged', Array.from(fa))
          })
      )
      this.$options.nonReactiveData.subscriptions.push(
        this.$options.nonReactiveData.nehubaViewer.mousePosition.inRealSpace
          .subscribe(fa => {
            const array = fa === null
              ? [0, 0, 0]
              : Array.from(fa)
            this.viewerMousePosition = array
            this.$store.dispatch('viewerMousePositionChanged', array)
          })
      )
      this.$options.nonReactiveData.subscriptions.push(
        this.$options.nonReactiveData.nehubaViewer.navigationState.orientation
          .subscribe(fa => {
            const array = fa === null
              ? [0, 0, 0, 1]
              : Array.from(fa)
            this.viewerSliceOrientation = array
            this.$store.dispatch('viewerSliceOrientationChanged', array)
          })
      )
      this.$options.nonReactiveData.subscriptions.push(
        this.$options.nonReactiveData.nehubaViewer.navigationState.full.subscribe(() => {
          this.navigationChanged()
        })
      )
    },
    clearnUp: function () {
      this.cid = null
      setTimeout(() => {
        this.$options.nonReactiveData.nehubaViewer.ngviewer.display.panels.forEach(patchSliceViewPanel)
        this.$options.nonReactiveData.managedLayers = this.$options.nonReactiveData.nehubaViewer.ngviewer.layerManager.managedLayers
      })
      /**
       * TODO remove window.nehubaViewer in prod
       */
      window['nehubaViewer'] = this.$options.nonReactiveData.nehubaViewer
      window['nehubaVue'] = this
      window['viewer'] = null
    },
    clearUserLayers: function () {
      if (!this.$options.nonReactiveData.nehubaViewer) {
        return
      }
      this.$options.nonReactiveData.ngUserLayer = null
      const lm = this.$options.nonReactiveData.nehubaViewer.ngviewer.layerManager
      this.userLayers
        .map(ul => ul.name)
        .map(layerName => lm.getLayerByName(layerName))
        .forEach(layer => lm.removeManagedLayer(layer))
      this.userLayers = []
    },
    addUserLayer: function (uri) {
      if (!this.$options.nonReactiveData.nehubaViewer) {
        return
      }
      if (!uri) {
        return
      }
      const viewer = this.$options.nonReactiveData.nehubaViewer.ngviewer
      const name = `userlayer-0`
      const newLayer = {
        annotationColor: '#CCCCCC',
        source: uri,
        opacity: this.incomingColor[3],
        shader: getShader(this.incomingColor)
      }
      const newNgLayer = viewer.layerSpecification.getLayer(name, newLayer)
      const ngUserLayer = viewer.layerManager.addManagedLayer(newNgLayer)
      this.userLayers.push(
        Object.assign({}, newLayer, {
          name
        })
      )
      this.$options.nonReactiveData.ngUserLayer = ngUserLayer
    }
  },
  computed: {
    incTransformMatrix: function () {
      return this.$store.state.incTransformMatrix
    },
    translationByDragEnabled: function () {
      return !this.previewMode
    },
    rotationByDragEnabled: function () {
      // return false
      return !this.previewMode
    },
    incomingTransformMatrix: {
      get: function () {
        return null
      }
    },
    calculatedTransformMatrix: function () {
      return this.$store.state.landmarkInverseMatrix.map((arr, i) => arr.map((v, idx) => i !== 3 && idx === 3 ? v * 1e6 : v))
    },
    incomingColor: function () {
      return this.$store.state.incomingColor.map((v, idx) => idx === 3 ? v : v / 255)
    },
    selectedIncomingVolume: function () {
      return this.$store.state.selectedIncomingVolumeIndex
    },
    selectedIncomingVolumeId: function () {
      return this.$store.state.selectedIncomingVolumeId
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
    this.$options.nonReactiveData.subscriptions.forEach(s => s.unsubscribe())
    this.$options.nonReactiveData.nehubaViewer.dispose()
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
