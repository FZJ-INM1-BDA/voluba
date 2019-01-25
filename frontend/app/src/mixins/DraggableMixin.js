export default {
  data: function () {
    return {
      draggingMixin__transformX: 0,
      draggingMixin__transformY: 0,

      draggingMixin__mousedownX: null,
      draggingMixin__mousedownY: null,
      draggingMixin__mousemoveX: null,
      draggingMixin__mousemoveY: null
    }
  },
  methods: {
    draggingMixin__StartDragging: function (event) {

      this.draggingMixin__mousedownX = event.clientX
      this.draggingMixin__mousedownY = event.clientY

      const mousemoveHandler = event => {
        this.draggingMixin__mousemoveX = event.clientX
        this.draggingMixin__mousemoveY = event.clientY
      }
      
      document.addEventListener('mousemove', mousemoveHandler)
      document.addEventListener('mouseup', () => {

        this.draggingMixin__transformX += this.draggingMixin__mousemoveX - this.draggingMixin__mousedownX
        this.draggingMixin__transformY += this.draggingMixin__mousemoveY - this.draggingMixin__mousedownY

        this.draggingMixin__mousemoveX = null
        this.draggingMixin__mousemoveY = null
        this.draggingMixin__mousedownX = null
        this.draggingMixin__mousedownY = null

        document.removeEventListener('mousemove', mousemoveHandler)
      }, {
        once: true
      })
    }
  },
  computed: {
    draggingMixin__Style: function () {
      if ( this.draggingMixin__mousedownX === null || this.draggingMixin__mousedownY === null || this.draggingMixin__mousemoveX === null || this.draggingMixin__mousemoveY === null) {
        return {
          transform: `translate(${this.draggingMixin__transformX}px, ${this.draggingMixin__transformY}px)`
        }
      } else {
        const deltaX = this.draggingMixin__mousemoveX - this.draggingMixin__mousedownX
        const deltaY = this.draggingMixin__mousemoveY - this.draggingMixin__mousedownY

        return {
          transform: `translate(${this.draggingMixin__transformX + deltaX}px, ${this.draggingMixin__transformY + deltaY}px)`
        }
      }
    }
  }
}