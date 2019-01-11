<template>
  <div id="app">
    <header-component class = "app-header"/>
    <main id = "main" class = "app-main">
      <main-side
        position = "left"
        :collapse = "sidebarCollapse">
        <template slot = "mainside-main">
          <router-view/>
        </template>
        <template slot = "mainside-side">
          <sidebar-component id="sidebar"/>
        </template>
      </main-side>
    </main>
    <!--<footer-component/>-->
  </div>
</template>

<script>
import HeaderComponent from '@/components/TheHeader'
import SidebarComponent from '@/components/TheSidebar'
// import FooterComponent from '@/components/TheFooter'
import { MainSide } from 'vue-components'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    SidebarComponent,
    MainSide
    // FooterComponent
  },
  computed: {
    sidebarCollapse: function () {
      return this.$store.state.sidebarCollapse
    }
  },
}
</script>

<style>
#app
{
  display:flex;
  flex-direction: column;
}
.app-header
{
  flex: 0 0 58px;
}
.app-main
{
  flex: 1 1 0;
}
#sidebar 
{
  width: 100%;
  height: 100%;
}

#main {
  width: 100%;
}
</style>
