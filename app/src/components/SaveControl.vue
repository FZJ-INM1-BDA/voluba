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
          Use Result
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
          <form
            v-b-tooltip.hover.bottom="downloadNiftiTooltipText"
            :action="downloadNiftiWithXformUrl"
            method="POST"
            enctype="multipart/form-data"
            target="_blank">
            <input type="hidden" name="json" :value="stringifiedTransformMatrixInNm">
            <input type="hidden" name="auth" :value="authHeader['Authorization']">
            <button type="submit"
              :disabled="!niftiCanBeDownloaded"
              class="btn btn-outline-secondary btn-sm">
              <font-awesome-icon icon="file-archive" />
            </button>
          </form>
          
          <div
            v-b-tooltip.hover.bottom="'Save transform as JSON'"
            @click="downloadXformResult"
            class="btn btn-outline-secondary btn-sm">
            <font-awesome-icon icon="download"/>
          </div>

          <div
            v-b-modal.multiselect-volume
            v-b-tooltip.hover.bottom="'View the anchoring result in siibra explorer'"
            class="btn btn-sm btn-outline-secondary">
            <font-awesome-icon icon="brain"></font-awesome-icon>
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
            v-b-modal.export-ebrains-workflow="isHbpOidcV2"
            @mouseenter="showExportToHBPTooltip = true"
            @mouseleave="showExportToHBPTooltip = false"
            ref="exportToHBP"
            :class="'btn btn-outline-secondary btn-sm' + (isHbpOidcV2 ? '' : ' disabled')">
            <font-awesome-icon icon="file-export"/>
          </div>
        </div>
      </div>

        <!-- share -->
        <div class="mt-2 input-group input-group-sm">
          <div class="input-group-prepend">
            <span class="input-group-text">
              Share
            </span>
          </div>
          <div class="input-group-append">
            <div v-b-modal.share-volume v-b-tooltip.hover.bottom="'Share private volume'"
              :class="'btn btn-outline-secondary btn-sm' + ((selectedIncomingVolume.visibility === 'private') ? '' : ' disabled')">
              <font-awesome-icon icon="share-alt"></font-awesome-icon>
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
        Publish transformation on HBP platform
      </span>
      <small v-if="!isHbpOidcV2" class="font-italic text-muted">You must sign in via ebrains IAM to use this functionality.</small>
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

    <b-modal id="share-volume" 
      @ok="handleShareOk"
      :ok-disabled="volumeSharing">
      <template slot="modal-header">
        Share volume
      </template>

      <div>
        <p>Create a shared link for the private volume.</p> 

        <InfoPopover class="text-warning"
          placement="right" triggers="click blur">

          <div class="text-left mb-1 mt-1">
            <small class="d-inline-block lh-1">
              <p> <font-awesome-icon icon="exclamation-triangle" class="mr-2" /> After sharing, the image will be publicly available!</p>
              <p> <font-awesome-icon icon="exclamation-triangle" class="mr-2" /> Sharing cannot be undone!</p>
            </small>
          </div>

        </InfoPopover>
      </div>

      <div v-if="sharedVolumeUrl">
        Public URL: 
        <a :href="sharedVolumeUrl" target="_blank"><i>{{ sharedVolumeUrl }}</i></a>
      </div>

      <template slot="modal-ok">     
        <div>
          <span>
            {{sharedVolumeUrl? 'Close' : 'Share'}}
          </span>

          <div v-if="volumeSharing" class="d-inline-block spinnerAnimationCircle"></div>
        </div>
      </template>

    </b-modal>

    <!-- ebrains workflow export modal -->
    <b-modal id="export-ebrains-workflow"
      :hide-footer="true">
      <template slot="modal-header">
        Export transform result to ebrains workflow
      </template>
      <ExportsErains></ExportsErains>
    </b-modal>
  </div>
</template>
<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import { openFileDialog, getTransformMatrixInNm } from '@/constants'
import ExportsErains from "@/components/exports/ExportsEbrains"
import MultiselectVolume from '@/views/MultiselectVolume'
import axios from 'axios'

export default {
  components: {
    MultiselectVolume,
    ExportsErains,
  },
  data: function () {
    return {
      showExportToHBPTooltip: false,
      showSaveOnCollab: false,
      showTransformResultInProgress: false,
      volumeSharing: false,
      sharedVolumeUrl: null,
      isHbpOidcV2: true
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
      'isHbpOidcV2',
      'authHeader'
    ]),
    ...mapState('nehubaStore', {
      stringifiedTransformMatrixInNm: state => {
        return JSON.stringify({
          transformMatrixInNm: getTransformMatrixInNm(state.incTransformMatrix) || {}
        })
      }
    }),
    ...mapGetters('dataSelectionStore', [
      'selectedIncomingVolume'
    ]),
    ...mapState('dataSelectionStore', [
      'uploadUrl'
    ]),
    exportToCollabTooltipText: function () {
      return this.isHbpOidcV2
        ? `Save progress to drive.ebrains.eu`  
        : `You must be logged in with iam.ebrains.eu to save to drive.ebrains.eu`
    },
    downloadNiftiTooltipText: function () {
      return this.niftiCanBeDownloaded ? 'download volumes with updated transform' : 'only private volumes can be downloaded'
    },
    niftiCanBeDownloaded: function () {
      return this.selectedIncomingVolume && this.selectedIncomingVolume.visibility === 'private'
    },
    downloadNiftiWithXformUrl: function () {
      const incomingVolName = this.selectedIncomingVolume && this.selectedIncomingVolume.name
      return incomingVolName && `${this.uploadUrl}/export/${incomingVolName}.nii.gz`
    }
  },
  methods: {
    ...mapActions([
      'downloadXformResult',
      'viewInSiibraExplorer',
      'loadXformJsonFile',
      `modalMessage`
      ]),
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
    exportToHBP: async function () {
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
    },
    handleShareOk: function(event) {
      if (!this.sharedVolumeUrl) {
        event.preventDefault()
        this.shareVolume()
      }
    },
    shareVolume: function() {
      this.volumeSharing = true
      this.shareVolumeToServer(this.selectedIncomingVolume.name)
    }, 
    shareVolumeToServer: function(fileName) {
      axios(`${process.env.VUE_APP_UPLOAD_URL}/share/${fileName}`, {
        method: `GET`,
        headers: { ...this.authHeader }
      }).then(({ data }) => {
          this.volumeSharing = false
          this.sharedVolumeUrl = `${process.env.VUE_APP_UPLOAD_URL}${data}`
        })
        .catch(e => {
          this.volumeSharing = false
          return this.modalMessage({
            title: 'Error',
            variant: 'danger',
            body: `Error resuming workflow: ${e.toString()}`
          })
        })
    },
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
