<template>
  <div class="nehuba-container">
    <div
      @sliceRenderEvent="nehubaBase__sliceRenderEvent"
      @viewportToData="nehubaBase__viewportToData"
      class = "nehubaElement"
      :id = "cid">
      {{ placeholderText }}
    </div>
    <nehuba-landmarks-overlay
      @mousedownOnIcon="dragLandmark__handleMousedownOnIcon({...$event, volume: 'incoming'})"
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
  </div>
</template>
<script>
import NehubaLandmarksOverlay from '@/components/NehubaLandmarksOverlay'
import NehubaBaseMixin from '@/mixins/NehubaBase'
import DragLandmarkMixin from '@/mixins/DragLandmarkMixin'
import NehubaStatusCard from '@/components/NehubaStatusCard'
import { UNPAIRED_COLOR } from '@/constants'
import { mapState } from 'vuex'

export default {
  mixins: [
    NehubaBaseMixin,
    DragLandmarkMixin
  ],
  components: {
    NehubaLandmarksOverlay,
    NehubaStatusCard
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
      config: this.baseConfig ? JSON.parse(JSON.stringify(this.baseConfig)) : null
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
    ...mapState({
      incTransformMatrix: 'incTransformMatrix',
      incTransformMatrixReal: 'incTransformMatrixReal',
      viewerNavigationStateString: 'viewerNavigationStateString',
      xformedIncLm: function (state) {
        return state.incomingLandmarks.map(lm => {
          let coord = lm.coord
          if (state.appendNehubaFlag) {
            const { vec3, mat4 } = window.export_nehuba
            const tmpcoord = vec3.fromValues(...lm.coord)
            coord = Array.from(vec3.transformMat4(vec3.create(), tmpcoord, state.incTransformMatrixReal))
          } 
          return {
            ...lm,
            coord
          }
        })
      }
    }),
    cid: function () {
      return this.nehubaBase__cid
    },
    dataToViewport: function () {
      return this.nehubaBase__dataToViewport
    },
    incomingLandmarks: function () {
      return this.xformedIncLm.map(lm => {
        const lmp = this.$store.state.landmarkPairs.find(lmp => lmp.incId === lm.id)
        return lmp
          ? {
            ...lm,
            color: lmp.color
          }
          : {
            ...lm,
            color: UNPAIRED_COLOR
          }
      })
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
</style>
