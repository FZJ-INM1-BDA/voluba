<template>
  <div>

    <!-- header -->
    <div class="card bg-light" @mousedown="$emit('header-mousedown', $event)">
      <h5 class="title">
        <div>
          Edit landmarks
        </div>
        <small>
          {{ popoverTitle }}
        </small>
      </h5>
    </div>

    <!-- add load save -->
    <div class="bg-light">
      <div class="btn-group mb-3">
        <button
          type="button"
          @click="$store.dispatch('loadLandmarks')"
          class="btn btn-lg btn-secondary">
          <font-awesome-icon icon="file-upload"/>
          Load
        </button>
      </div>
    </div>

    <!-- tabs -->
    <div class="bg-light">
      <b-tabs>
        <b-tab @click="toggleLandmark('reference')" :active="_step2OverlayFocus === 'reference'" title="Reference">

        </b-tab>
        <b-tab @click="toggleLandmark('incoming')" :active="_step2OverlayFocus === 'incoming'" title="Incoming">

        </b-tab>
      </b-tabs>
    </div>

    <!-- TODO: sanitize to prevent XSS -->
    <!-- primary landmarks -->
    <div class="body bg-light">
      <LandmarkRowV2
        class="mb-1 landmark-row"
        @changeName="$store.dispatch('changeLandmarkName', {...$event, id: lm.id, volume: _step2OverlayFocus})"
        :key="lm.id"
        :landmark="lm"
        :style="lm.active ? {} : {opacity:0.2}"
        :id="'lmr-' + lm.id"
        v-for="lm in primaryLandmarks">

        <!-- append icons -->
        <template slot="append">
          
          <div
            :id="'lmRow' + lm.id"
            @mouseleave="mouseoverId=null"
            class="input-group-append">

            <!-- go to landmark -->
            <button
              v-if="mouseoverId === lm.id"
              @click.stop.prevent="gotoLm({volume: _step2OverlayFocus, id: lm.id})"
              type="button"
              class="btn btn-sm btn-primary"
              v-b-tooltip.hover title="Go to landmark">
              <font-awesome-icon icon = "map-marker-alt"/>
            </button>

            <!-- trash landmark -->
            <button
              v-if="mouseoverId === lm.id"
              @click.stop.prevent="removeLm({ volume: _step2OverlayFocus, id: lm.id})"
              type="button"
              class="btn btn-sm btn-danger"
              v-b-tooltip.hover title="Remove landmark">
              <font-awesome-icon icon="trash-alt"/>
            </button>

            <!-- link btn -->
            <button
              v-if="mouseoverId === lm.id"
              type="button"
              @click="popoverOpenId = popoverOpenId === lm.id ? null : lm.id"
              v-b-tooltip.hover title="Paired landmark"
              class="btn btn-sm btn-secondary">
              <font-awesome-icon icon="link"/>
            </button>

            <!-- show more ellipses -->
            <button
              v-if="lm.id !== mouseoverId"
              @mouseenter="mouseoverId=lm.id"
              class="btn btn-sm btn-secondary">
              <font-awesome-icon
                icon="ellipsis-h">
                <!-- :icon="lmIconOpenSet.findIndex(i => i === lm.id) < 0? 'ellipsis-h' : 'times'"> -->
                </font-awesome-icon>
            </button>

          </div>

          <!-- popover -->
          <LandmarkPairingComponent
            :parentLm="lm"
            :show="popoverOpenId === lm.id"/>
        </template>

        <template slot="prepend">
          <div
            @click="toggleLmActive({ volume: _step2OverlayFocus, id: lm.id })"
            class="input-group-prepend">
            <div
              class="input-group-text">
              <input
                :checked="lm.active"
                type="checkbox" />
            </div>
            <span
              :style="checkboxStyle"
              class="input-group-text">
              <font-awesome-icon class="icon" icon="map-marker-alt"></font-awesome-icon>
            </span>
          </div>
        </template>

      </LandmarkRowV2>
    </div>
  </div>
</template>
<script>
import LandmarkRowV2 from '@/components/LandmarkRowV2'
import LandmarkPairingComponent from '@/components/LandmarkPairingUI'
import { REFERENCE_COLOR, INCOMING_COLOR } from '@/constants'
import { mapActions } from 'vuex'

export default {
  components: {
    LandmarkRowV2,
    LandmarkPairingComponent
  },
  data: function () {
    return {
      mouseoverId: null,
      popoverTarget: null,
      lmIconOpenSet: [],
      popoverOpenId: null
    }
  },
  methods: {
    ...mapActions({
      toggleLmActive: 'toggleLmActive',
      removeLm: 'removeLm',
      gotoLm: 'gotoLm'
    }),
    showPopover: function ({ volume, id }) {
      const popoverRef = this.$refs.popoverLinkLandmark
      this.popoverTarget = `lmr-${id}`
      if (!popoverRef)
        return
      if (popoverRef.show)
        popoverRef.$emit('close')
      popoverRef.$emit('open')
    },
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
    }
  },
  computed: {
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
  padding: 1em;
}

.landmark-row
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
</style>
