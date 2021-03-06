<template>
  <div>
    <b-navbar id = "nav" toggleable="md">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

      <progress-tracker v-if="showProgressTracker" />

      <b-collapse is-nav id="nav_collapse">

        <!-- Right aligned nav items -->
        <b-navbar-nav class="align-items-center pointer-events ml-auto">

          <!-- about us -->
          <div
            v-b-tooltip.hover.bottom="'About Voluba'"
            @click="openModal({ modalId: 'aboutus' })"
            class="mr-2">
            <font-awesome-icon icon="question-circle"></font-awesome-icon>
          </div>

          <!-- global lock -->
          <div
            v-if="showGlobalLock"
            v-b-tooltip.hover.bottom="'Lock Incoming Volume'"
            @click="toggleGlobalLock"
            class="mr-2 w-1em">
            <font-awesome-icon
              :icon="globalLockIcon">
            </font-awesome-icon>
          </div>

          <!-- opacity -->
          <transition name="fade">
            <b-nav-form
              v-if="_step2Mode === 'overlay' && selectedIncomingVolumeType === 'image'">

              <SliderComponent
                v-b-tooltip.hover.bottom="'incoming volume opacity'"
                class="transparent"
                @minus="opacity = opacity - 0.05 < opacityMin ? opacityMin : opacity - 0.05"
                @plus="opacity = opacity + 0.05 > opacityMax ? opacityMax : opacity + 0.05"
                @textInput="opacity = $event"
                @sliderInput="opacity = $event"
                :min="opacityMin"
                :max="opacityMax"
                :step="opacityStep"
                :value="opacity" />
            </b-nav-form>
          </transition>

          <!-- color -->  
          <transition name="fade">
            <b-nav-item-dropdown
              :no-caret="true"
              right
              v-if="showColorPicker">
              <template slot="button-content">
                <div
                  :style="{color: overlayColor.hex}"
                  v-b-tooltip.hover="'incoming volume color'"
                  class="btn btn-sm rounded-circle btn-outline-secondary">
                  <font-awesome-icon class="icon" icon="palette"></font-awesome-icon>
                </div>
              </template>
              <b-dropdown-text>

                <h5>
                  Colormaps
                </h5>

                <b-button :variant="colorMapSelectionText === colorMap.name ? 'primary' : 'outline-primary'"
                  @click="selectColorMapByName({ name: colorMap.name })"
                  v-for="colorMap in availableColorMaps"
                  :key="colorMap.name">
                  {{ colorMap.name }}
                </b-button>
              </b-dropdown-text>

              <b-dropdown-divider />

              <b-dropdown-text>
                <h5>
                  Mono
                </h5>
              </b-dropdown-text>

              <b-dropdown-text class="nopadding">
                <compact-picker
                  class="compact-picker"
                  v-model="overlayColor" />
              </b-dropdown-text>
            </b-nav-item-dropdown>

          </transition>

          <!-- threshold -->
          <transition name="fade">
            <b-nav-item-dropdown
              v-if="showThreshold"
              text="Threshold"
              right>
              <b-dropdown-text>

                <SliderComponent
                  class="w-10em"
                  name="Lower Threshold"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  @sliderInput="lowerThreshold = $event"
                  @minus="lowerThreshold -= 0.01"
                  @plus="lowerThreshold += 0.01"
                  :value="lowerThreshold"
                  unit="" />
                <SliderComponent
                  class="w-10em"
                  name="Upper Threshold"
                  :min="0"
                  :max="1"
                  :step="0.01"
                  @sliderInput="upperThreshold = $event"
                  @minus="upperThreshold -= 0.01"
                  @plus="upperThreshold += 0.01"
                  :value="upperThreshold"
                  unit="" />
              </b-dropdown-text>
            </b-nav-item-dropdown>
          </transition>

          <!-- split view toggle -->
          <b-nav-form>
            <b-button
              @click="toggleMode"
              v-b-tooltip.hover.bottom="modeBtnTooltipText"
              class="rounded-circle btn-sm"
              :variant="modeBtnVariant">
              <font-awesome-icon icon="columns"></font-awesome-icon>
            </b-button>
          </b-nav-form>

          <!-- authentication -->
          <b-nav-item-dropdown
            v-if="allowUpload"
            :no-caret="true"
            right>
            <template slot="button-content">
              <div
                v-b-tooltip.hover.bottom="loginText"
                :class="user ? 'btn-info' : 'btn-outline-secondary'"
                class="rounded-circle btn btn-sm">
                <font-awesome-icon :icon="user ? 'user' : 'sign-in-alt'" />
              </div>
            </template>

            <b-dropdown-item
              v-if="user"
              href="logout">
              Logout
            </b-dropdown-item>
            <SigningComponent v-else />

          </b-nav-item-dropdown>

          <!-- help btn -->
          <b-nav-item v-if="false" href="#"><font-awesome-icon icon="question-circle"/></b-nav-item>
        </b-navbar-nav>
      </b-collapse>

    </b-navbar>
  </div>
</template>

<script>
import ProgressTracker from '@/components/layout/ProgressTracker'
import SigningComponent from '@/components/SigninComponent'
import SliderComponent from '@/components/layout/Slider'
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { Compact } from 'vue-color'
import { AGREE_COOKIE_KEY } from '@/constants'

export default {
  name: 'HeaderComponent',
  data: function () {
    return {
      opacityMin: 0,
      opacityMax: 1.0,
      opacityStep: 0.01,
    }
  },
  components: {
    ProgressTracker,
    SigningComponent,
    CompactPicker: Compact,
    SliderComponent
  },
  mounted() {
    const showCookie = (cb = () => {}) => {
      this.openModal({ modalId: 'cookie', onHiddenCb: cb })
    }

    const showServerWarning = () => {
      if (this.serverWarnings && this.serverWarnings.length > 0) {
        this.modalMessage({
          variant: 'warning',
          title: 'Image Server Warning',
          htmlBody: makeHtmlFragmentForWarning({ serverWarnings: this.serverWarnings})
        })
      }
    }

    if (!this.agreedToCookie) {
      const onHideCB = () => {
        const obj = {}
        obj[AGREE_COOKIE_KEY] = true
        this.setLocalStorage(obj)
        showServerWarning()
      }
      showCookie(() => onHideCB())
    } else {
      showServerWarning()
    }
  },
  computed: {
    ...mapGetters('dataSelectionStore', [
      'selectedIncomingVolumeType'
    ]),
    ...mapState('viewerPreferenceStore', {
      stateIncomingColor: state => state.incomingColor,
      stateOverlayColor: state => state.overlayColor,
      availableColorMaps: state => state.availableColorMaps,
      stateLowerThreshold: state => state.lowerThreshold,
      stateUpperThreshold: state => state.upperThreshold
    }),
    ...mapGetters('viewerPreferenceStore', [
      'selectedColorMap'
    ]),
    ...mapState('nehubaStore', {
      globalIncLock: state => state.incVolRotationLock && state.incVolTranslationLock && state.incVolScaleLock
    }),
    ...mapState('authStore', [
      'user'
    ]),
    ...mapState({
      _step2Mode: '_step2Mode',
      allowUpload: 'allowUpload',
      modeBtnVariant: state => state._step2Mode === 'overlay' ? 'outline-secondary' : 'info',
      agreedToCookie: 'agreedToCookie'
    }),
    lowerThreshold: {
      get: function () {
        return this.stateLowerThreshold
      },
      set: function (lowerThreshold) {
        this.setLowerThreshold({ lowerThreshold })
      }
    },
    upperThreshold: {
      get: function () {
        return this.stateUpperThreshold
      },
      set: function (upperThreshold) {
        this.setUpperThreshold({ upperThreshold })
      }
    },
    globalLockIcon: function () {
      return this.globalIncLock ?  'lock' : 'lock-open'
    },
    loginText: function () {
      return this.user
        ? `Hi ${(this.user && this.user.name) || 'Unnamed User'}`
        : `Login`
    },
    showGlobalLock: function () {
      return this._step2Mode === 'overlay'
    },
    showThreshold: function () {
      return this._step2Mode === 'overlay'
    },
    showColorPicker: function () {
      return this._step2Mode === 'overlay' && this.selectedIncomingVolumeType === 'image'
    },
    colorMapSelectionText: function () {
      return this.selectedColorMap
        ? this.selectedColorMap.name
        : 'Mono'
    },
    modeBtnTooltipText: function () {
      return `${this.mode === 'classic' ? 'Disable' : 'Enable'} two pane mode`
    },
    overlayColor: {
      get: function () {
        return this.stateOverlayColor
      },
      set: function (newColor) {
        this.selectColorMapByName({ name: null })
        this.changeOverlayColor(newColor)
      }
    },
    showProgressTracker: function () {
      const obj = this.$router.options.routes.find(r => r.path === this.$route.path)
      return obj && obj.shown
    },
    mode: {
      get: function () {
        return this.$store.state._step2Mode
      },
      set: function (mode) {
        this.$store.commit('_setStep2Mode', { mode })
      }
    },
    opacity: {
      get: function () {
        return this.stateIncomingColor[3]
      },
      set: function (opacityVal) {
        this.changeOpacity(Number(opacityVal))
      }
    }
  },
  methods: {
    ...mapActions('viewerPreferenceStore', [
      'changeOpacity',
      'changeOverlayColor',
      'selectColorMapByName'
    ]),
    ...mapActions('nehubaStore', [
      'lockIncVol'
    ]),
    ...mapActions({
      modalMessage: 'modalMessage',
      openModal: 'openModal',
      setLocalStorage: 'setLocalStorage',
      log: 'log',
    }),
    ...mapMutations('viewerPreferenceStore', [
      'setLowerThreshold',
      'setUpperThreshold'
    ]),
    toggleGlobalLock: function () {
      if (this.globalIncLock) {
        this.lockIncVol({
          incVolTranslationLock: false,
          incVolRotationLock: false,
          incVolScaleLock: false
        })
      } else {
        this.lockIncVol({
          incVolTranslationLock: true,
          incVolRotationLock: true,
          incVolScaleLock: true
        })
      }
    },
    toggleMode: function () {
      this.mode = this.mode === 'overlay' ? 'classic' : 'overlay'
    }
  }
}
</script>

<style scoped>
#nav
{
  z-index: 10;
  pointer-events: none;
}
#logo {
  margin-right: 5px;
}
.description {
  font-size: 12px;
  margin-bottom: 0px;
}
.pointer-events
{
  pointer-events: all;
}
.colour-box
{
  width: 20px;
  height: 20px;
  border: 1px solid black;
  display:inline-block;
}
.nopadding
{
  padding: 0;
}

.icon
{
  filter: drop-shadow( 0px 1px rgba(0, 0, 0, 0.5))
    drop-shadow(0px -1px rgba(0, 0, 0, 0.5))
    drop-shadow(1px 0px rgba(0, 0, 0, 0.5))
    drop-shadow(-1px 0px rgba(0, 0, 0, 0.5));
}
.compact-picker
{
  width: 250px;
}
.transparent
{
  opacity: 0.5;
  transition: opacity linear 200ms;
}
.transparent:hover
{
  opacity: 1.0;
}

.w-1em
{
  width:1em!important;
}

.w-10em
{
  width: 10em;
}
</style>
