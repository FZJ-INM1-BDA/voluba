<template>
  <div
    @mousedown.capture="mousedown"
    @mousemove.capture="mousemove"
    class="nehuba-container">

    <div
      @sliceRenderEvent="nehubaBase__sliceRenderEvent"
      @viewportToData="viewportToData"
      class = "nehuba-element"
      :id = "cid">
      {{ placeholderText }}
    </div>

    <NehubaLandmarksOverlay
      ref = "lmOverlay"
      v-if = "dataToViewport.length > 2"
      :dataToViewport = "dataToViewport"
      :landmarks = "referenceLandmarks"
      class = "landmarks-overlay" />
    
    <div class="statusCardWrapper">
      <NehubaStatusCard>
        <template>
          <div>
            {{ navStatusText }}
          </div>
          <div>
            {{ mousePosStatusText }}
          </div>
        </template>
      </NehubaStatusCard>
    </div>
  </div>
</template>

<script>

import { annotationColorBlur, annotationColorFocus, getShader, testBigbrain, patchSliceViewPanel, determineElement, getRotationVec3, incomingTemplateActiveOpacity } from '@//constants'

import NehubaBaseMixin from '@/mixins/NehubaBase'
import NehubaLandmarksOverlay from '@/components/NehubaLandmarksOverlay'
import NehubaStatusCard from '@/components/NehubaStatusCard'

export default {
  mixins: [
    NehubaBaseMixin
  ],
  data: function () {
    return {
      placeholderText: 'Loading nehuba ...',

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

      /**
       * temporary. need to retrieve config separately
       */
      config: testBigbrain
    }
  },
  mounted: function () {
    this.nehubaBase__initNehuba()
      .then(this.postNehubaInit)
      .catch(e => {
        /**
         * TODO proper error catching and user feedback
         */
        console.error('e', e)
        this.placeholderText = 'error loading nehuba'
      })

    this.$store.subscribeAction(({type, payload}) => {
      if (!('export_nehuba' in window)) return
      const { quat, mat4 } = window.export_nehuba
      switch (type) {
        case 'setPrimaryNehubaNavigation':
          const vec3 = window.export_nehuba.vec3
          this.$options.nehubaBase.nehubaBase__nehubaViewer.setPosition(vec3.fromValues(...payload.coord.map(v => v * 1e6)), true)
          break
        case 'alignReference':
          this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.navigationState.pose.orientation.restoreState([0, 0, 0, 1])
          break
        case 'alignIncoming':
          if (!this.committedTransform) return
          const newQuat = mat4.getRotation(quat.create(), mat4.fromValues(...this.committedTransform))
          this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.navigationState.pose.orientation.restoreState(Array.from(newQuat))
          break
        default:
      }
    })
  },
  watch: {
    nehubaBase__mousePosition: function (array) {
      this.viewerMousePosition = array
    },
    nehubaBase__navigationPosition: function (array) {
      this.viewerNavigationPosition = array
      this.$store.dispatch('primaryNehubaNavigationPositionChanged', array)
    },
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
        this.$options.nehubaBase.nehubaBase__nehubaViewer.setPosition(centerVec3, true)
        
        /**
         * set viewer zoomlevel
         */
        const viewportMin = Math.min(window.innerHeight, window.innerWidth /2 )
        this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.navigationState.zoomFactor.restoreState(nm / viewportMin)
      }
    }
  },
  nonReactiveData: {
    subscriptions: [],
    ngUserLayer: null,
    managedLayers: [],
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
        this.$options.nonReactiveData.ngUserLayer.layer.opacity.restoreState(this.incomingColor[3] * 0.8)
        this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:mousedown0')
        this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:shift+mousedown0')
      } else {
        this.$options.nonReactiveData.ngUserLayer.layer.opacity.restoreState(this.incomingColor[3])
        if (this.translationByDragEnabled) {
          this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:mousedown0', {stopPropagation: true})
        }
        if (this.rotationByDragEnabled) {
          this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:shift+mousedown0', {stopPropagation: true})
        }
      }
    },
    updateMouseOverIncVolState: function ({mouseOverUserlayer}) {
      this.mouseOverIncoming = mouseOverUserlayer
      this.$store.dispatch(this.mouseOverIncoming
        ? 'mouseOverIncomingLayer'
        : 'mouseOutIncomingLayer')
    },
    postNehubaInit: function () {
      /**
       * if an incoming volume has already been selected, add the user layer
       */
      if (this.selectedIncomingVolumeId) {
        const incVol = this.selectedIncomingVolumeId && this.$store.state.incomingVolumes.find(v => v && (v.id === this.selectedIncomingVolumeId))
        if (incVol) {
          const url = incVol.imageSource
          this.addUserLayer(url)
        }
      }

      /**
       * set reference volume transform matrix
       */
      const transform = this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.layerManager.managedLayers[0].layer.transform.toJSON()
      this.$store.commit('setReferenceTemplateTransform', {transform})

      /**
       * load meshes 
       * TODO for now, it's hard coded, big brain loads mesh 100 and 200
       */
      this.$options.nehubaBase.nehubaBase__nehubaViewer.setMeshesToLoad([100, 200])

      /**
       * user mouseover inc vol state
       */
      this.$options.nonReactiveData.subscriptions.push(
        this.$options.nehubaBase.nehubaBase__nehubaViewer.mouseOver.image
          .filter(v => v.layer.name === 'userlayer-0')
          .filter(v => typeof v !== 'undefined')
          .map(ev => ev.value !== null)
          .distinctUntilChanged()
          .map(bool => ({mouseOverUserlayer: bool}))
          .subscribe(this.updateMouseOverIncVolState)
      )

      /**
       * ref vol orientation state
       */
      this.$options.nonReactiveData.subscriptions.push(
        this.$options.nehubaBase.nehubaBase__nehubaViewer.navigationState.orientation
          .subscribe(fa => {
            const array = fa === null
              ? [0, 0, 0, 1]
              : Array.from(fa)
            this.viewerSliceOrientation = array
          })
      )

      /**
       * patch nehuba slice view draw
       */
      setTimeout(() => {
        this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.display.panels.forEach(patchSliceViewPanel)
      })
      this.$options.nonReactiveData.managedLayers = this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.layerManager.managedLayers

      /**
       * emit ready so that second nehuba can be shown if necessary
       */
      this.$emit('ready')

      /**
       * debug
       */
      window.primaryNehubaViewer = this.$options.nehubaBase.nehubaBase__nehubaViewer
    },
    clearUserLayers: function () {
      if (!this.$options.nehubaBase.nehubaBase__nehubaViewer) {
        return
      }
      this.$options.nonReactiveData.ngUserLayer = null
      const lm = this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.layerManager
      this.userLayers
        .map(ul => ul.name)
        .map(layerName => lm.getLayerByName(layerName))
        .forEach(layer => lm.removeManagedLayer(layer))
      this.userLayers = []
    },
    addUserLayer: function (uri) {
      if (!this.$options.nehubaBase.nehubaBase__nehubaViewer) {
        return
      }
      if (!uri) {
        return
      }
      const viewer = this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer
      const name = `userlayer-0`
      const newLayer = {
        annotationColor: '#CCCCCC',
        source: uri,
        opacity: this.incomingColor[3],
        shader: getShader(this.incomingColor)
      }
      const newNgLayer = viewer.layerSpecification.getLayer(name, newLayer)
      const ngUserLayer = viewer.layerManager.addManagedLayer(newNgLayer)
      this.userLayers.push({
        ...newLayer,
        name
      })
      this.$options.nonReactiveData.ngUserLayer = ngUserLayer
    }
  },
  computed: {
    cid: function () {
      return this.nehubaBase__cid
    },
    dataToViewport: function () {
      return this.nehubaBase__dataToViewport
    },
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
    navStatusText: function () {
      return `navigation (mm): ${this.viewerNavigationPosition.map(v => (v / 1e6).toFixed(3)).join(', ')}`
    },
    mousePosStatusText: function () {
      return `mouse (mm): ${this.viewerMousePosition.map(v => (v / 1e6).toFixed(3)).join(', ')}`
    }
  },
  beforeDestroy () {
    this.$options.nonReactiveData.subscriptions.forEach(s => s.unsubscribe())
  },
  components: {
    NehubaLandmarksOverlay,
    NehubaStatusCard
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

.statusCardWrapper
{
  width: 0;
  height: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  overflow: visible;

  z-index: 11;

  display: flex;
  flex-direction: column-reverse;
}

.statusCardWrapper > *
{
  flex: 0 0 0;
}
</style>
