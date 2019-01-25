import Vue from 'vue'
import Router from 'vue-router'

import store from '@/store'

import Step1 from '@/components/toolbars/ToolbarStep1'
import Step2 from '@/components/toolbars/ToolbarStep2'
import Step3 from '@/components/toolbars/ToolbarStep3'
import SplashScreen from '@/components/SplashScreen'
import NotFound from '@/views/NotFound'

const checkIncVolSet = (to, from, next) => {
  console.log(store.state.selectedReferenceVolumeId, store.state.selectedIncomingVolumeId)
  if (store.state.selectedIncomingVolumeId && store.state.selectedReferenceVolumeId) {
    next()
  } else {
    console.log('please check that your inc volume and reference volumes are selected')
    /**
     * TODO: better UI temporary measure
     */
    alert('please check that your inc volume and reference volumes are selected')
    next('/')
  }
}

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: SplashScreen
    },
    {
      meta: {
        shownInProgress: true,
        displayName: '3D Anchoring',
      },
      path: '/step1',
      name: 'Step 1',
      displayName: '3D Anchoring',
      shown: true,
      component: Step1,
      beforeEnter: checkIncVolSet
    },
    {
      meta: {
        shownInProgress: true,
        displayName: 'Entering Landmark-Pairs',
      },
      path: '/step2',
      name: 'Step 2',
      displayName: 'Entering Landmark-Pairs',
      shown: true,
      component: Step2,
      beforeEnter: checkIncVolSet
    },
    {
      meta: {
        shownInProgress: true,
        displayName: 'Save & Export Results',
      },
      path: '/step3',
      name: 'Step 3',
      displayName: 'Save & Export Results',
      shown: true,
      component: Step3,
      beforeEnter: checkIncVolSet
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ],
  mode: 'hash'
})
