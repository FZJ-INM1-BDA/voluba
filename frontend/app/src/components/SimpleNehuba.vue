<template>
  <div class="nehuba-container">
    <div
      @mousedown.capture="mousedown"
      @sliceRenderEvent="nehubaBase__sliceRenderEvent"
      @viewportToData="nehubaBase__viewportToData"
      class = "nehubaElement"
      :id = "cid">
      {{ placeholderText }}
    </div>
    <nehuba-landmarks-overlay
      @gotoLm="gotoLm({ id: $event.lmId, volume: 'incoming' })"
      @mousedownOnIcon="dragLandmark__handleMousedownOnIcon({...$event, volume: 'incoming'})"
      @mouseenterOnIcon="hoverLandmarkPair({ incId: $event.lmId, hover: true })"
      @mouseleaveOnIcon="hoverLandmarkPair({ incId: $event.lmId, hover: false })"
      ref = "lmOverlay"
      v-if = "dataToViewport.length > 2"
      :dataToViewport = "dataToViewport"
      :landmarks = "incomingLandmarks"
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

    <div class="pe-none rotation-control-container">
      <div class="h-50 row">
        <div class="col">
          <TwoDRotationWidget
            :rotationQuaternion="rotQ1"
            @clickTwoArrow="flipAxis({ axis: $event.idx })"
            @rotateCircle="rotateCircle(0, $event)"/>
        </div>
        <div class="col">
          <TwoDRotationWidget
            @clickTwoArrow="flipAxis({ axis: $event.idx })"
            :rotationQuaternion="rotQ2"
            @rotateCircle="rotateCircle(1, $event)"/>
        </div>
      </div>
      <div class="h-50 row">
        <div class="col">
          <TwoDRotationWidget
            @clickTwoArrow="flipAxis({ axis: $event.idx })"
            :rotationQuaternion="rotQ3"
            @rotateCircle="rotateCircle(2, $event)"/>
        </div>
        <div class="col">
        </div>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="showOverScreen"
        class="overlay-screen">
        <div>
          <h3 class="text-light">
            <font-awesome-icon icon="arrow-left" />
          </h3>
        </div>
        <div class="ml-3">
          <h3 class="text-light text-left">
            Add landmark to the reference volume
          </h3>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import NehubaLandmarksOverlay from '@/components/NehubaLandmarksOverlay'
import NehubaBaseMixin from '@/mixins/NehubaBase'
import DragLandmarkMixin from '@/mixins/DragLandmarkMixin'
import NehubaStatusCard from '@/components/NehubaStatusCard'
import { UNPAIRED_COLOR, INCOMING_COLOR } from '@/constants'
import { mapState, mapGetters, mapActions } from 'vuex'
import TwoDRotationWidget from '@/components/RotationWidget/TwoDRotationWidget'

export default {
  mixins: [
    NehubaBaseMixin,
    DragLandmarkMixin
  ],
  components: {
    NehubaLandmarksOverlay,
    NehubaStatusCard,
    TwoDRotationWidget
  },
  props: {
    baseConfig: {
      type: Object
    }
  },
  nonReactiveData: {
    subscriptions: [],
    nehubaViewer: null
  },
  data: function () {
    return {
      loadingText: 'Loading simple nehuba ...',
      errorMessage: null,

      viewerNavigationPosition: [0, 0, 0],
      viewerMousePosition: [0, 0, 0],

      subscriptions: [],
      config: this.baseConfig ? JSON.parse(JSON.stringify(this.baseConfig)) : null,
    }
  },
  mounted () {
    if (! ('export_nehuba' in window)) {
      return
    }

    if (this.incTransformMatrix) {
      const { mat4 } = window.export_nehuba
      const realXform = mat4.transpose(mat4.create(), this.incTransformMatrix)
      const transform = [
        Array.from(realXform.slice(0, 4)),
        Array.from(realXform.slice(4, 8)),
        Array.from(realXform.slice(8, 12)),
        Array.from(realXform.slice(12, 16))
      ]
      this.config.dataset.initialNgState.layers.default.transform = transform
    }
    
    const additionalConfig = this.viewerNavigationStateString && JSON.parse(this.viewerNavigationStateString)

    this.nehubaBase__initNehuba(additionalConfig)
      .then(this.postNehubaInit)
      .catch(e => {
        console.log('nehubaBase initNehuba Error', e)
      })
    this.$store.subscribeAction(({type, payload}) => {
      switch (type) {
        case 'setSecondaryNehubaNavigation':
          if (this.$options.nehubaBase && this.$options.nehubaBase.nehubaBase__nehubaViewer) {
            const vec3 = window.export_nehuba.vec3
            this.$options.nehubaBase.nehubaBase__nehubaViewer.setPosition(vec3.fromValues(...payload.coord.map(v => v * 1e6)), true)
          }
          break
        default:
      }
    })

    this.nehubaBase__navigationChanged = () => {
      if (this.$refs.lmOverlay)
        this.$refs.lmOverlay.$forceUpdate()
    }
    
    if (!this.config) {
      this.errorMessage = `incoming dataset not set`
    }
  },
  computed: {
    ...mapGetters({
      incTransformMatrixReal: 'incTransformMatrixReal',
      incRotQuat: 'incRotQuat'
    }),
    ...mapState({
      appendNehubaFlag: 'appendNehubaFlag',
      incTransformMatrix: 'incTransformMatrix',
      viewerNavigationStateString: 'viewerNavigationStateString',
      landmarkPairs: 'landmarkPairs',
      addLandmarkMode: 'addLandmarkMode',
      showOverScreen: state => state.addLandmarkMode && state.addLandmarkMode === 'reference' && state._step2Mode === 'classic',
      xformedIncLm: function (state) {
        return state.incomingLandmarks.map(lm => {
          let coord = lm.coord
          if (state.appendNehubaFlag) {
            const { vec3, mat4 } = window.export_nehuba
            const tmpcoord = vec3.fromValues(...lm.coord)
            coord = Array.from(vec3.transformMat4(vec3.create(), tmpcoord, this.incTransformMatrixReal))
          } 
          return {
            ...lm,
            coord
          }
        })
      }
    }),
    rotQ1: function () {
      if (!this.appendNehubaFlag)
        return [0, 0, 0, 1]
      const { quat } = window.export_nehuba
      const adj = quat.fromEuler(quat.create(), 90, 0, 0)
      const ori = quat.fromValues(...(this.nehubaBase__navigationOrientation || [0, 0, 0, 1]))
      quat.mul(ori, adj, ori)
      quat.mul(ori, quat.fromValues(...this.incRotQuat), ori)
      quat.normalize(ori, ori)
      return Array.from(ori)
    },
    rotQ2: function () {
      if (!this.appendNehubaFlag)
        return [0, 0, 0, 1]
      const { quat } = window.export_nehuba
      const adj = quat.fromEuler(quat.create(), 90, 90, 0)
      const ori = quat.fromValues(...(this.nehubaBase__navigationOrientation || [0, 0, 0, 1]))
      quat.mul(ori, adj, ori)
      quat.mul(ori, quat.fromValues(...this.incRotQuat), ori)
      quat.normalize(ori, ori)
      return Array.from(ori)
    },
    rotQ3: function () {
      if (!this.appendNehubaFlag)
        return [0, 0, 0, 1]
      const { quat } = window.export_nehuba
      const ori = quat.fromValues(...(this.nehubaBase__navigationOrientation || [0, 0, 0, 1]))
      quat.mul(ori, quat.fromValues(...this.incRotQuat), ori)
      quat.normalize(ori, ori)
      return Array.from(ori)
    },
    incomingLandmarks: function () {
      return this.addLandmarkMode === 'incoming'
        ? this.storedIncomingLandmarks.concat([
          {
            id: 'tmplm',
            name: 'tmplm',
            color: INCOMING_COLOR,
            coord: this.viewerMousePosition.map(v => v / 1e6),
            temporary: true,
            active: true
          }
        ])
        : this.storedIncomingLandmarks
    },
    storedIncomingLandmarks: function () {
      return this.xformedIncLm.map(lm => {
        const lmp = this.landmarkPairs.find(lmp => lmp.incId === lm.id)
        return lmp
          ? {
            ...lmp,
            ...lm,
            name: lmp.name,
            color: lmp.color
          }
          : {
            ...lm,
            color: UNPAIRED_COLOR
          }
      })
    },
    cid: function () {
      return this.nehubaBase__cid
    },
    dataToViewport: function () {
      return this.nehubaBase__dataToViewport
    },
    placeholderText: function () {
      return this.errorMessage
        ? this.errorMessage
        : this.loadingText
    },
    navStatusText: function () {
      return `navigation (mm): ${this.viewerNavigationPosition.map(v => (v / 1e6).toFixed(3)).join(', ')}`
    },
    mousePosStatusText: function () {
      return `mouse (mm): ${this.viewerMousePosition.map(v => (v / 1e6).toFixed(3)).join(', ')}`
    }
  },
  methods: {
    ...mapActions({
      gotoLm: 'gotoLm',
      addLandmark: 'addLandmark',
      hoverLandmarkPair: 'hoverLandmarkPair',
      flipAxis: 'flipAxis'
    }),
    rotateCircle: function (idx, {rot}) {
      if (!this.appendNehubaFlag)
        return

      if (!this.nehubaBase__navigationOrientation)
        return
        
      const { vec3, quat } = window.export_nehuba
      const unitV = vec3.fromValues(
        idx === 1 ? 1 : 0,
        idx === 0 ? -1 : 0,
        idx === 2 ? 1 : 0
      )
      const rotQuat = quat.fromValues(...this.nehubaBase__navigationOrientation)
      const rotVec = vec3.transformQuat(vec3.create(), unitV, rotQuat)
      const currQ = quat.fromValues(...this.incRotQuat)
      quat.invert(currQ, currQ)
      vec3.transformQuat(rotVec, rotVec, currQ)
      quat.setAxisAngle(rotQuat, rotVec, rot / 180 * Math.PI)

      this.$store.dispatch('pushUndo', {
        name: `rotate by 2D widget ${idx}`,
        collapse: `rotate by rgb widget ${idx}`
      })
      this.$store.dispatch('rotIncBy', {
        quaternion: Array.from(rotQuat)
      })
    },
    mousedown: function () {
      if (this.addLandmarkMode === 'incoming') {
        this.addLandmark({
          landmark: {
            coord: this.viewerMousePosition.map(v => v / 1e6)
          }
        })
      }
    },
    onError: function (e) {
      this.errorMessage = e
    },
    destroyNehuba: function () {
      return new Promise((resolve, reject) => {

        if (window.secondaryViewer) {
          window.secondaryViewer = null
        }
        if (window.secondaryNehubaViewer) {
          window.secondaryNehubaViewer = null
        }
        if (this.$options.nonReactiveData.nehubaViewer) {
          this.$options.nonReactiveData.nehubaViewer.dispose()
          this.$options.nonReactiveData.nehubaViewer = null
        }
        this.$options.nonReactiveData.subscriptions.forEach(s => s.unsubscribe())

        if (this.nehubaBase__nehubaBaseDestroyHook) {
          this.nehubaBase__nehubaBaseDestroyHook()
        }
        resolve()
      })
    },
    postNehubaInit: function () {
      window.secondaryNehubaViewer = this.$options.nehubaBase.nehubaBase__nehubaViewer
    }
  },
  watch: {
    incTransformMatrix: function (val) {
      if (!this.appendNehubaFlag) {
        return
      }
      const { mat4 } = window.export_nehuba
      const nehubaViewer = this.$options && this.$options.nehubaBase && this.$options.nehubaBase.nehubaBase__nehubaViewer
      const layerManager = nehubaViewer && nehubaViewer.ngviewer && nehubaViewer.ngviewer && nehubaViewer.ngviewer.layerManager
      if (!layerManager) {
        return
      }
      /**
       * because layer 0 is the template
       */
      const layer = layerManager.managedLayers && layerManager.managedLayers[1]
      if (!layer) {
        return
      }
      const m = mat4.fromValues(...val)
      layer.layer.transform.transform = m
      layer.layer.transform.changed.dispatch()
    },
    nehubaBase__mousePosition: function (array) {
      this.viewerMousePosition = array
    },
    nehubaBase__navigationPosition: function (array) {
      this.viewerNavigationPosition = array
      this.$store.dispatch('secondaryNehubaNavigationPositionChanged', array)
    },
    config: function (val) {
      this.nehubaBase__destroyNehuba()
        .then(() => {
          if (val) {
            this.nehubaBase__initNehuba()
              .then(this.postNehubaInit)
              .catch(e => {
                console.error('simple nehuba init error', e)
              })
          }
        })
        .catch(console.error)
    }
  },
  beforeDestroy () {
    this.nehubaBase__destroyNehuba()
  }
}
</script>
<style scoped>
.nehubaElement
{
  width: 100%;
  height: 100%;
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
.overlay-screen
{
  display:flex;
  align-items: center;
  justify-content: flex-start;
}
.overlay-screen > *:first-child
{
  flex: 0 1 0;
}
.overlay-screen > *:last-child
{
  flex: 0 0 0;
}

.rotation-control-container
{
  position:absolute;
  lefT: 0;
  top: 0;
  width: 100%;
  height: 100%;

  z-index: 999;
}
</style>
