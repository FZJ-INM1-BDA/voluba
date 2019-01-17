import Vue from 'vue'
import Router from 'vue-router'

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
      component: () => import('@/components/toolbars/ToolbarStep1')
    },
    {
      path: '/step2',
      name: 'Step 2',
      shown: true,
      displayName: 'Entering Landmark-Pairs',
      component: () => import('@/components/toolbars/ToolbarStep2')
    },
    {
      path: '/step3',
      name: 'Step 3',
      shown: true,
      displayName: 'Save & Export Results',
      component: () => import('@/components/toolbars/ToolbarStep3')
    },
    {
      path: '*',
      name: 'NotFound',
      component: () => import('@/views/NotFound')
    }
  ],
  mode: 'hash'
})
