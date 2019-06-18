// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

// Vuex
import router from './router'
import getStore from './store'

import axios from 'axios'

// Bootstrap
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCircleNotch, faRuler, faQuestion, faShareAlt, faInfoCircle, faBrain, faFolderOpen, faUser, faSignInAlt, faPalette, faSpinner, faGripVertical, faLockOpen, faLock, faHistory, faCalculator, faUnlink, faEllipsisV, faEllipsisH, faLink, faColumns, faAnchor, faChevronDown, faChevronUp, faSave, faTable, faExclamationTriangle, faStepForward, faStepBackward, faBackward, faSlidersH, faMinus, faTimesCircle, faSearch, faEyeSlash, faMapMarkerAlt, faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle, faTimes, faTrashAlt, faThumbtack, faPlus, faFileUpload, faFileDownload, faArrowsAltV, faArrowsAltH, faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo, faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle, faCircle } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

Vue.use(BootstrapVue)

library.add( faCheckCircle, faCircleNotch, faCircle, faRuler, faQuestion, faShareAlt, faInfoCircle, faBrain, faFolderOpen, faUser, faSignInAlt, faPalette, faSpinner, faGripVertical, faLockOpen, faLock, faHistory, faCalculator, faUnlink, faEllipsisV, faEllipsisH, faLink,faColumns, faAnchor, faChevronDown, faChevronUp, faSave, faTable, faExclamationTriangle, faStepForward, faStepBackward, faBackward, faSlidersH, faMinus, faTimesCircle, faSearch, faEyeSlash, faMapMarkerAlt, faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle, faTimes, faTrashAlt, faThumbtack, faPlus, faFileUpload, faFileDownload, faArrowsAltV, faArrowsAltH, faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo, faCaretRight, faCaretDown)
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

const initVue = ({user} = {}) => {
  new Vue({
    router,
    store: getStore({ user }),
    render: h => h(App),
  }).$mount('#app')
}

axios.get('user')
  .then(({data: user}) => {
    initVue({ user })
  })
  .catch(e => {
    initVue()
  })