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

        <!-- authenticated -->
        <b-nav-item-dropdown
          :text="welcomeUsername"
          v-if="user"
          right>
          <b-dropdown-item href="logout">
            Logout
          </b-dropdown-item>
        </b-nav-item-dropdown>

        <!-- unauthenticated -->
        <b-nav-item-dropdown
          text="Login"
          v-if="!user"
          right>

          <SigningComponent />

          <!-- <b-dropdown-item
            :href="loginM.href"
            :key="idx"
            v-for="(loginM, idx) in loginMethods">
            {{ loginM.name }}
          </b-dropdown-item> -->

        </b-nav-item-dropdown>
        <b-nav-item href="#"><font-awesome-icon icon="question-circle"/></b-nav-item>
      </b-navbar-nav>
    </b-collapse>

  </b-navbar>
</template>

<script>
import ProgressTracker from '@/components/layout/ProgressTracker'
import SigningComponent from '@/components/SigninComponent'
import axios from 'axios'
import { mapState } from 'vuex'

export default {
  name: 'HeaderComponent',
  data: function () {
    return {
      getUserPromise: axios.get('user') 
    }
  },
  components: {
    ProgressTracker,
    SigningComponent
  },
  mounted() {
    this.getUserPromise
      .then(({ data }) => {
        console.log('auth successful', { data })
        this.$store.commit('setUser', { user: data })
      })
      .catch(e => {
        console.log('error', {e})
        this.$store.commit('setUser', { user: null })
      })
  },
  computed: {
    ...mapState({
      user: 'user'
    }),
    welcomeUsername: function () {
      return `Logged in as ${this.user.name}`
    },
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
