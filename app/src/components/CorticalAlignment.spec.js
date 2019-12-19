import CorticalAlignment from './CorticalAlignment.vue'
import { assert, expect } from 'chai'
import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import { spy } from 'sinon'
import 'mocha'

import '../dep'

let localVue 
let store 
let wrapper 

const incomingVolumes = [
  {
    "name": "hOc1_ar_NMDA_segmentation_downscaled-equivolumetric-depth",
    "visibility": "private",
    "links": {
      "normalized": "/nifti/8f2df23bbf81473c0b247570dc24e18d7397a2d3bf8da11ea61d0db2/hOc1_ar_NMDA_segmentation_downscaled-equivolumetric-depth"
    },
    "extra": {
      "fileName": "hOc1_ar_NMDA_segmentation_downscaled-equivolumetric-depth.nii.gz",
      "fileSize": 553792,
      "fileSizeUncompressed": 5232352,
      "uploaded": "2019-06-25T09:47:47.725740Z",
      "nifti": {
        "niftiVersion": "Nifti1",
        "byteOrder": "LITTLE_ENDIAN",
        "size": [
          109,
          120,
          100
        ],
        "voxelSize": [
          0.0999755859375,
          0.0999755859375,
          0.0999755859375
        ],
        "spatialUnits": "Millimeter",
        "temporalUnits": "Unknown",
        "dataType": "float",
        "slope": 0,
        "calMax": 1,
        "description": "Equivolumetric cortical depth computed with highres-cortex",
        "coordinateSystem": "SCANNER_ANAT",
        "intentName": "Equivol. depth",
        "affineMatrix": [
          [
            0.09999999403953552,
            0,
            0,
            -5.3349995613098145
          ],
          [
            0,
            0.09999999403953552,
            0,
            -5.909999847412109
          ],
          [
            0,
            0,
            0.09999999403953552,
            -4.909999847412109
          ],
          [
            0,
            0,
            0,
            1
          ]
        ]
      },
      "data": {
        "minValue": "0.0",
        "maxValue": "1.0"
      },
      "neuroglancer": {
        "type": "image",
        "data_type": "float32",
        "size": [
          109,
          120,
          100
        ],
        "resolution": [
          99975.5859375,
          99975.5859375,
          99975.5859375
        ],
        "transform": [
          [
            1.000244140625,
            0,
            0,
            -5384987.354278564
          ],
          [
            0,
            1.000244140625,
            0,
            -5959987.640380859
          ],
          [
            0,
            0,
            1.000244140625,
            -4959987.640380859
          ],
          [
            0,
            0,
            0,
            1
          ]
        ]
      },
      "warnings": []
    },
    "id":"private/hOc1_ar_NMDA_segmentation_downscaled-equivolumetric-depth"
  }
]

import nonLinearStore from '../store/nonLinearStore'
import landmarksStore from '../store/landmarksStore'
import nehubaStore from '../store/nehubaStore'

const selectDepthMapSpy = spy(nonLinearStore.actions, 'selectDepthMap')

describe('CorticalAlignment', () => {

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        nonLinearStore,
        landmarksStore,
        nehubaStore,
        dataSelectionStore: {
          namespaced: true,
          state: {
            incomingVolumes,
            uploadUrl: 'http://localhost:7999/'
          }
        }
      }
    })
    wrapper = shallowMount(CorticalAlignment, {
      localVue,
      store
    })
  })

  afterEach(() => {
    selectDepthMapSpy.resetHistory()
  })

  it(`closing should close`, () => {
    const closeSpy = spy(wrapper.vm, 'close')
    wrapper.vm.close()
    assert(closeSpy.called)
  })

  it(`selecting depth map results action call to nonlinear/selectDepthMap`, async () => {

    const selectEl = wrapper.find('select#select-depth-map')
    const selectOpts = wrapper.findAll('select#select-depth-map option:not([disabled])')
    selectOpts.at(0).element.selected = true
    selectEl.trigger('change')
    
    const depthMap = incomingVolumes[0]
    
    assert(selectDepthMapSpy.called)
    const [store, arg] = selectDepthMapSpy.getCall(0).args
    expect(arg).to.be.deep.equal({ depthMap })
  })

  it('selecting depth map results in changes to selectedDepthMapId', () => {

    const selectEl = wrapper.find('select#select-depth-map')
    const selectOpts = wrapper.findAll('select#select-depth-map option:not([disabled])')
    selectOpts.at(0).element.selected = true
    selectEl.trigger('change')
    
    const depthMap = incomingVolumes[0]
    
    expect(wrapper.vm.selectedDepthMapId).to.equal(depthMap.id)
  })

  it('has incTransformMatrix defined on mount', () => {
    expect(!!wrapper.vm.incTransformMatrix).to.be.true
  })

  it('has uploadUrl defined on mount', () => {
    expect(!!wrapper.vm.uploadUrl).to.be.true
  })
})