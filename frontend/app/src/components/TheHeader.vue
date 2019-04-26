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
            @click="openModal({ modalId: 'aboutus' })"
            class="mr-2">
            <font-awesome-icon icon="question-circle"></font-awesome-icon>
          </div>

          <!-- opacity -->
          <transition name="fade">
            <b-nav-form
              v-if="_step2Mode === 'overlay'">

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
              v-if="_step2Mode === 'overlay'">
              <template slot="button-content">
                <div
                  :style="{color: overlayColor.hex}"
                  v-b-tooltip.hover="'incoming volume color'"
                  class="btn btn-sm rounded-circle btn-outline-secondary">
                  <font-awesome-icon class="icon" icon="palette"></font-awesome-icon>
                </div>
              </template>
              <b-dropdown-item
                class="nopadding">
                <compact-picker
                  class="compact-picker"
                  v-model="overlayColor" />
              </b-dropdown-item>
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
import axios from 'axios'
import { mapState, mapActions } from 'vuex'
import { Compact } from 'vue-color'
import { AGREE_COOKIE_KEY } from '@/constants'

export default {
  name: 'HeaderComponent',
  data: function () {
    return {
      getUserPromise: axios.get('user'),

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
    if (!this.agreedToCookie) {
      const onHideCB = () => {
        const obj = {}
        obj[AGREE_COOKIE_KEY] = true
        this.setLocalStorage(obj)
      }
      this.modalMessage({
        title: 'Cookie Disclaimer',
        body: 'Our site saves small pieces of text information (cookies) on your device in order to deliver better content and for statistical purposes. You can disable the usage of cookies by changing the settings of your browser. By browsing our website without changing the browser settings you grant us permission to store that information on your device',
        variant: 'info',
        showFooter: true,
        okOnly: true,
        onHiddenCallback: onHideCB.bind(this)
      })
    }

    this.getUserPromise
      .then(({ data }) => {

        this.log(['auth successful', { data }])
        this.$store.commit('setUser', { user: data })
      })
      .catch(e => {
        this.log(['error', {e}])
        this.$store.commit('setUser', { user: null })
      })
  },
  computed: {
    ...mapState({
      user: 'user',
      _step2Mode: '_step2Mode',
      modeBtnVariant: state => state._step2Mode === 'overlay' ? 'outline-secondary' : 'info',
      agreedToCookie: 'agreedToCookie'
    }),
    loginText: function () {
      return this.user
        ? `Hi ${(this.user && this.user.name) || 'Loris Ipsum'}`
        : `Login`
    },
    modeBtnTooltipText: function () {
      return `${this.mode === 'classic' ? 'Disable' : 'Enable'} two pane mode`
    },
    overlayColor: {
      get: function () {
        return this.$store.state.overlayColor
      },
      set: function (newColor) {
        this.$store.dispatch('changeOverlayColor', newColor)
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
        const color = this.$store.state.incomingColor
        return color[3]
      },
      set: function (opacityVal) {
        this.$store.dispatch('changeOpacity', Number(opacityVal))
      }
    }
  },
  methods: {
    ...mapActions({
      modalMessage: 'modalMessage',
      openModal: 'openModal',
      setLocalStorage: 'setLocalStorage',
      log: 'log'
    }),
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
</style>
