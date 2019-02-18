<template>
  <div v-if="show" class="pairUIContainer">
    <div class=" card bg-light content">

      <!-- linked landmark -->
      <div v-if="linkedLm">
        <h5>
          {{ linkedLmText }}
        </h5>
        <LandmarkRowV2
          :landmark="linkedLm">
          <template slot="prepend">
            <div class="input-group-prepend">
              <div
                @click="removeLmp({id: lmp.id})"
                v-b-tooltip.hover.top.html
                :title="linkedLmUnlinkTooltipText"
                class="btn btn-danger">
                <font-awesome-icon icon="unlink"></font-awesome-icon>
              </div>
              <span
                :style="linkedStyle"
                class="input-group-text">
                <font-awesome-icon class="icon" icon="map-marker-alt"></font-awesome-icon>
              </span>
            </div>
          </template>
        </LandmarkRowV2>
      </div>
      <hr />

      <!-- other landmarks -->
      <h5>
        {{ otherLmText }}
      </h5>
      <landmark-row-v2
        :landmark="lm"
        size="sm"
        :key="lm.id"
        v-for="lm in otherLms">
        <template slot="prepend">
          <div class="input-group-prepend">
            <div
              v-if="getLmPair(lm)"
              v-b-tooltip.hover.top.html
              :title="getOtherTooltipText(lm)"
              @click="unlinkLm(getLmPair(lm))"
              class="btn btn-sm btn-danger">
              <font-awesome-icon icon="unlink">
              </font-awesome-icon>
            </div>
            <div
              v-else
              @click="linkLm({id: lm.id})"
              v-b-tooltip.hover.top.html
              :title="getOtherTooltipTextAdd(lm)"
              class="btn btn-sm btn-success">
              <font-awesome-icon icon="link">
              </font-awesome-icon>
            </div>
            <span
              :style="linkedStyle"
              class="input-group-text">
              <font-awesome-icon
                class="icon"
                icon="map-marker-alt"></font-awesome-icon>
            </span>
          </div>
        </template>
      </landmark-row-v2>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { REFERENCE_COLOR, INCOMING_COLOR } from '@/constants'
import LandmarkRowV2 from '@/components/LandmarkRowV2'
export default {
  props: {
    parentLm: {
      type: Object,
      default: null
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  components: {
    LandmarkRowV2
  },
  computed: {
    ...mapState({
      _step2OverlayFocus: '_step2OverlayFocus',
      landmarks: state => state._step2OverlayFocus === 'reference'
        ? state.incomingLandmarks
        : state._step2OverlayFocus === 'incoming'
          ? state.referenceLandmarks
          : [],
      landmarkPairs: 'landmarkPairs',
      referenceLandmarks: 'referenceLandmarks',
      incomingLandmarks: 'incomingLandmarks',
      primaryLmName: state => state._step2OverlayFocus === 'reference' ? 'landmark in reference volume' : 'landmark in incoming volume',
      secondaryLmName: state => state._step2OverlayFocus === 'reference' ? 'landmark in incoming volume' : 'landmark in reference volume'
    }),
    linkedStyle: function () {
      return {
        color: this.secondaryColor
      }
    },
    errorText: function () {
      return `Unknown overlay focus state`
    },
    linkedLmText: function () {
      return this._step2OverlayFocus === 'reference'
        ? `Linked incoming landmark`
        : this._step2OverlayFocus === 'incoming'
          ? `Linked reference landmark`
          : this.errorText
    },
    linkedLmUnlinkTooltipText: function () {
      return `break link between <br />${this.getColorCube(this.primaryColor)} <i>${this.parentLm.name}</i> and ${this.getColorCube(this.secondaryColor)} <i>${this.linkedLm.name}</i>`
    },
    otherLmText: function () {
      return this._step2OverlayFocus === 'reference'
        ? `Other incoming landmarks`
        : this._step2OverlayFocus === 'incoming'
          ? `Other reference landmarks`
          : this.errorText
    },

    primaryColor: function () {
      return this._step2OverlayFocus === 'reference'
        ? REFERENCE_COLOR
        : INCOMING_COLOR
    },

    secondaryColor: function () {
      return this._step2OverlayFocus === 'reference'
        ? INCOMING_COLOR
        : REFERENCE_COLOR
    },

    /**
     * may return undefined or null
     */
    lmp: function () {
      return this.landmarkPairs.find(lmp => this._step2OverlayFocus === 'reference'
        ? lmp.refId === this.parentLm.id
        : this._step2OverlayFocus === 'incoming'
          ? lmp.incId === this.parentLm.id
          : false)
    },
    linkedLm: function () {
      if (!this.lmp)
        return null

      return this.landmarks.find(lm => this._step2OverlayFocus === 'reference'
        ? lm.id === this.lmp.incId
        : this._step2OverlayFocus === 'incoming'
          ? lm.id === this.lmp.refId
          : false)
    },
    otherLms: function () {
      return this.linkedLm
        ? this.landmarks.filter(lm => lm.id !== this.linkedLm.id)
        : this.landmarks
    }
  },
  methods: {
    ...mapActions({
      removeLmp: 'removeLmp'
    }),
    linkLm: function ({id}) {
      const refId = this._step2OverlayFocus === 'reference'
        ? this.parentLm.id
        : id

      const incId = this._step2OverlayFocus === 'reference'
        ? id
        : this.parentLm.id

      /**
       * remove existing links first
       */
      if (this.lmp)
        this.removeLmp({ id: this.lmp.id })

      this.$store.dispatch('addLmp', {
        refId,
        incId
      })
    },
    unlinkLm: function (pair) {
      if (!pair || !pair.id)
        return
      this.removeLmp({id : pair.id})
    },
    /**
     * TODO check if methods creates too much overhead
     */
    getOtherTooltipTextAdd: function (lm) {
      const breakTxt = this.lmp
        ? `${this.linkedLmUnlinkTooltipText}<br /><br />then `
        : ``
      return `${breakTxt}create link between ${this.getColorCube(this.primaryColor)} <i>${this.parentLm.name}</i> and ${this.getColorCube(this.secondaryColor)} <i>${lm.name}</i>`
    },
    getOtherTooltipText: function (lm) {
      const pair = this.getLmPair(lm)
      if (!pair || !pair.incoming || !pair.reference)
        return `Landmark pair could not be found`
      return `This ${this.primaryLmName} is linked to another ${this.secondaryLmName} <br /><br /> break link between <br />${this.getColorCube(this.primaryColor)} <i>${this._step2OverlayFocus === 'reference' ? pair.reference.name : pair.incoming.name}</i> and ${this.getColorCube(this.secondaryColor)} <i>${this._step2OverlayFocus === 'reference' ? pair.incoming.name : pair.reference.name}</i>`
    },
    getLmPair: function (lm) {
      const key = this._step2OverlayFocus === 'reference'
        ? 'incId'
        : this._step2OverlayFocus === 'incoming'
          ? 'refId'
          : null

      if (!key)
        return null

      const pair = this.landmarkPairs.find(lmp => lmp[key] === lm.id)

      if (!pair)
        return null
      
      return {
        id: pair.id,
        incoming: this.incomingLandmarks.find(lm => lm.id === pair.incId),
        reference: this.referenceLandmarks.find(lm => lm.id === pair.refId)
      }
    },
    getColorCube: function (styleString) {
      return `<div style="display:inline-block; width: 1em; height: 1em; background-color: ${styleString};"></div>`
    }
  }
}
</script>
<style scoped>
.pairUIContainer
{
  height: 0;
  width: 0;
  flex: 0 0 0;
  overflow: visible;
}

.pairUIContainer > .content
{
  width: 20em;
  padding: 1em;
  margin-left: 1.5em;
}

.icon
{
  filter: drop-shadow( 0px 1px rgba(0, 0, 0, 0.5))
    drop-shadow(0px -1px rgba(0, 0, 0, 0.5))
    drop-shadow(1px 0px rgba(0, 0, 0, 0.5))
    drop-shadow(-1px 0px rgba(0, 0, 0, 0.5));
}
</style>
