<template>

  <!-- mosue move event need to capture the entire container -->
  <!-- otherwise, when drag inc vol over landmarks, the inc vol will not move -->
  <div
    class="nehuba-container">

    <!-- mousedown needs to be capturing event into nehuba container -->
    <!-- otherwise, mousedown on landmarks will also be captured -->
    <div
      @mousedown.capture="mousedown"
      @sliceRenderEvent="nehubaBase__sliceRenderEvent"
      @viewportToData="nehubaBase__viewportToData"
      class = "nehuba-element"
      :id = "cid">
      <span
        v-if="!errorFlag">
        {{ placeholderText }}
      </span>
      <div
        v-if="errorFlag"
        class="container-alert-box alert alert-danger">
        {{ placeholderText }}
      </div>
    </div>

    <NehubaLandmarksOverlay
      @gotoLm="gotoLm({ id: $event.lmId, volume: 'reference' })"
      @mousedownOnIcon="dragLandmark__handleMousedownOnIcon({...$event, volume: 'reference'})"
      @mouseenterOnIcon="handleMouseenterOnIcon({ event: $event, refId: $event.lmId, hover: true })"
      @mouseleaveOnIcon="handleMouseleaveOnIcon({ event: $event, refId: $event.lmId, hover: false })"
      ref="lmOverlay"
      v-if="appendNehubaFlag && showReferenceLandmarkOverlay"
      :perspectiveOrientation="compoundPerspectiveOrientation"
      :dataToViewport="dataToViewport"
      :landmarks="referenceLandmarks"
      class="landmarks-overlay" />

    <nehuba-landmarks-overlay
      @gotoLm="gotoLm({ id: $event.lmId, volume: 'incoming' })"
      @mousedownOnIcon="dragLandmark__handleMousedownOnIcon({...$event, volume: 'incoming', transform: incTransformMatrix})"
      @mouseenterOnIcon="handleMouseenterOnIcon({ event: $event, incId: $event.lmId, hover: true })"
      @mouseleaveOnIcon="handleMouseleaveOnIcon({ event: $event, incId: $event.lmId, hover: false })"
      ref="lmOverlay1"
      v-if="appendNehubaFlag && showIncomingLandmarkOverlay"
      :dataToViewport="dataToViewport"
      :landmarks="incomingLandmarks"
      class="landmarks-overlay" />
    
    <div
      v-if="showRotationWidget"
      ref="svgContainer"
      class="perspective-controller">
      <RotationWidgetComponent
        :rotationQuat="compoundPerspectiveOrientation"/>
    </div>
    
    <div
      v-if="appendNehubaFlag"
      class="statusCardWrapper">
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

    <transition name="fade">
      <div
        v-if="showOverScreen"
        class="overlay-screen">
        <div class="mr-3">
          <h3 class="text-light text-right">
            Add landmark to the incoming volume
          </h3>
        </div>
        <div>
          <h3 class="text-light">
            <font-awesome-icon icon="arrow-right" />
          </h3>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { REFERENCE_COLOR, UNPAIRED_COLOR, INCOMING_COLOR, annotationColorBlur, annotationColorFocus, getShader, testBigbrain, determineElement, getRotationVec3, incomingTemplateActiveOpacity } from '@//constants'
import { incompatibleBrowserText } from '@/text'

import NehubaBaseMixin from '@/mixins/NehubaBase'
import DragLandmarkMixin from '@/mixins/DragLandmarkMixin'
import NehubaLandmarksOverlay from '@/components/NehubaLandmarksOverlay'
import NehubaStatusCard from '@/components/NehubaStatusCard'
import RotationWidgetComponent from '@/components/RotationWidget/RotationWidgetComponent'

export default {
  mixins: [
    NehubaBaseMixin,
    DragLandmarkMixin
  ],
  data: function () {
    return {
      placeholderText: 'Loading nehuba ...',
      nehubaLoaded: false,
      pushUndoFlag: true,
      errorFlag: false,

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
      viewerPerspectiveOrientation: [0, 0, 0, 1],

      /**
       * temporary. need to retrieve config separately
       */
      config: testBigbrain
    }
  },
  mounted: function () {
    if (this.appendNehubaFlag) {
      this.nehubaBase__initNehuba()
        .then(this.postNehubaInit)
        .catch(e => {
          /**
           * TODO proper error catching and user feedback
           */
          this.log([ 'Nehuba.vue#mounted', {error: e} ])
          this.errorFlag = true
          this.placeholderText = incompatibleBrowserText
        })
    }

    this.nehubaBase__navigationChanged = () => {
      if (this.$refs.lmOverlay)
        this.$refs.lmOverlay.$forceUpdate()
      if (this.$refs.lmOverlay1)
        this.$refs.lmOverlay1.$forceUpdate()
    }

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
    appendNehubaFlag: function (flag) {
      if (flag === true) {
        this.nehubaBase__initNehuba()
          .then(this.postNehubaInit)
          .catch(e => {
            /**
             * TODO proper error catching and user feedback
             */
            this.log([ 'Nehuba.vue#watch#appendNehubaFlag', {error: e} ])
            this.errorFlag = true
            this.placeholderText = incompatibleBrowserText
          })
      } else if (!flag && flag !== false) {
        /**
         * if flag is falsy, but not false, indicating error
         */
        this.errorFlag = true
        this.placeholderText = incompatibleBrowserText
      }
    },
    _showRefVol: function (bool) {
      const layer = this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.layerManager.managedLayers[0]
      layer.setVisible(bool)
    },
    _showIncVolOverlay: function (bool) {
      const layer = this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.layerManager.getLayerByName('userlayer-0')
      if (layer) {
        layer.setVisible(bool)
        this.$store.dispatch('changeOpacity', 1.0)
      }
    },
    nehubaBase__mousePosition: function (array) {
      this.viewerMousePosition = array
    },
    nehubaBase__navigationPosition: function (array) {
      this.viewerNavigationPosition = array
      this.$store.dispatch('primaryNehubaNavigationPositionChanged', array)
    },
    incTransformMatrix: function (array) {
      const { mat4, vec3 } = window.export_nehuba

      const matrix = mat4.fromValues(...array)
      /**
       * xform matrix sometimes a bit wonky
       */
      this.$options.nonReactiveData.ngUserLayer.layer.transform.transform = matrix
      this.$options.nonReactiveData.ngUserLayer.layer.transform.changed.dispatch()
    },
    /**
     * may becoming obsolete
     */
    incomingVolumeSelected: function (bool) {
      this.$store.dispatch('highlightIncomingVolume', bool)
    },
    incomingColor: function (rgba) {
      if (this.$options.nonReactiveData.ngUserLayer) {
        this.$options.nonReactiveData.ngUserLayer.layer.fragmentMain.restoreState(getShader(rgba))
        this.$options.nonReactiveData.ngUserLayer.layer.opacity.restoreState(rgba[3])
      }
    },
    selectedIncomingVolume: function (vol) {
      this.clearUserLayers()
      if (vol) {
        const url = vol.imageSource
        this.addUserLayer(url)
      }
    },
    mouseOverIncoming: function (val) {
      if (val) {
        this.$options.nonReactiveData.ngUserLayer.layer.opacity.restoreState(this.incomingColor[3] * 0.8)
      } else {
        this.$options.nonReactiveData.ngUserLayer.layer.opacity.restoreState(this.incomingColor[3])
      }

      this.nehubaInputBinding({
        overrideRotation: val && !this.incVolRotationLock,
        overrideTranslation: val && !this.incVolTranslationLock
      })
    },
    incVolRotationLock: function (lock) {
      this.nehubaInputBinding({
        overrideRotation: !lock
      })
    },
    incVolTranslationLock: function (lock) {
      this.nehubaInputBinding({
        overrideTranslation: !lock
      })
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
    ...mapActions({
      hoverLandmarkPair: 'hoverLandmarkPair',
      gotoLm: 'gotoLm',
      log: 'log'
    }),
    handleMouseenterOnIcon: function ({ refId, incId, hover }) {
      this.hoverLandmarkPair({ refId, incId, hover })
    },
    handleMouseleaveOnIcon: function ({ refId, incId, hover }) {
      this.hoverLandmarkPair({ refId, incId, hover })
    },
    mousedown: function (event) {
      if (this.addLandmarkMode) {
        /**
         * as this landmark object will directly overwrite the added landmark
         * use mm instead
         */
        this.$store.dispatch('addLandmark', {
          landmark: {
            coord: this.viewerMousePosition.map(v => v / 1e6)
          }
        })
        return
      }
      if (!this.mouseOverIncoming) {
        /**
         * allows for user drag whole volume, without deselecting incoming volume
         */
        this.$options.nonReactiveData.timeoutId = setTimeout(() => {
          this.incomingVolumeSelected = false
          this.$options.nonReactiveData.timeoutId = null
        }, 300)
        return
      }
      if (this.incVolTranslationLock && this.incVolRotationLock) 
        return
      if (this.incVolTranslationLock || this.incVolRotationLock) {
        if (this.incVolTranslationLock && !event.shiftKey)
          return
        if (this.incVolRotationLock && event.shiftKey)
          return
      }

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

      document.addEventListener('mousemove', this.mousemove, true)

      document.addEventListener('mouseup', ev => {

        /**
         * on mosue up, remove event listener
         */
        document.removeEventListener('mousemove', this.mousemove, true)

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

        this.pushUndoFlag = true
      }, {
        once: true,
        capture: true
      })
    },
    pushUndo: function (meta = {}) {
      if (!this.pushUndoFlag) {
        return
      }
      this.$store.dispatch('pushUndo', meta)
      this.pushUndoFlag = false
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
          this.pushUndo({ name: 'translating incoming volume' })
          /**
           * first, translation mouse delta into 3d delta
           */
          let pos = vec3.fromValues(deltaX, deltaY, 0)
          if (!this.nehubaBase__viewportToDatas[this.movingIncomingIndex])
            return
          vec3.transformMat4(pos, pos, this.nehubaBase__viewportToDatas[this.movingIncomingIndex])
          
          /**
           * get previous translate
           */
          const xformMat = mat4.fromValues(...this.incTransformMatrix)
          const prevTranslVec = mat4.getTranslation(vec3.create(), xformMat)
          
          /**
           * account for navigation movement
           */
          vec3.subtract(pos, pos, vec3.fromValues(...this.viewerNavigationPosition))

          /**
           * add delta & set xformMat
           */
          vec3.add(pos, pos, prevTranslVec)
          
          this.$store.dispatch('setTranslInc', {
            axis: 'xyz',
            value: Array.from(pos).map(v => v / 1e6)
          })
        }

        if (this.rotationByDragEnabled && this.rotatingIncoming) {
          this.pushUndo({ name : 'rotating incoming volume' })
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
          this.$store.dispatch('rotIncBy', {quaternion: Array.from(finalRotation)})
        }
      }
    },
    updateMouseOverIncVolState: function ({mouseOverUserlayer}) {

      if (this._showIncVolOverlay && !this._showRefVol)
        return

      this.mouseOverIncoming = mouseOverUserlayer
      this.$store.dispatch(this.mouseOverIncoming
        ? 'mouseOverIncomingLayer'
        : 'mouseOutIncomingLayer')
    },
    postNehubaInit: function () {

      /**
       * if an incoming volume has already been selected, add the user layer
       */
      if (this.selectedIncomingVolume) {
        const url = this.selectedIncomingVolume.imageSource
        this.addUserLayer(url)
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
       * ref vol navigation state
       */
      this.$options.nonReactiveData.subscriptions.push(
        this.$options.nehubaBase.nehubaBase__nehubaViewer.navigationState.all
          .subscribe(state => {
            const { orientation, perspectiveOrientation, position } = state
            const arrOrientation = orientation === null
              ? [0, 0, 0, 1]
              : Array.from(orientation)
            this.viewerSliceOrientation = arrOrientation

            const arrPerspectiveOrientation = perspectiveOrientation === null
              ? [0, 0, 0, 1]
              : Array.from(perspectiveOrientation)
            this.viewerPerspectiveOrientation = arrPerspectiveOrientation

            const obj = {
              ...state,
              orientation: arrOrientation,
              perspectiveOrientation: arrPerspectiveOrientation,
              position: Array.from(position)
            }
            this.$store.commit('setViewerNavigationStateString', JSON.stringify(obj))
          })
      )

      /**
       * get managedLayer for easier access
       */
      const mgdLayers = this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.layerManager.managedLayers
      this.$options.nonReactiveData.managedLayers = mgdLayers

      /**
       * remove guiding grey boxes
       * 
       */
      const hideGuidingGreyLine = ({handlers , layer}) => {
        let flag = false
        return () => {
          if (flag) return
          flag = true

          const source = layer.annotationLayerState.value.source
          source.annotationMap.clear()
          source.changed.dispatch()
        }
      }
      
      mgdLayers.forEach(l => {
        const layer = l.layer
        const handlers = l.layer.annotationLayerState.changed.handlers
        handlers.add(hideGuidingGreyLine({handlers, layer}))
      })
      
      /**
       * emit ready so that second nehuba can be shown if necessary
       */
      this.$emit('ready')
      this.nehubaLoaded = true

      /**
       * debug
       */
      window.primaryNehubaViewer = this.$options.nehubaBase.nehubaBase__nehubaViewer
    },
    nehubaInputBinding: function ({ overrideTranslation = null, overrideRotation = null}) {
      if (overrideTranslation !== null) {
        if (overrideTranslation) {
          this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:mousedown0', {stopPropagation: true})
        } else {
          this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:mousedown0')
        }
      }

      if (overrideRotation !== null) {
        if (overrideRotation) {
          this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.set('at:shift+mousedown0', {stopPropagation: true})
        } else {
          this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer.inputEventBindings.sliceView.bindings.delete('at:shift+mousedown0')
        }
      }

    },
    clearUserLayers: function () {
      if (!this.$options.nehubaBase || !this.$options.nehubaBase.nehubaBase__nehubaViewer) {
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
      if (!this.$options.nehubaBase ||  !this.$options.nehubaBase.nehubaBase__nehubaViewer) {
        return
      }
      if (!uri) {
        return
      }
      const viewer = this.$options.nehubaBase.nehubaBase__nehubaViewer.ngviewer
      const name = `userlayer-0`
      const newLayer = {
        annotationColor: annotationColorFocus,
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
    ...mapGetters({
      incRotQuat: 'incRotQuat'
    }),
    ...mapState({
      appendNehubaFlag: 'appendNehubaFlag',
      translationByDragEnabled: state => !state.incVolTranslationLock,
      rotationByDragEnabled: state => !state.incVolRotationLock,
      addLandmarkMode: 'addLandmarkMode',
      landmarkControlVisible: 'landmarkControlVisible',
      _step2Mode: '_step2Mode',
      _step2OverlayFocus: '_step2OverlayFocus',
      incTransformMatrix: 'incTransformMatrix',
      selectedIncomingVolume: state => state.incomingVolumes.find(v => v.id === state.selectedIncomingVolumeId),
      incVolTranslationLock: 'incVolTranslationLock',
      incVolRotationLock: 'incVolRotationLock',
      flippedState: 'flippedState',
      overlayColorHex: state => state.overlayColor.hex || INCOMING_COLOR,
      showOverScreen: state => state.addLandmarkMode && state.addLandmarkMode === 'incoming' && state._step2Mode === 'classic',
    }),
    showRotationWidget: function () {
      return this.appendNehubaFlag && this._step2Mode === 'overlay'
    },
    compoundPerspectiveOrientation: function () {
      if (!this.viewerPerspectiveOrientation || !this.nehubaLoaded)
        return null
      const { quat } = window.export_nehuba
      const q = quat.fromValues(...this.incRotQuat)
      quat.mul(q, q, this.viewerPerspectiveOrientation)
      quat.normalize(q, q)
      return Array.from(q)
    },
    _showRefVol: function () {
      return true || !this.showDoubleOverlay || !this.landmarkControlVisible || this._step2OverlayFocus === 'reference'
    },
    _showIncVolOverlay: function () {
      if (this.showDoubleOverlay) {
        return true || !this.landmarkControlVisible || this._step2OverlayFocus === 'incoming'
      } else {
        return false
      }
    },
    showReferenceLandmarkOverlay: function () {
      return this.nehubaLoaded && this.dataToViewport.length > 2 && this._showRefVol
    },
    showIncomingLandmarkOverlay: function () {
      return this.nehubaLoaded && this.dataToViewport.length > 2 && this._showIncVolOverlay
    },
    showDoubleOverlay: function () {
      return this.$store.state._step2Mode === 'overlay'
    },
    cid: function () {
      return this.nehubaBase__cid
    },
    dataToViewport: function () {
      return this.nehubaBase__dataToViewport
    },
    calculatedTransformMatrix: function () {
      return this.$store.state.landmarkInverseMatrix.map((arr, i) => arr.map((v, idx) => i !== 3 && idx === 3 ? v * 1e6 : v))
    },
    incomingColor: function () {
      return this.$store.state.incomingColor.map((v, idx) => idx === 3 ? v : v / 255)
    },
    storedIncomingLandmarks: function () {
      const {vec3,  mat4} = window.export_nehuba
      const incVM = mat4.fromValues(...this.incTransformMatrix)
      return this._step2Mode === 'overlay'
        /**
         * return all incoming landmarks
         */
        ? this.$store.state.incomingLandmarks.map(lm => {
            const coord = vec3.fromValues(...lm.coord.map(v => v * 1e6))
            vec3.transformMat4(coord, coord, incVM)
            const lmp = this.$store.state.landmarkPairs.find(lmp => lmp.incId === lm.id)
            return {
              ...lmp,
              ...lm,
              ...(lmp ? { name: lmp.name } : {}),
              color: this.overlayColorHex,
              coord: Array.from(coord).map(v => v / 1e6)
            }
          })
        /**
         * if step2 mode === classic, then do not show any incoming landmarks
         */
        : []
    },
    incomingLandmarks: function () {
      return this.addLandmarkMode 
        ? this.storedIncomingLandmarks.concat([
            {
              id: 'tmplm',
              name: 'tmplm',
              color: this.addLandmarkMode === 'incoming' ? INCOMING_COLOR : REFERENCE_COLOR,
              coord: this.viewerMousePosition.map(v => v / 1e6),
              temporary: true,
              active: true
            }
          ])
        : this.storedIncomingLandmarks
    },
    storedReferenceLandmarks: function () {
      return this.$store.state.referenceLandmarks.map(lm => {
        const lmp = this.$store.state.landmarkPairs.find(lmp => lmp.refId === lm.id)
        return lmp
          ? {
            ...lmp,
            ...lm,
            name: lmp.name,
            ...(this._step2Mode !== 'overlay'
              ? { color : lmp.color }
              : { color: REFERENCE_COLOR })
          }
          : {
            ...lm,
            color: UNPAIRED_COLOR
          }
      })
    },
    referenceLandmarks: function () {
      return this.addLandmarkMode
        ? this.storedReferenceLandmarks.concat([
            {
              id: 'tmplm',
              name: 'tmplm',
              color: this.addLandmarkMode === 'incoming' ? INCOMING_COLOR : REFERENCE_COLOR,
              coord: this.viewerMousePosition.map(v => v / 1e6),
              temporary: true,
              active: true
            }
          ])
        : this.storedReferenceLandmarks
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
    this.nehubaBase__destroyNehuba()
  },
  components: {
    NehubaLandmarksOverlay,
    NehubaStatusCard,
    RotationWidgetComponent
  }
}
</script>

<style>
div.neuroglancer-panel
{
  position: relative;
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

.perspective-controller
{
  position: absolute;
  right: 0;
  bottom: 0;
  margin: 1.5em;
  z-index: 999;
}

.container-alert-box
{
  margin: 2em 5em;
}

.overlay-screen
{
  display:flex;
  align-items: center;
  justify-content: flex-end;
}
.overlay-screen > *:first-child
{
  flex: 0 1 0;
}
.overlay-screen > *:last-child
{
  flex: 0 0 0;
}
</style>
