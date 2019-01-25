<template>
  <div id="app">

    <!-- header -->
    <header-component class = "app-header"/>

    <main class="app-main">

      <!-- main container -->
      <div class="underlay">
        <nehuba-component
          @ready = "mainNehubaReady"
          ref = "templatenehuba" />
        <SimpleNehubaComponent
          :config = "simpleNehubaConfig"
          ref = "incomingnehuba"
          v-show = "showSimpleNehuba" />
      </div>

      <!-- floating layer -->
      <div class = "overlay">
        <router-view />
      </div>
    </main>
    <!--<footer-component/>-->
  </div>
</template>

<script>
import HeaderComponent from '@/components/TheHeader'
import SidebarComponent from '@/components/TheSidebar'
import NehubaComponent from '@/components/Nehuba'
import SimpleNehubaComponent from '@/components/SimpleNehuba'
// import FooterComponent from '@/components/TheFooter'
import { MainSide } from 'vue-components'
import { getDefaultNehubaConfigLight } from '@/components/constants'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    SidebarComponent,
    MainSide,
    NehubaComponent,
    SimpleNehubaComponent
    // FooterComponent
  },
  data: function () {
    return {
      showSecondNehuba: false,
      primaryNehubaReady: false
    }
  },
  computed: {
    showSplashScreen: function () {
      const obj = this.$router.options.routes.find(r => r.path === this.$route.path)
      return !(obj && obj.shown)
    },
    sidebarWidth: function () {
      return this.$store.state.sidebarWidth
    },
    simpleNehubaConfig: function () {
      const idx = this.$store.state.selectedIncomingVolumeIndex

      return idx !== null && idx >= 0
        ? getDefaultNehubaConfigLight(this.$store.state.incomingVolumes[idx].value)
        : null
    },
    showSimpleNehuba: function () {
      return this.showSecondNehuba && this.primaryNehubaReady && !this.previewMode
    }
  },
  methods: {
    expandSidebar: function () {
      this.$store.dispatch('setSidebarCollapseState', false)
    },
    mainNehubaReady: function () {
      this.primaryNehubaReady = true
    },
    exitPreviewMode: function () {
      this.$store.dispatch('enablePreviewMode', false)
    }
  },
  watch: {
    showSimpleNehuba: function () {
      this.$store.dispatch('redrawNehuba')
    },
    $route (to, from) {
      this.showSecondNehuba = to.path === '/step2'
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
  position:relative;
}

.mainside-main-item.sidebar-control
{
  margin-top: -5em;
  margin-left: 1em;
  z-index: 5;
  /* width: 0;
  height: 100%;
  display: flex;
  flex-direction: column-reverse; */
}

.underlay
{
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.overlay
{
  position:absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.nehuba-container
{
  display: flex;
  flex-direction: row;
  height: 100%;
}

.nehuba-container > *
{
  flex: 1 1 0;
}

#main {
  width: 100%;
}
</style>
