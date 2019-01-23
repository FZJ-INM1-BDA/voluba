<template>
  <div class="nehuba-container">
    <div @sliceRenderEvent = "sliceRenderEvent" class = "nehubaElement" :id = "cid">
      {{ placeholderText }}
    </div>
    <nehuba-landmarks-overlay
      ref = "lmOverlay"
      v-if = "dataToViewport.length > 2"
      :dataToViewport = "dataToViewport"
      :landmarks = "incomingLandmarks"
      class = "landmarks-overlay"
      />
  </div>
</template>
<script>
import NehubaLandmarksOverlay from '@/components/NehubaLandmarksOverlay'
import { defaultXform, determineElement } from './constants'

export default {
  components: {
    NehubaLandmarksOverlay
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
      cid: null,
      errorMessage: null,

      dataToViewport: [
        defaultXform,
        defaultXform,
        defaultXform
      ],

      subscriptions: []
    }
  },
  mounted () {
    this.$store.subscribeAction(({type, payload}) => {
      switch (type) {
        case 'setSecondaryNehubaNavigation':
          const vec3 = window.export_nehuba.vec3
          this.$options.nonReactiveData.nehubaViewer.setPosition(vec3.fromValues(...payload.coord.map(v => v * 1e6)), true)
          break
        case 'redrawNehuba':
          if (this.$options.nonReactiveData.nehubaViewer) {
            this.$options.nonReactiveData.nehubaViewer.redraw()
          }
          setTimeout(() => this.navigationChanged())
          break
        default:
      }
    })
    if (this.config) {
    } else {
      this.errorMessage = `incoming dataset not set`
    }
  },
  computed: {
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
    }
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
    navigationChanged: function () {
      this.$refs.lmOverlay.$forceUpdate()
    },
    preInit: function () {
      return new Promise((resolve, reject) => {
        this.cid = 'neuroglancer-container'
        resolve()
      })
    },
    init: function () {
      return new Promise((resolve, reject) => {
        this.$options.nonReactiveData.nehubaViewer = window.export_nehuba.createNehubaViewer(this.config, (err) => {
          console.log(err)
        })
        this.$options.nonReactiveData.subscriptions.push(
          this.$options.nonReactiveData.nehubaViewer.navigationState.full.subscribe(() => {
            this.navigationChanged()
          })
        )
        this.$options.nonReactiveData.subscriptions.push(
          this.$options.nonReactiveData.nehubaViewer.navigationState.position.inRealSpace
            .subscribe(fa => {
              this.$store.dispatch('secondaryNehubaNavigationPositionChanged', Array.from(fa))
            })
        )
        resolve()
      })
    },
    postInit: function () {
      return new Promise((resolve, reject) => {
        this.cid = null
        window.secondaryViewer = window.viewer
        window.secondaryNehubaViewer = this.$options.nonReactiveData.nehubaViewer
        window.viewer = null
        resolve()
      })
    },
    initNehuba: function () {
      this.preInit()
        .then(this.init)
        .then(this.postInit)
        .catch(console.error)
    },
    onError: function (e) {
      this.errorMessage = e
    },
    destroyNehuba: function () {
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
    }
  },
  watch: {
    config: function () {
      this.destroyNehuba()
      if (this.config) {
        this.initNehuba()
      }
    }
  },
  beforeDestroy () {
    this.destroyNehuba()
  }
}
</script>
<style scoped>
.nehubaElement
{
  width: 100%;
  height: 100%;
}
</style>
