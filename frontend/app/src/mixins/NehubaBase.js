import { defaultXform, determineElement } from '@//constants'

export default {
  data: function () {
    return {
      dataToViewport: [
        defaultXform,
        defaultXform,
        defaultXform
      ],
    }
  },
  mounted() {
    this.$store.subscribeAction(({type}) => {
      if (type === 'redrawNehuba') {
        if ( this.$options && this.$options.nonReactiveData && this.$options.nonReactiveData.nehubaViewer ) {
          this.$options.nonReactiveData.nehubaViewer.redraw()
          setTimeout(this.navigationChanged)
        }
      }
    })
  },
  watch: {
    cid: function (val) {
      if (val === null) {
        this.$emit('ready')
      }
    }
  },
  methods: {
    nehubaBaseDestroyHook: function () {
      this.dataToViewport = [
        defaultXform,
        defaultXform,
        defaultXform
      ]
    },
    navigationChanged: function () {
      if (this.$refs.lmOverlay) {
        this.$refs.lmOverlay.$forceUpdate()
      }
    },
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
  },
  computed: {
    overlayedLandmarks: function () {

    }
  }
}