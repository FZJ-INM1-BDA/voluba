const DragLandmarkMixin = {
  data: function () {
    return {
      dragLandmark__draggedLmId : null,
      dragLandmark__draggedPanelIdx : null,
      dragLandmark__volume: null
    }
  },
  methods: {
    dragLandmark__handleMousedownOnIcon: function ({lmId, panelIdx, volume, ...rest}) {
      debugger
      this.dragLandmark__draggedLmId = lmId
      this.dragLandmark__draggedPanelIdx = panelIdx
      this.dragLandmark__volume = volume

      document.addEventListener('mousemove', this.dragLandmark__handleMousemove, true)
      document.addEventListener('mouseup', this.dragLandmark__handleMouseup, {capture: true, once: true})
    },
    dragLandmark__handleMousemove: function (event) {
      if (!this.dragLandmark__isDraggingLandmark)
        return
      
      if (!('export_nehuba' in window))
        return

      const deltaX = event.movementX
      const deltaY = event.movementY
      const { vec3 } = window.export_nehuba

      const pos = vec3.fromValues(deltaX, deltaY, 0)

      /**
       * translate move in 2D to move in 3D
       */
      vec3.transformMat4(pos, pos, this.nehubaBase__viewportToDatas[this.dragLandmark__draggedPanelIdx])

      /**
       * account for navigation movement
       */
      vec3.subtract(pos, pos, this.dragLandmark__viewerNavigationPos)
      
      this.$store.dispatch('translateLandmarkPosBy', {
        volume: this.dragLandmark__volume,
        id: this.dragLandmark__draggedLmId,
        value: Array.from(pos).map(v => v / 1e6) // in mm
      })
    },
    dragLandmark__handleMouseup: function (event) {
      this.dragLandmark__draggedLmId = null
      this.dragLandmark__draggedPanelIdx = null
      this.dragLandmark__volume = null
      document.removeEventListener('mousemove', this.dragLandmark__handleMousemove, true)
    }
  },
  computed: {
    dragLandmark__viewerNavigationPos: function () {
      return this.nehubaBase__navigationPosition
        ? this.nehubaBase__navigationPosition
        : [0, 0, 0]
    },
    dragLandmark__isDraggingLandmark: function () {
      return this.dragLandmark__draggedLmId !== null
        && this.dragLandmark__draggedPanelIdx !== null
        && this.nehubaBase__viewportToDatas
        && this.nehubaBase__viewportToDatas[this.dragLandmark__draggedPanelIdx]
    }
  }
}

export default DragLandmarkMixin