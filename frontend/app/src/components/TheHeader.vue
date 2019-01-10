<template>
  <b-navbar toggleable="md" type="dark" variant="dark">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="#">
      <img id="logo" src="../assets/HBP.png" width="32" height="32" alt="">
      <span>Spatial Registration</span>
    </b-navbar-brand>


    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav style="margin-left: 300px;">
        <b-nav-item href="#" active>
          <strong>Step 1</strong>
          <p class="description">Data Selection & 3D-Anchoring</p>
        </b-nav-item>
        <b-nav-item href="" disabled style="margin-top: 12px;"><font-awesome-icon icon="angle-double-right"/></b-nav-item>
        <b-nav-item href="#">
          <strong>Step 2</strong>
          <p class="description">Entering Landmark-Pairs</p>
        </b-nav-item>
        <b-nav-item href="" disabled style="margin-top: 12px;"><font-awesome-icon icon="angle-double-right"/></b-nav-item>
        <b-nav-item href="#">
          <strong>Step 3</strong>
          <p class="description">Save & Export Results</p>
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
  name: 'HeaderComponent'
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
