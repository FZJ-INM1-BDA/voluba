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

      <!-- load -->
      <div class="input-group input-group-sm">
        <div class="input-group-prepend">
          <span class="input-group-text">
            Load
          </span>
        </div>
        <div class="input-group-append">
          <div
            @click="loadXformJson"
            v-b-tooltip.hover.bottom="'Load JSON Transformation'"
            class="btn btn-outline-secondary btn-sm">
            <font-awesome-icon icon="folder-open"></font-awesome-icon>
          </div>
        </div>
      </div>

      <!-- save -->
      <div class="mt-2 input-group input-group-sm">
        <div class="input-group-prepend">
          <span class="input-group-text">
            Save
          </span>
        </div>
        <div class="input-group-append">
          <div
            v-b-tooltip.hover.bottom="'Save transform as JSON'"
            @click="downloadXformResult"
            class="btn btn-outline-secondary btn-sm">
            <font-awesome-icon icon="download"/>
          </div>

          <div
            v-b-modal.multiselect-volume
            v-b-tooltip.hover.bottom="'View the anchoring result in the interactive viewer'"
            class="btn btn-sm btn-outline-secondary">
            <font-awesome-icon icon="brain"></font-awesome-icon>
          </div>

          <div
            @click="openNeuroglancer"
            v-b-tooltip.hover.bottom="'Open in the neuroglancer'"
            class="btn btn-sm btn-outline-secondary">
            <font-awesome-icon icon="table"></font-awesome-icon>
          </div>

          <div
            @click="handleSaveInCollab"
            ref="saveInCollab"
            :class="'btn btn-outline-secondary btn-sm' + ((isHbpOidcV2 && resumeWorkflow) ? '' : ' disabled')"
            @mouseenter="showSaveOnCollab = true"
            @mouseleave="showSaveOnCollab = false">
            <font-awesome-icon icon="hdd" />
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
    </div>

    <b-tooltip
      tabindex="-1"
      placement="bottom"
      :target="() => $refs['saveInCollab']"
      :show="showSaveOnCollab">
      <span class="d-block">
        {{ exportToCollabTooltipText }}
      </span>
      <small v-if="!resumeWorkflow" class="font-italic text-muted">coming soon</small>
    </b-tooltip>

    <b-tooltip
      tabindex="-1"
      placement="bottom"
      :target="() => $refs['exportToHBP']"
      :show="showExportToHBPTooltip">
      <span class="d-block">
        Publish on HBP platform
      </span>
      <small class="font-italic text-muted">coming soon</small>
    </b-tooltip>

    <b-modal id="multiselect-volume"
      @ok.prevent="showTransformResult"
      :ok-disabled="showTransformResultInProgress">
      <template slot="modal-header">
        Select the volumes you would like to visualise
      </template>

      <template slot="modal-ok">
        <div>
          <span>
            View Overlay
          </span>
          <font-awesome-icon v-if="!showTransformResultInProgress" icon="external-link-alt" />
          <div v-if="showTransformResultInProgress" class="d-inline-block spinnerAnimationCircle"></div>
        </div>
      </template>

      <MultiselectVolume ref="multiSelectVolume" />

    </b-modal>
  </div>  
</template>
<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { openFileDialog } from '@/constants'
import MultiselectVolume from '@/views/MultiselectVolume'

export default {
  components: {
    MultiselectVolume
  },
  data: function () {
    return {
      showExportToHBPTooltip: false,
      showSaveOnCollab: false,
      showTransformResultInProgress: false
    }
  },
  computed: {
    ...mapState('authStore', [
      'user',
    ]),
    ...mapState({
      resumeWorkflow: state => state && state.experimentalFeatures && state.experimentalFeatures.resumeWorkflow,
    }),
    ...mapGetters('authStore', [
      'isHbpOidcV2'
    ]),
    exportToCollabTooltipText: function () {
      return this.isHbpOidcV2
        ? `Save progress to drive.ebrains.eu`  
        : `You must be logged in with iam.ebrains.eu to save to drive.ebrains.eu`
    },
  },
  methods: {
    ...mapActions([
      'downloadXformResult',
      'viewInSiibraExplorer',
      'viewInNeuroglancer',
      'loadXformJsonFile',
      `modalMessage`
      ]),
    openNeuroglancer() {
      this.viewInNeuroglancer()
    },
    showTransformResult(){
      const { bundledVolume, xformMap } = this.$refs['multiSelectVolume']
      const volumesWithXform = bundledVolume
        .map(({ id, ...rest }) => {
          return {
            id,
            ...rest,
            xforms: xformMap.get(id) || []
          }
        })
      
      this.viewInSiibraExplorer(volumesWithXform)
    },
    exportToHBP: function () {
      /**
       * TODO
       * enable export data to HBP curation pipeline
       */
    },
    handleSaveInCollab: function () {
      if (!this.isHbpOidcV2 || !this.resumeWorkflow) return
      const state = this.$store.state
      // eslint-disable-next-line
      const { authStore, ...rest } = state
      fetch(`user/workflow/`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(rest)
      })
        .then(id => {
          this.modalMessage({
            title: `Saving to Collab.drive successful!`,
            variant: 'success',
            body: `Saved as ${id}`
          })
        })
        .catch(e => {
          this.modalMessage({
            title: `Error`,
            variant: `danger`,
            body: e
          })
        })
    },
    loadXformJson: function () {
      openFileDialog('file', 'application/json', null, (content) => {
        try {
          const json = JSON.parse(content)
          this.loadXformJsonFile({ json })
        }catch(e) {
          this.modalMessage({
            title: `Loading JSON file error!`,
            variant: `danger`,
            body: `loading JSON file error, ${e.toString()}`
          })
        }
      })
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
