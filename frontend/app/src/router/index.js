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
      component: () => import('@/components/toolbars/ToolbarStep1')
    },
    {
      path: '/step2',
      name: 'Step 2',
      component: () => import('@/components/toolbars/ToolbarStep2')
    },
    {
      path: '/step3',
      name: 'Step 3',
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
