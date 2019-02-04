<template>
  <b-navbar id = "nav" toggleable="md" type="dark" variant="dark">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="#">
      <img id="logo" src="../assets/HBP.png" width="32" height="32" alt="">
      <span>Spatial Registration</span>
    </b-navbar-brand>

    <progress-tracker v-if = "showProgressTracker" />

    <b-collapse is-nav id="nav_collapse">

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown text="Login" right>
          <b-dropdown-item href="#">Register</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item href="#"><font-awesome-icon icon="question-circle"/></b-nav-item>
      </b-navbar-nav>
    </b-collapse>

  </b-navbar>
</template>

<script>
import ProgressTracker from '@/components/ProgressTracker'

export default {
  name: 'HeaderComponent',
  components: {
    ProgressTracker
  },
  computed: {
    showProgressTracker: function () {
      const obj = this.$router.options.routes.find(r => r.path === this.$route.path)
      return obj && obj.shown
    }
  }
}
</script>

<style scoped>
#nav
{
  z-index: 1060;
}
  #logo {
    margin-right: 5px;
  }
  .description {
    font-size: 12px;
    margin-bottom: 0px;
  }
</style>
