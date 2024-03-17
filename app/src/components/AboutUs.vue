<template>
  <div>
    <h3>
      About voluba
    </h3>
    <hr />
    <p>
      Volumetric Brain Anchoring (voluba), was formerly known as Landmark-Reg.
    </p>
    <div class="row">

      <!-- repo -->
      <a v-if="false" :href="repoUrl" target="_blank" class="m-2 p-2 col-sm d-flex flex-column align-items-center justify-content-center btn btn-secondary">
        <font-awesome-icon size="2x" :icon="['fab', 'github']"/>
        <small>
          github
        </small>
      </a>

      <!-- user doc -->
      <a :href="docUrl" target="_blank" class="m-2 p-2 col-sm d-flex flex-column align-items-center justify-content-center btn btn-secondary">
        <font-awesome-icon size="2x" icon="book"/>
        <small>
          user documentation
        </small>
      </a>
    </div>
    <div class="row">

      <!-- cookie -->
      <div class="m-2 p-2 col-sm d-flex flex-column align-items-center justify-content-center btn btn-secondary"
        @click="openModal({ modalId: 'cookie' })">
        <font-awesome-icon size="2x" icon="cookie-bite"/>
        <small>
          cookies disclaimer
        </small>
      </div>


      <!-- email -->
      <a :href="emailUrl" class="m-2 p-2 col-sm d-flex flex-column align-items-center justify-content-center btn btn-secondary">
        <font-awesome-icon size="2x" :icon="['far', 'envelope']"/>
        <small>
          {{ EMAIL_CONTACT }}
        </small>
      </a>
    </div>
    
  </div>
</template>
<script>
import { mapActions } from 'vuex'
import { EMAIL_CONTACT } from '@/constants'
export default {
  methods: {
    ...mapActions({
      openModal:'openModal'
    })
  },
  data(){
    return {
      docUrl: `https://voluba.readthedocs.io/en/latest/`,
      EMAIL_CONTACT: EMAIL_CONTACT,
      emailUrl: `mailto:${EMAIL_CONTACT}?subject=[voluba] Queries`,
      repoUrl: 'https://github.com/fzj-inm1-bda/voluba'
    }
  },
}
</script>
<style scoped>

</style>
