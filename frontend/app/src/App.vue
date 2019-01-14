<template>
  <div id="app">
    <header-component class = "app-header"/>
    <main id = "main" class = "app-main">
      <main-side
        position = "left"
        :sidebarSize = "sidebarWidth"
        :collapse = "sidebarCollapse">
        <template slot = "mainside-main">
          <nehuba-component class = "mainside-main-item" />
          <div v-if = "sidebarCollapse" class = "sidebar-control mainside-main-item">
            <b-button @click.prevent = "expandSidebar" variant="secondary">
              <font-awesome-icon icon = "angle-right"></font-awesome-icon>
            </b-button>
          </div>
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
import NehubaComponent from '@/components/Nehuba'
// import FooterComponent from '@/components/TheFooter'
import { MainSide } from 'vue-components'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    SidebarComponent,
    MainSide,
    NehubaComponent
    // FooterComponent
  },
  computed: {
    sidebarCollapse: function () {
      return this.$store.state.sidebarCollapse
    },
    sidebarWidth: function () {
      return this.$store.state.sidebarWidth
    },
  },
  methods: {
    expandSidebar: function () {
      this.$store.dispatch('setSidebarCollapseState', false)
    }
  }
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
  overflow:hidden;
  flex: 1 1 0;
}
#sidebar 
{
  width: 100%;
  height: 100%;
}

.mainside-main-item.sidebar-control
{
  margin-top: -7em;
  margin-left: 1em;
  z-index: 5;
}

.mainside-main-item
{
  position: relative;
  z-index: 4;
}

#main {
  width: 100%;
}
</style>
