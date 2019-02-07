import Vue from 'vue'
import Router from 'vue-router'

import store from '@/store'

import Step0 from '@/components/toolbars/ToolbarStep0'
import Step1 from '@/components/toolbars/ToolbarStep1'
import Step2 from '@/components/toolbars/ToolbarStep2'
import Step3 from '@/components/toolbars/ToolbarStep3'
import NotFound from '@/views/NotFound'

const checkRefVolIncVolSet = (_to, _from, next) => {
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
      component: Step0
    },
    {
      meta: {
        index: 0,
        shownInProgress: true,
        firstStep: true,
        displayName: '3D Anchoring',
      },
      path: '/step1',
      name: 'Step 1',
      displayName: '3D Anchoring',
      shown: true,
      component: Step1,
      beforeEnter: checkRefVolIncVolSet
    },
    {
      meta: {
        index: 1,
        shownInProgress: true,
        displayName: 'Entering Landmark-Pairs',
      },
      path: '/step2',
      name: 'Step 2',
      displayName: 'Entering Landmark-Pairs',
      shown: true,
      component: Step2,
      beforeEnter: checkRefVolIncVolSet
    },
    {
      meta: {
        index: 2,
        shownInProgress: true,
        lastStep: true,
        displayName: 'Save & Export Results',
      },
      path: '/step3',
      name: 'Step 3',
      displayName: 'Save & Export Results',
      shown: true,
      component: Step3,
      beforeEnter: checkRefVolIncVolSet
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ],
  mode: 'hash'
})
