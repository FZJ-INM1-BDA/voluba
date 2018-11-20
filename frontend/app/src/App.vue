<template>
  <div id="app">
    <header-component/>
    <div class="row">
      <sidebar-component class="col-sm-2"/>
      <main class="col-sm-10">
        <router-view/>
      </main>
    </div>
    <footer-component/>
  </div>
</template>

<script>
import HeaderComponent from '@/components/TheHeader'
import SidebarComponent from '@/components/TheSidebar'
// import FooterComponent from '@/components/TheFooter'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    SidebarComponent
    // FooterComponent
  }
}
</script>

<style>
</style>
