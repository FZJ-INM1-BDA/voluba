<template>
  <footer class="footer fixed-bottom">
    <div class="container-fluid">
      <router-link class="logo-font"
                   :to="{ name: 'Home' }">
        Landmark-Reg
      </router-link>
      <span class="attribution">
        | Copyright &copy; {{ current_year }}
      </span>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent',
  data () {
    return {
      current_year: (new Date()).getFullYear()
    }
  }
}
</script>

<style scoped>
  footer {
    text-align: center;
  }
  a {
    text-decoration: none;
    color: black;
  }
</style>
