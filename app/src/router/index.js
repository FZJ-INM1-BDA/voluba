import Vue from 'vue'
import Router from 'vue-router'

import store from '@/store'

import Step0 from '@/components/toolbars/ToolbarStep0'
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
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ],
  mode: 'hash'
})
