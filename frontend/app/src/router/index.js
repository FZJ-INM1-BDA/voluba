import Vue from 'vue'
import Router from 'vue-router'

import Step1 from '@/components/toolbars/ToolbarStep1'
import Step2 from '@/components/toolbars/ToolbarStep2'
import Step3 from '@/components/toolbars/ToolbarStep3'
import NotFound from '@/views/NotFound'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/step1'
    },
    {
      path: '/step1',
      name: 'Step 1',
      shown: true,
      displayName: 'Data Selection & 3D Anchoring',
      component: Step1
    },
    {
      path: '/step2',
      name: 'Step 2',
      shown: true,
      displayName: 'Entering Landmark-Pairs',
      component: Step2
    },
    {
      path: '/step3',
      name: 'Step 3',
      shown: true,
      displayName: 'Save & Export Results',
      component: Step3
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ],
  mode: 'hash'
})
