<template>
  <div>
    <h3>
      About VoluBA
    </h3>
    <hr />
    <p>
      Volumetric Brain Anchoring (VoluBA), was formerly known as Landmark-Reg.
    </p>
    <div class="btn-group">
      <span
        @click="openModal({ modalId: 'cookie' })"
        class="btn btn-outline-info">
        Cookies disclaimer
      </span>
      <span
        v-if="serverWarnings && serverWarnings.length > 0"
        @click="showServerWarning"
        class="btn btn-outline-warning">
        Image Server Warning
      </span>
    </div>
    <div>
      Did you encounter an issue? Write us: <a href="mailto:inm1-bda@fz-juelich.de?subject=[VoluBA] Queries">inm1-bda@fz-juelich.de</a>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import { makeHtmlFragmentForWarning } from '@/constants'
export default {
  computed: {
    ...mapState(['serverWarnings'])
  },
  methods: {
    ...mapActions({
      openModal:'openModal',
      modalMessage: 'modalMessage'
    }),
    showServerWarning: function () {
      this.modalMessage({
        variant: 'warning',
        title: 'Image Server Warning',
        htmlBody: makeHtmlFragmentForWarning({ serverWarnings: this.serverWarnings})
      })
    }
  },
}
</script>
<style scoped>

</style>
