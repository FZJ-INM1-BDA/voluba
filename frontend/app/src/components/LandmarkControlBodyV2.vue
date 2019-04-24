<template>
  <div class="bg-light">

    <!-- header -->
    <div
      class="card title-container pl-3"
      @mousedown="$emit('header-mousedown', $event)">
      <div class="close-icon">
        <div
          @click="$emit('close')"
          class="rounded-circle btn btn-sm btn-outline-secondary">
          <font-awesome-icon icon="times-circle"></font-awesome-icon>
        </div>
      </div>
      <h5 class="title">
        <div>
          {{ editLandmarksTitle }}
        </div>
      </h5>
    </div>

    <!-- TODO: sanitize to prevent XSS? SQL injection? -->
    <!-- primary landmarks -->
    <div class="body bg-light">

      <!-- top label -->
      <div
        v-if="false"
        class="lm-heading mb-3">
        <!-- reference landmarks -->
        <div
          @click="changeLandmarkMode({ mode : addLandmarkMode === 'reference' ? false : 'reference' })"  
          :class="addLandmarkMode === 'reference' ? 'btn-success' : 'btn-outline-secondary'"
          class="btn-sm btn checkDelAllContainer">
          <div
            :class="addLandmarkMode === 'reference' ? 'btn-outline-success bg-light' : 'btn-secondary'"
            class="btn btn-sm rounded-circle">
            <font-awesome-icon icon="plus"></font-awesome-icon>
          </div>
          Reference
        </div>

        <div
          @click="changeLandmarkMode({ mode : addLandmarkMode === 'incoming' ? false : 'incoming' })"
          :class="addLandmarkMode === 'incoming' ? 'btn-success' : 'btn-outline-secondary'"
          class="btn-sm btn checkDelAllContainer">
          <div
            :class="addLandmarkMode === 'incoming' ? 'btn-outline-success bg-light' : 'btn-secondary'"
            class="btn-sm btn rounded-circle">
            <font-awesome-icon icon="plus"></font-awesome-icon>
          </div>
          Incoming
        </div>
      </div>

      <!-- check del all container -->
      <div v-if="lmpVisible" class=" lm-heading mb-3">

        <!-- reference landmarks -->
        <div  
          :class="refLmTopRowVisible ? '' : 'invisible'"
          class="checkDelAllContainer">
          <div class="input-group input-group-sm">
            <div
              v-if="false"
              class="input-group-prepend">
              <div
                @click="setLmsActive({ volume: 'reference', active: !allRefLmChecked })"
                class="onhoverCursorDefault input-group-text">
                <input
                  :checked="allRefLmChecked"
                  type="checkbox">
                All
              </div>
            </div>
            <div class="input-group-append">
              <div
                @click="removeAllLmsLmps"
                class="btn btn-sm btn-danger">
                <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                All
              </div>
            </div>
          </div>
        </div>

        <!-- incoming landmarks -->
        <div
          v-if="false"
          :class="incLmTopRowVisible ? '' : 'invisible'"
          class="checkDelAllContainer ml-3">
          <div class="input-group input-group-sm">
            <div class="input-group-prepend">
              <div
                @click="removeAllLmp"
                class="btn btn-sm btn-danger">
                <font-awesome-icon icon="unlink"></font-awesome-icon>
                All
              </div>
              <div
                @click="setLmsActive({ volume: 'incoming', active: !allIncLmChecked })"
                class="onhoverCursorDefault input-group-text">
                <input
                  :checked="allIncLmChecked"
                  type="checkbox">
                All
              </div>
            </div>
            <div class="input-group-append">
              <div
                @click="removeAllLm({ volume: 'incoming' })"
                class="btn btn-sm btn-danger">
                <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                All
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="text-muted">
          Start by adding some landmarks...
        </div>
      </div>

      <div class="lm-wrapper">

        <!-- only lmp -->
        <div class="ref-lm-wrapper">
          <landmark-row-v2
            class="mb-1 landmark-row"
            :class="lmp.hover ? 'bg-info' : ''"
            @mouseenter.native="hoverLandmarkPair({ id: lmp.id, hover: true })"
            @mouseleave.native="hoverLandmarkPair({ id: lmp.id, hover: false })"
            :landmark="lmp"
            :show-input="true"
            :size="'sm'"
            :key="lmp.id"
            @changeName="changeLandmarkPairName({ ...$event, id: lmp.id })"
            v-for="lmp in landmarkPairs">

            <!-- prepend -->
            <template slot="prepend">
              <div class="input-group-prepend">
                <div
                  @click="gotoLm({ volume: 'reference', id: lmp.refId })"
                  :style="{color: _step2Mode === 'overlay' ? referenceColor : lmp.color, opacity: lmp.active ? 1.0 : inactiveRowOpacity}"
                  class="btn btn-sm btn-outline-secondary">
                  <font-awesome-icon class="icon" icon="map-marker-alt"></font-awesome-icon>
                </div>
                <div
                  @click="gotoLm({ volume: 'incoming', id: lmp.incId })"
                  :style="{color: _step2Mode === 'overlay' ? incomingColor : lmp.color, opacity: lmp.active ? 1.0 : inactiveRowOpacity}"
                  class="btn btn-sm btn-outline-secondary">
                  <font-awesome-icon class="icon" icon="map-marker-alt"></font-awesome-icon>
                </div>
              </div>
            </template>

            <!-- append -->
            <template slot="append">
              <div class="input-group-append">
                <div
                  @click="removeLmp({ id: lmp.id })"
                  class="btn btn-sm btn-danger">
                  <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                </div>
              </div>
            </template>

          </landmark-row-v2>
        </div>
        
        <!-- all ref landmarks -->
        <div
          v-if="false"
          class="ref-lm-wrapper">

          
          <LandmarkRowV2
            class="mb-1 landmark-row"
            @changeName="changeLandmarkName({...$event, id: lm.id, volume: 'reference'})"
            :key="lm.id"
            :landmark="lm"
            :id="'lmr-' + lm.id"
            v-for="lm in referenceLandmarks">

            <!-- append icons -->
            <template slot="append">
              
              <div
                :style="lm.active ? {} : {opacity: inactiveRowOpacity}"
                @mouseleave="mouseoverId=null"
                class="input-group-append opacity-transition">

                <!-- see more icon -->
                <div
                  tabindex="-1"
                  :id="'popover-ref-vol-' + lm.id"
                  class="input-group-text readmore-icon">
                  <font-awesome-icon icon="ellipsis-v"></font-awesome-icon>
                </div>

                <b-popover
                  triggers="click blur"
                  :target="'popover-ref-vol-' + lm.id">
                  <template slot="title">Edit Landmark</template>
                  <EditLandmarkComponent
                    volume="reference"
                    @removeLm="removeLm({ volume: 'reference', id: lm.id})"
                    @changeName="changeLandmarkName({ ...$event, id: lm.id, volume: 'reference' })"
                    :landmark="lm"/>
                </b-popover>

              </div>

              <!-- experimental: paired landmark -->
              <div class="experimental-container">
                <div class="inner-container">
                  <ExperimentalPairedLm
                    :landmark="getPairedLm(lm)"
                    :parentLandmark="lm" />

                </div>
              </div>
            </template>

            <!-- prepend icons -->
            <template slot="prepend">
              <div
                class="input-group-prepend">
                <div
                  @click="toggleLmActive({ volume: 'reference', id: lm.id })"
                  class="input-group-text">
                  <input
                    :checked="lm.active"
                    type="checkbox" />
                </div>
                <span
                  @click="gotoLm({ volume: 'reference', id: lm.id })"
                  :style="{color: lm.color, opacity: lm.active ? 1.0 : inactiveRowOpacity}"
                  v-b-tooltip.hover.left.nofade="lm.name"
                  class="input-group-text opacity-transition">
                  <font-awesome-icon class="icon" icon="map-marker-alt"></font-awesome-icon>
                </span>
              </div>
            </template>

          </LandmarkRowV2>

          <div
            class="empty-text-helper text-muted"
            v-if="referenceLandmarks.length === 0">
            {{ addRefLmText }}
          </div>

        </div>

        <!-- unpaired incoming landmarks -->
        <div
          v-if="false"
          class="inc-lm-wrapper">

          <ExperimentalPairedLm 
            :key="lm.id"
            :landmark="lm"
            v-for="lm in unpairedIncLm" />


          <div
            class="empty-text-helper text-muted"
            v-if="incomingLandmarks.length === 0">
            {{ addIncLmText }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from 'vuex'

import LandmarkRowV2 from '@/components/LandmarkRowV2'
import ExperimentalPairedLm from '@/components/ExperimentalPairedLm'
import EditLandmarkComponent from '@/components/EditLandmark'
import { REFERENCE_COLOR, INCOMING_COLOR, INACTIVE_ROW_OPACITY, UNPAIRED_COLOR } from '@/constants'
import { EDIT_LANDMARKS_TITLE, OVERLAY_ADD_REF_LM_TEXT, OVERLAY_ADD_INC_LM_TEXT } from '@/text'

export default {
  components: {
    ExperimentalPairedLm,
    LandmarkRowV2,
    EditLandmarkComponent
  },
  data: function () {
    return {
      mouseoverId: null,
      lmIconOpenSet: [],
      inactiveRowOpacity: INACTIVE_ROW_OPACITY
    }
  },
  methods: {
    ...mapActions({
      toggleLmActive: 'toggleLmActive',
      removeLm: 'removeLm',
      gotoLm: 'gotoLm',
      changeLandmarkName: 'changeLandmarkName',
      removeAllLmp: 'removeAllLmp',
      removeAllLm: 'removeAllLm',
      setLmsActive: 'setLmsActive',
      changeLandmarkMode: 'changeLandmarkMode',
      changeLandmarkPairName: 'changeLandmarkPairName',
      hoverLandmarkPair: 'hoverLandmarkPair',
      removeAllLmsLmps: 'removeAllLmsLmps',
      removeLmp: 'removeLmp'
    }),
    toggleLmIcons: function (id) {
      const foundId = this.lmIconOpenSet.find(i => i === id)
      if (foundId) {
        this.lmIconOpenSet = this.lmIconOpenSet.filter(i => i !== id)
      } else {
        this.lmIconOpenSet = this.lmIconOpenSet.concat(id)
      }
    },
    toggleLandmark: function (mode) {
      this.$store.commit('_setStep2OverlayFocus', { mode })
    },
    getLmPair: function (lm) {
      return this.landmarkPairs.find(lmp => lmp.refId === lm.id)
    },
    getPairedLm: function (lm) {
      const lmp = this.getLmPair(lm)
      if (!lmp)
        return
      return {
        ...this.incomingLandmarks.find(lm => lmp.incId === lm.id),
        color: this._step2Mode === 'classic' ? lmp.color : INCOMING_COLOR
      }
    }
  },
  computed: {
    ...mapState({
      addLandmarkMode: 'addLandmarkMode',
      referenceLandmarks: state => {
        return state._step2Mode === 'classic' 
          ? state.referenceLandmarks.map(lm => {
            const lmp = state.landmarkPairs.find(lmp => lmp.refId === lm.id)
            return {
              ...lm,
              color: lmp ? lmp.color : UNPAIRED_COLOR
            }
          })
          : state.referenceLandmarks.map(lm => {
            return {
              ...lm,
              color: REFERENCE_COLOR
            }
          })
      },
      incomingLandmarks: 'incomingLandmarks',
      landmarkPairs: 'landmarkPairs',
      allRefLmChecked: state => state.referenceLandmarks.every(lm => lm.active),
      allIncLmChecked: state => state.incomingLandmarks.every(lm => lm.active),
      _step2Mode: '_step2Mode',
      incomingColor: state => (state.overlayColor && state.overlayColor.hex) || INCOMING_COLOR
    }),
    editLandmarksTitle: function () {
      return EDIT_LANDMARKS_TITLE
    },
    addRefLmText: function () {
      return OVERLAY_ADD_REF_LM_TEXT
    },
    addIncLmText: function () {
      return OVERLAY_ADD_INC_LM_TEXT
    },
    lmpVisible: function () {
      return this.landmarkPairs.length > 0
    },
    refLmTopRowVisible: function () {
      return this.referenceLandmarks.length > 0
    },
    incLmTopRowVisible: function () {
      return this.incomingLandmarks.length > 0
    },
    unpairedIncLm: function () {
      return this.incomingLandmarks.filter(incLm => {
        return this.landmarkPairs.findIndex(lmp => lmp.incId === incLm.id) < 0
      })
    },
    referenceColor: function () {
      return REFERENCE_COLOR
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

.body
{
  padding: 0.5em;
}

.opacity-transition
{
  transition: linear all 0.2s;
}

.icon
{
  filter: drop-shadow( 0px 1px rgba(0, 0, 0, 0.5))
    drop-shadow(0px -1px rgba(0, 0, 0, 0.5))
    drop-shadow(1px 0px rgba(0, 0, 0, 0.5))
    drop-shadow(-1px 0px rgba(0, 0, 0, 0.5));
}

.landmark-row
{
  transition: background-color 250ms ease;
}

.landmark-row.input-group
{
  flex-wrap: nowrap;
}

.landmark-row.empty
{
  display: inline-block;
}

.experimental-container
{
  overflow: visible;
  margin-left: 0.4em;
}

.experimental-container > .inner-container
{
  min-width: 7em;
  height: 100%;
}

.invisible
{
  pointer-events: none;
}

.readmore-icon,
.drag-handle
{
  padding-left: 0.2em;
  padding-right: 0.2em;
}


.drag-handle > *,
.readmore-icon > *
{
  opacity: 0.3;
  transition: linear all 0.2s;
}

.drag-handle:hover > *,
.readmore-icon:hover >*
{
  opacity: 1.0;
}

.checkDelAllContainer
{
  display: inline-block;
}

.onhoverCursorDefault:hover
{
  cursor: default;
}

.lm-heading
{
  display: flex;
  justify-content: space-between;
}

.lm-wrapper
{
  display:flex;
}

.lm-wrapper > .ref-lm-wrapper
{
  flex: 1 1 auto;
}

.lm-wrapper > .inc-lm-wrapper
{
  flex: 0 0 auto;
}

.btn-container
{
  padding: 0.5em;
}
.empty-text-helper
{
  padding: 1em;
  font-size: 75%;
  max-width: 10em;
}
.title-container
{
  display: flex;
  flex-direction: row;
  align-items: center;
}

.title-container:hover
{
  background-color: rgba(125,125,125,0.15);
  cursor: move;
}
</style>
