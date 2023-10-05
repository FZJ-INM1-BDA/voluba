import { mapActions } from "vuex";
import { determineElement } from '@/constants'

const DragLandmarkMixin = {
  data: function () {
    return {
      dragLandmark__draggedLmId : null,
      dragLandmark__draggedPanelIdx : null,
      dragLandmark__volume: null,
      dragLandmark__quat: null,
      dragLandmark__idxToViewportElementMap: null
    }
  },
  methods: {
    ...mapActions('landmarksStore',[
      'translateLandmarkPosBy'
    ]),
    dragLandmark__handleMousedownOnIcon: function ({lmId, panelIdx, volume, transform, ...rest}) {
      const { mat4, quat } = window.export_nehuba

      this.dragLandmark__draggedLmId = lmId
      this.dragLandmark__draggedPanelIdx = panelIdx
      this.dragLandmark__volume = volume
      if (transform) {
        const xform = mat4.fromValues(...transform)
        const q = mat4.getRotation(quat.create(), xform)
        quat.invert(q, q)
        this.dragLandmark__quat = Array.from(q)
      }
      document.addEventListener('mousemove', this.dragLandmark__handleMousemove, true)
      document.addEventListener('mouseup', this.dragLandmark__handleMouseup, {capture: true, once: true})
    },
    dragLandmark__handleMousemove: function (event) {
      const {
        dragLandmark__sliceView
      } = this
      if (!dragLandmark__sliceView) return
      
      if (!('export_nehuba' in window)) return

      const deltaX = event.movementX
      const deltaY = event.movementY
      const { vec3, quat } = window.export_nehuba

      const pos = vec3.fromValues(deltaX, deltaY, 0)

      /**
       * translate move in 2D to move in 3D
       */
      vec3.transformMat4(pos, pos, dragLandmark__sliceView.invViewMatrix)

      /**
       * account for navigation movement
       */
      vec3.sub(pos, pos, dragLandmark__sliceView.centerDataPosition)

      /**
       * account for rotation (if defined)
       */
      if (this.dragLandmark__quat) {
        vec3.transformQuat(pos, pos, quat.fromValues(...this.dragLandmark__quat))
      }
      this.translateLandmarkPosBy({
        volume: this.dragLandmark__volume,
        id: this.dragLandmark__draggedLmId,
        value: pos
      })
    },
    dragLandmark__handleMouseup: function (event) {
      this.dragLandmark__draggedLmId = null
      this.dragLandmark__draggedPanelIdx = null
      this.dragLandmark__volume = null
      this.dragLandmark__quat = null
      document.removeEventListener('mousemove', this.dragLandmark__handleMousemove, true)
    }
  },
  computed: {
    dragLandmark__sliceView: function () {
      /**
       * TODO reimplement nehubaBase__viewportToDatas is no longer defined
       */
      const {
        dragLandmark__draggedLmId,
        dragLandmark__draggedPanelIdx,
        dragLandmark__idxToViewportElementMap,
        nehubaBase__elementToSliceViewWeakMap
      } = this
      if (dragLandmark__draggedLmId === null) return null
      if (dragLandmark__draggedPanelIdx === null) return null
      if (!dragLandmark__idxToViewportElementMap) return null
      const el = dragLandmark__idxToViewportElementMap.get(this.dragLandmark__draggedPanelIdx)
      if (!el) return null
      const sliceView = nehubaBase__elementToSliceViewWeakMap.get(el)
      return sliceView
    }
  },
  watch: {
    viewportElements: function(val) {
      
      if (
        this.dragLandmark__idxToViewportElementMap &&
        Array.from(this.dragLandmark__idxToViewportElementMap.values()).every(el => val.has(el))
      ) {
        return
      }
      this.dragLandmark__idxToViewportElementMap = null

      const newMap = new Map()
      for (const el of Array.from(val)) {
        const idx = determineElement(el)
        newMap.set(idx, el)
      }
      if (newMap.size !== 3) {
        console.warn(`drag landmark mixing, cache size !== 3, but equal to: ${newMap.size}. Aborting ...`)
        return
      }
      this.dragLandmark__idxToViewportElementMap = newMap
    }
  }
}

export default DragLandmarkMixin