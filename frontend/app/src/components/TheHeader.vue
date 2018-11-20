<template>
  <nav class="navbar navbar-expand-sm bg-dark navbar-dark">
    <ul class="navbar-nav">
      <li class="nav-item active">
        <router-link
            class="navbar-brand"
            active-class="active"
            exact
            :to="{ name: 'Home' }">Landmark-Reg
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'HeaderComponent'
}
</script>

<style scoped>
</style>
