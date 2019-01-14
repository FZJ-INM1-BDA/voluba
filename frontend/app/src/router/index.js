import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/select'
    },
    {
      path: '/select',
      name: 'Data Selection',
      component: () => import('@/components/toolbars/DataSelection')
    },
    {
      path: '/landmarks',
      name: 'Landmark Selection',
      component: () => import('@/components/toolbars/LandmarkPairs')
    },
    {
      path: '/export',
      name: 'Save & Export',
      component: () => import('@/components/toolbars/SaveExport')
    },
    {
      path: '*',
      name: 'NotFound',
      component: () => import('@/views/NotFound')
    }
  ],
  mode: 'hash'
})
