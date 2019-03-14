<template>
  <div>

    <!-- header -->
    <div
      class="card bg-light"
      @mousedown="$emit('header-mousedown', $event)">
      <h5 class="title">
        <div>
          {{ editLandmarksTitle }}
        </div>
      </h5>
    </div>

    <!-- TODO: sanitize to prevent XSS -->
    <!-- primary landmarks -->
    <div class="body bg-light">

      <!-- top label -->
      <div class="lm-heading mb-3">
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
      <div v-if="refLmTopRowVisible || incLmTopRowVisible" class=" lm-heading mb-3">

        <!-- reference landmarks -->
        <div  
          :class="refLmTopRowVisible ? '' : 'invisible'"
          class="checkDelAllContainer">
          <div class="input-group input-group-sm">
            <div class="input-group-prepend">
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
                @click="removeAllLm({ volume: 'reference' })"
                class="btn btn-sm btn-danger">
                <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                All
              </div>
            </div>
          </div>
        </div>

        <!-- incoming landmarks -->
        <div
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

      <div class="lm-wrapper">

        <!-- all ref landmarks -->
        <div class="ref-lm-wrapper">
          <LandmarkRowV2
            class="mb-1 landmark-row"
            @changeName="changeLandmarkName({...$event, id: lm.id, volume: _step2OverlayFocus})"
            :key="lm.id"
            :landmark="lm"
            :id="'lmr-' + lm.id"
            v-for="lm in primaryLandmarks">

            <!-- append icons -->
            <template slot="append">
              
              <div
                :style="lm.active ? {} : {opacity: inactiveRowOpacity}"
                @mouseleave="mouseoverId=null"
                class="input-group-append opacity-transition">

                <!-- see more icon -->
                <div
                  tabindex="-1"
                  :id="'popover-' + lm.id"
                  class="input-group-text readmore-icon">
                  <font-awesome-icon icon="ellipsis-v"></font-awesome-icon>
                </div>

                <b-popover
                  triggers="click blur"
                  :target="'popover-' + lm.id">
                  <template slot="title">Edit Landmark</template>
                  <EditLandmarkComponent
                    volume="reference"
                    @removeLm="removeLm({ volume: _step2OverlayFocus, id: lm.id})"
                    @changeName="changeLandmarkName({ ...$event, id: lm.id, volume: _step2OverlayFocus })"
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
                  @click="toggleLmActive({ volume: _step2OverlayFocus, id: lm.id })"
                  class="input-group-text">
                  <input
                    :checked="lm.active"
                    type="checkbox" />
                </div>
                <span
                  @click="gotoLm({ volume: _step2OverlayFocus, id: lm.id })"
                  :style="{...checkboxStyle, opacity: lm.active ? 1.0 : inactiveRowOpacity}"
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
        <div class="inc-lm-wrapper">

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
import { REFERENCE_COLOR, INCOMING_COLOR, INACTIVE_ROW_OPACITY } from '@/constants'
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
      changeLandmarkMode: 'changeLandmarkMode'
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
      return this.incomingLandmarks.find(lm => lmp.incId === lm.id)
    }
  },
  computed: {
    ...mapState({
      addLandmarkMode: 'addLandmarkMode',
      referenceLandmarks: 'referenceLandmarks',
      incomingLandmarks: 'incomingLandmarks',
      landmarkPairs: 'landmarkPairs',
      allRefLmChecked: state => state.referenceLandmarks.every(lm => lm.active),
      allIncLmChecked: state => state.incomingLandmarks.every(lm => lm.active)
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
    popoverTitle: function () {
      return this._step2OverlayFocus === 'reference' ? 'Incoming Volume Landmarks' : 'Reference Volume Landmarks'
    },
    checkboxStyle: function () {
      return {
        color: this._step2OverlayFocus === 'reference'
          ? REFERENCE_COLOR
          : INCOMING_COLOR
      }
    },
    incomingStyle: function () {
      return {
        color: INCOMING_COLOR
      }
    },
    primaryLandmarks: function () {
      return (this._step2OverlayFocus === 'reference'
        ? this.referenceLandmarks
        : this.incomingLandmarks).map(lm => {
          return {
            ...lm,
            showIcon: this.lmIconOpenSet.findIndex(i => i === lm.id) >= 0
          }
        })
    },
    secondaryLandmarks: function () {
      return this._step2OverlayFocus === 'reference'
        ? this.incomingLandmarks
        : this.referenceLandmarks
    },  
    _step2OverlayFocus: function () {
      return this.$store.state._step2OverlayFocus
    },
    incomingLandmarks: function () {
      return this.$store.state.incomingLandmarks
    },
    referenceLandmarks: function () {
      return this.$store.state.referenceLandmarks
    }
  }
}
</script>
<style scoped>
.title
{
  padding-left: 1em;
  padding-right: 1.5em;
  padding-top: 3em;
  padding-bottom:0.5em;
  margin-bottom:0;

  transition: linear 150ms all;
}
.title:hover
{
  background-color: rgba(125,125,125,0.15);
  cursor: move;
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
</style>
