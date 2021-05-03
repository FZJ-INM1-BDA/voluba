import DataSelection from './DatasetSelection.vue'
import { expect } from 'chai'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import 'mocha'

import '../dep'

let localVue 
let store 
let wrapper
const name = 'resume-workflow-component'

describe('DataSelection', () => {
  beforeEach(() => {

    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        authStore: {
          namespaced: true,
          getters: {
            isHbpOidcV2: function () {
              return false
            }
          }
        },
        dataSelectionStore: {
          namespaced: true,
          state: {
            uploadUrl: 'http://localhost:7999/'
          },
          actions: {
            updateIncVolumes: () => {},
            updateIncVolumes: () => {}
          },
          getters: {
            selectedReferenceVolume: function () {
              return null
            },
            selectedIncomingVolume: function () {
              return null
            }
          }
        }
      },
      state: {
        allowUpload: true,
        experimentalFeatures: {
          resumeWorkflow: true
        }
      },
      actions: {
        openModal: () => {},
        modalMessage: () => {},
        sudoSetState: () => {}
      }
    })
    wrapper = mount(DataSelection, {
      localVue,
      store,
      stubs: {
        UploadVolumeComponent: true,
        InfoPopover: true,
        IncomingVolumeSelection: true,
      }
    })
  })

  it(`${name} should exist`, () => {
    expect(
      wrapper.findComponent({ name }).exists()
    ).to.equal(true)
  })

  it(`on ${name} emit destroy-me, emit destroy-me`, async () => {
    expect(!!(wrapper.emitted()['destroy-me'])).to.equal(false)
    wrapper.findComponent({ name }).vm.$emit('destroy-me')
    await wrapper.vm.$nextTick()
    expect(!!(wrapper.emitted()['destroy-me'])).to.equal(true)
  })
})
