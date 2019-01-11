<template>
  <b-navbar toggleable="md" type="dark" variant="dark">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="#">
      <img id="logo" src="../assets/HBP.png" width="32" height="32" alt="">
      <span>Spatial Registration</span>
      <a href = "#" @click = "toggleSidebar">toggle</a>
    </b-navbar-brand>

    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item :active = "index === computedActiveStepIndex" @click = "gotoStep(index)" :key = "step" v-for = "(step, index) in computedSteps">
          <strong>Step {{index + 1}}</strong>
          <p class="description">
            {{ step }}
          </p>
        </b-nav-item>
      </b-navbar-nav>

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
export default {
  name: 'HeaderComponent',
  computed: {
    computedSteps: function () {
      return this.$store.state.steps
    },
    computedActiveStepIndex: function () {
      return this.$store.state.activeStepIndex
    },
    sidebarCollapse: function () {
      return this.$store.state.sidebarCollapse
    }
  },
  methods:{
    gotoStep (stepIndex) {
      this.$store.dispatch('selectStep', stepIndex)
    },
    toggleSidebar () {
      this.$store.dispatch('toggleSidebar')
    }
  }
}
</script>

<style scoped>
  #logo {
    margin-right: 5px;
  }
  .description {
    font-size: 12px;
    margin-bottom: 0px;
  }
</style>
