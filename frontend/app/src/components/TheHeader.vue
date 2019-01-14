<template>
  <b-navbar toggleable="md" type="dark" variant="dark">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="#">
      <img id="logo" src="../assets/HBP.png" width="32" height="32" alt="">
      <span>Spatial Registration</span>
      
    </b-navbar-brand>
    
    <!-- sidebar control -->
    <a href = "#" @click = "toggleSidebar">toggle</a>
    <input min = "100" max = "1000" v-model = "sizebarSize" type="range">

    <progress-tracker />

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
import ProgressTracker from '@/views/ProgressTracker'

export default {
  name: 'HeaderComponent',
  components: {
    ProgressTracker
  },
  data() {
    return {
      sizebarSize: 350
    }
  },
  watch: {
    sizebarSize: function (val) {
      this.$store.dispatch('changeSidebarWidth', val)
    }
  },
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
