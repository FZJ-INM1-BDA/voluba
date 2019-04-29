<template>
  <div>
    <div
      @mousedown="$emit('header-mousedown', $event)"
      class="d-flex flex-row align-items-center card title-container pl-3 bg-light">
      <div class="icon">
        <div
          @click="$emit('close')"
          class="rounded-circle btn btn-sm btn-outline-secondary">
          <font-awesome-icon icon="times"/>
        </div>
      </div>
      <h5 class="title">
        <div>
          Save Result
        </div>
      </h5>
    </div>
    <!-- body -->
    <div class="card card-body body bg-light">
      <div class="d-inline-block btn-group">
        
        <div
          v-b-tooltip.hover.bottom="'Save transform as JSON'"
          @click="downloadXformResult"
          class="btn btn-outline-secondary btn-sm">
          <font-awesome-icon icon="download"/>
        </div>

        <div
          @click="viewInInteractiveViewer"
          v-b-tooltip.hover.bottom="'View the anchoring result in the interactive viewer'"
          class="btn btn-sm btn-outline-secondary">
          <font-awesome-icon icon="brain"></font-awesome-icon>
        </div>
        
        <div
          @click="exportToHBP"
          @mouseenter="showExportToHBPTooltip = true"
          @mouseleave="showExportToHBPTooltip = false"
          ref="exportToHBP"
          class="btn btn-outline-secondary btn-sm disabled">
          <font-awesome-icon icon="file-export"/>
        </div>
      </div>
    </div>


    <b-tooltip
      tabindex="-1"
      placement="bottom"
      :target="() => $refs['exportToHBP']"
      :show="showExportToHBPTooltip">
      Publish on HBP platform <small class="font-italic text-muted">coming soon</small>
    </b-tooltip>
  </div>  
</template>
<script>
import { mapActions } from 'vuex'

export default {
  data: function () {
    return {
      showExportToHBPTooltip: false
    }
  },
  methods: {
    ...mapActions([
      'downloadXformResult',
      'viewInInteractiveViewer'
      ]),
    exportToHBP: function () {
      /**
       * TODO
       * enable export data to HBP curation pipeline
       */
    }
  }
}
</script>
<style scoped>

.title
{
  padding-left: 0.5em;
  padding-right: 1.5em;
  padding-top: 0.5em;
  padding-bottom:0.5em;
  margin-bottom:0;

  transition: linear 150ms all;
}
.title-container
{

  transition: linear 150ms all;
}
.title-container:hover
{
  background-color: rgba(125,125,125,0.15);
  cursor: move;
}

.body
{
  padding: 1em;
}

</style>
