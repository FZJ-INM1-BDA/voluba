// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

// Vuex
import router from './router'
import store from './store'

// Bootstrap
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faUnlink, faEllipsisH, faLink, faColumns, faAnchor, faChevronDown, faChevronUp, faSave, faTable, faExclamationTriangle, faStepForward, faStepBackward, faBackward, faSlidersH, faMinus, faTimesCircle, faSearch, faEyeSlash, faMapMarkerAlt, faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle, faTimes, faTrashAlt, faThumbtack, faPlus, faFileUpload, faFileDownload, faArrowsAltV, faArrowsAltH, faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo, faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

Vue.use(BootstrapVue)

library.add( faUnlink, faEllipsisH, faLink,faColumns, faAnchor, faChevronDown, faChevronUp, faSave, faTable, faExclamationTriangle, faStepForward, faStepBackward, faBackward, faSlidersH, faMinus, faTimesCircle, faSearch, faEyeSlash, faMapMarkerAlt, faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle, faTimes, faTrashAlt, faThumbtack, faPlus, faFileUpload, faFileDownload, faArrowsAltV, faArrowsAltH, faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo, faCaretRight, faCaretDown)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')