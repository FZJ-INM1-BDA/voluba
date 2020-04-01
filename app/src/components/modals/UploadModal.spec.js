import UploadModal from './UploadModal.vue'
import { expect } from 'chai'
import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import 'mocha'

import '../../dep'

let localVue 
let store 
let wrapper 

describe('UploadModal', () => {

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        dataSelectionStore: {
          namespaced: true,
          state: {
            uploadUrl: 'http://localhost:7999/'
          }
        }
      }
    })
    wrapper = shallowMount(UploadModal, {
      localVue,
      store
    })
  })

  afterEach(() => {
    
  })
  it('has uploadUrl defined on mount', () => {
    expect(!!wrapper.vm.uploadUrl).to.be.true
  })
})