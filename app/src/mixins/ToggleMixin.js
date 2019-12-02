export default {
  props: {
    toggleMixin__tooltip: {
      type: String,
      default: null
    },
    toggleMixin__initOpen: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      toggleMixin__open: this.initOpen
    }
  },
  methods: {
    toggleMixin__toggle: function () {
      this.toggleMixin__open = !this.toggleMixin__open
    }
  },
}