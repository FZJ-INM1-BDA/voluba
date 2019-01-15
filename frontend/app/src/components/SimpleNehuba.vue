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
  beforeMount() {
    if (!this.config) {
      this.errorMessage = 'config object not provided, simple  nehuba will not load'
      return
    }
    this.cid = 'neuroglancer-container'
  },
  mounted() {
    if (this.config) {
      this.initNehuba()
    } else {
      this.errorMessage = `incoming dataset not set`
    }
  },
  computed: {
    incomingLandmarks: function () {
      return this.$store.state.incomingLandmarks
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
    },
    navigationChanged: function () {
      this.$refs.lmOverlay.$forceUpdate()
    },
    initNehuba: function () {
      this.nehubaViewer = window.export_nehuba.createNehubaViewer(this.config, (err) => {
        console.log(e)
      })

      this.subscriptions.push(
        this.nehubaViewer.navigationState.full.subscribe(() => {
          this.navigationChanged()
        }) 
      )
      /**
       * clear window.viewer object
       */
      window.secondaryViewer = window.viewer
      window.viewer = null
    },
    onError: function (e) {
      this.errorMessage = e
    }
  },
  beforeDestroy() {
    if (window.secondaryViewer)
      window.secondaryViewer = null
    if (this.nehubaViewer)
      this.nehubaViewer.dispose()
    this.subscriptions.forEach(s => s.unsubscribe())
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
