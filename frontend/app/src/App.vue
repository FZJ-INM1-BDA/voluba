<template>
  <div id="app">
    <header-component class = "app-header"/>
    <main id = "main" class = "app-main">
      <main-side
        position = "left"
        :sidebarSize = "sidebarWidth"
        :collapse = "sidebarCollapse">
        <template slot = "mainside-main">
          <div class="mainside-main-item nehuba-container">
            <nehuba-component
              @ready = "mainNehubaReady"
              ref = "templatenehuba" />
            <SimpleNehubaComponent
              :config = "simpleNehubaConfig"
              ref = "incomingnehuba"
              v-show = "showSimpleNehuba" />
          </div>
          <div v-if = "sidebarCollapse" class = "sidebar-control mainside-main-item">
            <b-button @click.prevent = "expandSidebar" variant="secondary">
              <font-awesome-icon icon = "angle-right" />
            </b-button>
            <b-button @click.prevent = "exitPreviewMode" variant = "secondary">
              <font-awesome-icon icon = "times-circle" />
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
    sidebarCollapse: function () {
      return this.$store.state.sidebarCollapse
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
      return this.showSecondNehuba && this.primaryNehubaReady && !this.$store.state.previewMode
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
}
#sidebar
{
  width: 100%;
  height: 100%;
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

.mainside-main-item.sidebar-control > *
{
  /* flex: 0 0 0; */
}

.mainside-main-item
{
  position: relative;
  z-index: 4;
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
