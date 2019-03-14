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
    config: {
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

      subscriptions: []
    }
  },
  mounted () {
    const { quat, mat4 } = window.export_nehuba
    const q = mat4.getRotation(quat.create(), mat4.fromValues(...this.incTransformMatrix))
    quat.normalize(q, q)
    quat.invert(q, q)

    const additionalConfig = {
      orientation: Array.from(q)
    }

    this.nehubaBase__initNehuba(additionalConfig)
      .then(() => {
        
      })
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
      incTransformMatrix: 'incTransformMatrix'
    }),
    cid: function () {
      return this.nehubaBase__cid
    },
    dataToViewport: function () {
      return this.nehubaBase__dataToViewport
    },
    incomingLandmarks: function () {
      return this.$store.state.landmarkPairs
        .map(lmp => {
          const lm = this.$store.state.incomingLandmarks.find(lm => lm.id === lmp.incId)
          return lm
            ? {
              ...lm,
              color: lmp.color,
              active: lmp.active
            }
            : null
        })
        .filter(incLm => incLm !== null)
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
          console.log('init nehuba')
          if (val) {
            this.nehubaBase__initNehuba()
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
