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

          <!-- Incoming Volume filter -->
          <transition name="fade" v-if="selectedIncomingVolume">
            <b-nav-item-dropdown
                text="Volume filter"
                right>
              <b-dropdown-text>
                <ng-layer-tune
                    ref="ngLayerTune"
                    advanced-control="true"
                    :nehuba-name="this.mode === 'classic' ? 'secondaryNehubaViewer' : 'primaryNehubaViewer'"
                    :ng-layer-name="this.mode === 'classic' ? 'default' : 'userlayer-0'"
                    >
                </ng-layer-tune>
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
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { AGREE_COOKIE_KEY } from '@/constants'

export default {
  name: 'HeaderComponent',
  components: {
    ProgressTracker,
    SigningComponent,
  },
  mounted() {
    const showCookie = (cb = () => {}) => {
      this.openModal({ modalId: 'cookie', onHiddenCb: cb })
    }

    const showServerWarning = () => {
      if (this.serverWarnings && this.serverWarnings.length > 0) {
        /**
         * TODO reimplement server warning
         */
        // this.modalMessage({
        //   variant: 'warning',
        //   title: 'Image Server Warning',
        //   htmlBody: makeHtmlFragmentForWarning({ serverWarnings: this.serverWarnings})
        // })
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
      'selectedIncomingVolume'
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
    modeBtnTooltipText: function () {
      return `${this.mode === 'classic' ? 'Disable' : 'Enable'} two pane mode`
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
        setTimeout(() => this.$refs.ngLayerTune.forceRefreshShader(), 1000)
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
.pointer-events
{
  pointer-events: all;
}
.w-1em
{
  width:1em!important;
}
</style>
