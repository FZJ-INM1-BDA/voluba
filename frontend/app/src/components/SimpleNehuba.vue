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
  data: function () {
    return {
      loadingText: 'Loading simple nehuba ...',
      cid: null,
      nehubaViewer: null,
      errorMessage: null,

      dataToViewport: [
        defaultXform,
        defaultXform,
        defaultXform
      ],

      subscriptions: []
    }
  },
  mounted() {
    this.$store.subscribeAction(({type}) => {
      switch (type) {
        case 'redrawNehuba':
          if(this.nehubaViewer)
            this.nehubaViewer.redraw()
          setTimeout(() => this.navigationChanged())
          break;
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
      return this.$store.state.incomingLandmarks.map(lm => {
        const allPairs = this.$store.state.landmarkPairs.filter(pair => pair.incId === lm.id)
        return {
          ...lm,
          active: allPairs.find(pair => pair.active) ? true : false,
          visible: allPairs.find(pair => pair.visible) ? true : false,
          color: allPairs[0].color
        }
      })
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
      return new Promise((resolve,reject) => {
        this.cid = 'neuroglancer-container'
        resolve()
      })
    },
    init: function () {
      return new Promise((resolve, reject) => {
        this.nehubaViewer = window.export_nehuba.createNehubaViewer(this.config, (err) => {
          console.log(e)
        })

        this.subscriptions.push(
          this.nehubaViewer.navigationState.full.subscribe(() => {
            this.navigationChanged()
          }) 
        )

        resolve()
      })
    },
    postInit: function () {
      return new Promise((resolve, reject) => {
        this.cid = null
        window.secondaryViewer = window.viewer
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
      if (window.secondaryViewer)
        window.secondaryViewer = null
      if (this.nehubaViewer)
        this.nehubaViewer.dispose()
      this.subscriptions.forEach(s => s.unsubscribe())
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
  beforeDestroy() {
    this.destroyNehuba()
  },
}
</script>
<style scoped>
.nehubaElement
{
  width: 100%;
  height: 100%;
}
</style>
