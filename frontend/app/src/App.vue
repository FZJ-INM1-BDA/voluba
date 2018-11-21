<template>
  <div id="app">
    <header-component/>
    <sidebar-component id="sidebar"/>
    <main id="main">
      <router-view/>
    </main>
    <!--<footer-component/>-->
  </div>
</template>

<script>
import HeaderComponent from '@/components/TheHeader'
import SidebarComponent from '@/components/TheSidebar'
import NehubaCommponent from '@/components/Nehuba'
// import FooterComponent from '@/components/TheFooter'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    NehubaCommponent,
    SidebarComponent
    // FooterComponent
  }
}
</script>

<style>
#sidebar {
  position: absolute;
  left:0; top:56px; right:0; bottom:0;
  width:340px;
}

#main {
  position: absolute;
  left:340px; top:56px; right:0; bottom:0;
}
</style>
