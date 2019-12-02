<template>
  <b-modal
    @hidden="onHiddenCleanup"
    centered
    ref="modal"
    :title="title"
    :header-bg-variant="overwriteVariant || defaultVariant"
    header-text-variant="light"
    :hide-footer="!showFooter"
    :ok-only="okOnly">
    {{ message }}
    <div
      v-if="htmlMessage"
      v-html="htmlMessage">
    </div>
  </b-modal>
</template>
<script>
export default {
  data: function () {
    return {
      title: 'Note',
      message: '',
      htmlMessage: null,
      defaultVariant: 'info',
      overwriteVariant: null,
      showFooter: null,
      onhideCb: null,
      okOnly: null
    }
  },
  methods: {
    hide: function () {
      if (this.$refs.modal)
        this.$refs.modal.hide()
    },
    onHiddenCleanup: function () {
      this.overwriteVariant = null
      this.title = 'Node'
      this.message = ''
      this.htmlMessage = null
      this.showFooter = null
      if (this.onhideCb) {
        this.onhideCb()
      }
      if (this.okOnly) {
        this.okOnly = null
      }
      this.onhideCb = null
      this.$emit('hidden')
    }
  },
  mounted: function () {

    this.$store.subscribeAction (({type, payload}) => {
      if (type === 'modalMessage') {
        const modal = this.$refs.modal
        const { title, body, htmlBody, okOnly, variant, showFooter, onHiddenCallback } = payload
        if (variant) {
          this.overwriteVariant = variant
        }
        if (showFooter) {
          this.showFooter = true
        }
        if (onHiddenCallback && onHiddenCallback instanceof Function) {
          this.onhideCb = onHiddenCallback
        }
        if (okOnly) {
          this.okOnly = okOnly
        }
        if (modal) {
          this.title = title
          this.message = body
          this.htmlMessage = htmlBody
          modal.show()
        }
      }
    }) 
  }
}
</script>
<style scoped>

</style>
