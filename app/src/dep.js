import Vue from 'vue'

// Bootstrap
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Font awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faExternalLinkAlt, faCircleNotch, faBook, faCookieBite, faSyncAlt, faHdd, faRuler, faQuestion, faShareAlt, faInfoCircle, faBrain, faFolderOpen, faUser, faSignInAlt, faPalette, faSpinner, faGripVertical, faLockOpen, faLock, faHistory, faCalculator, faUnlink, faEllipsisV, faEllipsisH, faLink, faColumns, faAnchor, faChevronDown, faChevronUp, faSave, faTable, faExclamationTriangle, faStepForward, faStepBackward, faBackward, faSlidersH, faMinus, faTimesCircle, faSearch, faEyeSlash, faMapMarkerAlt, faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle, faTimes, faTrashAlt, faThumbtack, faPlus, faFileUpload, faFileDownload, faArrowsAltV, faArrowsAltH, faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo, faCaretRight, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { faCheckCircle, faEnvelope, faCircle } from '@fortawesome/free-regular-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

Vue.use(BootstrapVue)

library.add( faCheck, faExternalLinkAlt, faCheckCircle, faGithub, faEnvelope, faBook, faCookieBite, faSyncAlt, faHdd, faCircleNotch, faCircle, faRuler, faQuestion, faShareAlt, faInfoCircle, faBrain, faFolderOpen, faUser, faSignInAlt, faPalette, faSpinner, faGripVertical, faLockOpen, faLock, faHistory, faCalculator, faUnlink, faEllipsisV, faEllipsisH, faLink,faColumns, faAnchor, faChevronDown, faChevronUp, faSave, faTable, faExclamationTriangle, faStepForward, faStepBackward, faBackward, faSlidersH, faMinus, faTimesCircle, faSearch, faEyeSlash, faMapMarkerAlt, faAngleLeft, faAngleRight, faAngleDoubleRight, faAngleUp, faAngleDown, faEye, faBars, faPlayCircle, faUpload, faDownload, faFileExport, faQuestionCircle, faTimes, faTrashAlt, faThumbtack, faPlus, faFileUpload, faFileDownload, faArrowsAltV, faArrowsAltH, faArrowUp, faArrowDown, faArrowLeft, faArrowRight, faUndo, faRedo, faCaretRight, faCaretDown)
Vue.component('font-awesome-icon', FontAwesomeIcon)