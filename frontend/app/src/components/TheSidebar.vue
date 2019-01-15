<template>
  <div id = "sidebar">
    <router-view class = "sidebar-container" />

    <!-- sidebar conrol -->
    <div @click = "collapseSidebar" class="sidebar-control">
      <div class="sidebar-control-content">
        <font-awesome-icon icon = "angle-left" ></font-awesome-icon>
        {{ controlText }}
      </div>
    </div>
  </div>
</template>

<script>
import CardComponent from '@/components/Card'
import DataSelectionToolBar from '@/components/toolbars/DataSelection'
import LandmarkPairsToolBar from '@/components/toolbars/LandmarkPairs'
import SaveExportToolBar from '@/components/toolbars/SaveExport'
export default {
  name: 'SidebarComponent',
  data () {
    return {
    }
  },
  computed: {
    activeStepIndex: function () {
      return this.$store.state.activeStepIndex
    },
    activeStepName: function () {
      return this.$store.state.steps[this.$store.state.activeStepIndex]
    },
    controlText: function () {
      return this.$store.state.sidebarCollapse
        ? ''
        : 'Collapse'
    }
  },
  methods: {
    alignReference: function (event) {
      this.$store.dispatch('alignReference')
    },
    alignIncoming: function (event) {
      this.$store.dispatch('alignIncoming')
    },
    collapseSidebar: function () {
      this.$store.dispatch('setSidebarCollapseState', true)
    }
  },
  watch: {
  },
  filters: {
  },
  components: {
    CardComponent,
    DataSelectionToolBar,
    LandmarkPairsToolBar,
    SaveExportToolBar
  }
}
</script>

<style scoped>
#sidebar {
  background-color: lightgray;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-container
{
  flex: 1 1 0px;
  overflow-x: hidden;
  overflow-y: auto;
}

.sidebar-control
{
  flex: 0 0 3em;
  padding-left: 1em;
  background-color: rgba(255, 255, 255, 0.8);
  display:flex;
  align-items: center;
}

.sidebar-control:hover
{
  cursor:pointer;
  background-color: rgba(255, 255, 255, 0.95);
}

select, select option {
  min-width: 100%;
  max-width: 100%;
}

.slider {
  min-width: 100%;
  max-width: 100%;
}

#inputRMSE, #inputDeterminant  {
  max-width: 100%;
}

.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
  display: none;
}
</style>
