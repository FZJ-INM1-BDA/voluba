<template>
  <div id = "sidebar">
    <!-- step 1 -->
    <data-selection-tool-bar v-if = "activeStepIndex === 0">
    </data-selection-tool-bar>

    <!-- step 2 -->
    <landmark-pairs-tool-bar v-if = "activeStepIndex === 1">
    </landmark-pairs-tool-bar>
    
    <!-- step 3 -->
    <SaveExportToolBar v-if = "activeStepIndex === 2">
    </SaveExportToolBar>
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
    }
  },
  methods: {
    alignReference: function (event) {
      this.$store.dispatch('alignReference')
    },
    alignIncoming: function (event) {
      this.$store.dispatch('alignIncoming')
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
