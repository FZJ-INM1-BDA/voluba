<template>
  <div>
    <h3>
      About VoluBA
    </h3>
    <hr />
    <p>
      Volumetric Brain Anchoring (VoluBA), was formerly known as Landmark-Reg.
    </p>
    <div>
      <span
        @click="openModal({ modalId: 'cookie' })"
        class="btn btn-outline-info">
        our cookie disclaimer
      </span>
    </div>
    Did you encounter an issue? Write us: <a href="mailto:inm1-bda@fz-juelich.de?subject=[VoluBA] Queries">inm1-bda@fz-juelich.de</a>
  </div>
</template>
<script>
import { mapActions } from 'vuex'
export default {
  methods: {
    ...mapActions({
      openModal:'openModal'
    })
  },
}
</script>
<style scoped>

</style>
