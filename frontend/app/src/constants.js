/* eslint-disable */

export const AGREE_COOKIE_KEY = `landmark-reg : agreed to cookie`

export const loginMethods = [{
  name: 'HBP',
  imgSrc: null,
  href: '/hbp-oidc/auth',
  disabled: true
},{
  name: 'ORCID',
  imgSrc: null,
  href: '/orcid-oidc/auth',
  disabled: false
}]

export const arrayBufferToBase64String = (arraybuffer) => {
  const bytes = new Uint8Array( arraybuffer )
  let binary = ''
  for (let i = 0; i < bytes.length; i ++){
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

export const IMAGE_SERVICE_NAME = `CHUNMA`
export const SEGMENTATION_EXPLANATION = `A segmentation nii file can be ingested differently to an image nii file`

export const getShader = (rgb) => `void main() {
  float x = toNormalized(getDataValue());
  emitRGB(vec3(x * ${rgb[0].toFixed(1)}, x * ${rgb[1].toFixed(1)}, x * ${rgb[2].toFixed(1)} ));
}`

export const LANDMARK_ICON_THRESHOLD = 10

export const REFERENCE_COLOR = `white`
export const UNPAIRED_COLOR = `#CCCCCC`
export const INCOMING_COLOR = `#FCDC00`
export const INACTIVE_ROW_OPACITY = 0.2

export const DEFAULT_BUNDLED_INCOMING_VOLUMES_0 = [
  {
    id: 'colin-1',
    name: 'Colin 27',
    imageSource: 'precomputed://https://neuroglancer.humanbrainproject.org/precomputed/JuBrain/v2.2c/colin27_seg',
    dim: [76, 94, 77].map(v => v * 2e6)
  }
]

export const DEFAULT_BUNDLED_INCOMING_VOLUMES_1 = [
  {
    id: 'inc-1',
    name: 'Nucleus subthalamicus (B20)',
    imageSource: 'precomputed://https://neuroglancer-dev.humanbrainproject.org/precomputed/landmark-reg/B20_stn_l/v10',
    dim: [
      16208000,
      13056000,
      9800000
    ]
  },
  {
    id: 'inc-2',
    name: 'Hippocampus unmasked',
    imageSource: 'precomputed://https://neuroglancer-dev.humanbrainproject.org/precomputed/landmark-reg/hippocampus-unmasked',
    dim: [
      57600000,
      57600000,
      52800000
    ]
  }
]

export const patchSliceViewPanel = function (sliceViewPanel) {
  const originalDraw = sliceViewPanel.draw
  sliceViewPanel.draw = function () {
    if (this.sliceView) {
      const viewportToDataEv = new CustomEvent('viewportToData', {
        bubbles: true,
        detail: {
          viewportToData: this.sliceView.viewportToData
        }
      })
      this.element.dispatchEvent(viewportToDataEv)
    }

    originalDraw.call(this)
  }
}

export const DEBOUNCE_TIMEOUT = 200

export const computeDeterminant = (matrix) => {
  if (!matrix) {
    return null
  }
  if (matrix.length === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
  } else {
    var res = 0
    for (var i = 0; i < matrix.length; i++) {
      var minor = []
      for (var j = 0; j < matrix.length - 1; j++) {
        minor[j] = matrix[j + 1].slice(0, i).concat(matrix[j + 1].slice(i + 1, matrix.length))
      }
      var sign = 1 - 2 * (i % 2)
      res += sign * matrix[0][i] * computeDeterminant(minor)
    }
    return res
  }
}

export const defaultXform = function (array) {
  return array
}

/**
 * Assuming 2 x 2 panel
 */
export const determineElement = function (element) {
  if (element.offsetTop < 5 && element.offsetLeft < 5) {
    return 0
  }
  if (element.offsetTop < 5 && element.offsetLeft > 5) {
    return 1
  }
  if (element.offsetTop > 5 && element.offsetLeft < 5) {
    return 2
  }
  if (element.offsetTop > 5 && element.offsetLeft > 5) {
    return 3
  }
  return null
}

export const getDefaultNehubaConfigLight = (sourceUrl) => {
  return {
    "configName": "BigBrain",
    "globals": {
      "hideNullImageValues": true,
      "useNehubaLayout": {
        "keepDefaultLayouts": false
      },
      "useNehubaMeshLayer": true,
      "rightClickWithCtrlGlobal": false,
      "zoomWithoutCtrlGlobal": false,
      "useCustomSegmentColors": true
    },
    "zoomWithoutCtrl": true,
    "hideNeuroglancerUI": true,
    "rightClickWithCtrl": true,
    "rotateAtViewCentre": true,
    "enableMeshLoadingControl": true,
    "zoomAtViewCentre": true,
    "restrictUserNavigation": true,
    "disableSegmentSelection": true,
    "dataset": {
      "imageBackground": [
        1,
        1,
        1,
        1
      ],
      "initialNgState": {
        "showDefaultAnnotations": true,
        "layers": {        
          " grey value: ": {
            "annotationColor": "#cccccc",
            "visible":false,
            "type": "image",
            // "source": "precomputed://http://imedv02.ime.kfa-juelich.de:8287/precomputed/BigBrainRelease.2015/8bit",
            "source": "precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/8bit",
            "transform": [
              [
                1,
                0,
                0,
                -70677184
              ],
              [
                0,
                1,
                0,
                -70010000
              ],
              [
                0,
                0,
                1,
                -58788284
              ],
              [
                0,
                0,
                0,
                1
              ]
            ]
          },
          "default": {
            "source": `${sourceUrl}`
          }
        },
        "perspectiveOrientation": [
          0.3140767216682434,
          -0.7418519854545593,
          0.4988985061645508,
          -0.3195493221282959
        ],
        "perspectiveZoom": 5e5
      }
    },
    "layout": {
      "views": "hbp-neuro",
      "planarSlicesBackground": [
        1,
        1,
        1,
        0
      ],
      "useNehubaPerspective": {
        "enableShiftDrag": false,
        "doNotRestrictUserNavigation": false,
        "perspectiveSlicesBackground": [
          1,
          1,
          1,
          1
        ],
        "removePerspectiveSlicesBackground": {
          "color": [
            1,
            1,
            1,
            1
          ],
          "mode": "=="
        },
        "perspectiveBackground": [
          1,
          1,
          1,
          1
        ],
        "fixedZoomPerspectiveSlices": {
          "sliceViewportWidth": 300,
          "sliceViewportHeight": 300,
          "sliceZoom": 63818.3562426177,
          "sliceViewportSizeMultiplier": 1
        },
        "mesh": {
          "backFaceColor": [
            1,
            1,
            1,
            1
          ],
          "removeBasedOnNavigation": true,
          "flipRemovedOctant": true
        },
        // "centerToOrigin": true,
        // "drawSubstrates": {
        //   "color": [
        //     0,
        //     0,
        //     0.5,
        //     0.15
        //   ]
        // },
        "drawZoomLevels": {
          "cutOff": 20000,
          "color": [
            0.5,
            0,
            0,
            0.15
          ]
        },
        "hideImages": false,
        "waitForMesh": false,
        // "restrictZoomLevel": {
        //   "minZoom": 1200000,
        //   "maxZoom": 3500000
        // }
      }
    }
  }
}

export const testBigbrain = {
  "configName": "BigBrain",
  "globals": {
    "hideNullImageValues": true,
    "useNehubaLayout": {
      "keepDefaultLayouts": false
    },
    "useNehubaMeshLayer": true,
    "rightClickWithCtrlGlobal": false,
    "zoomWithoutCtrlGlobal": false,
    "useCustomSegmentColors": true
  },
  "zoomWithoutCtrl": true,
  "hideNeuroglancerUI": true,
  "rightClickWithCtrl": true,
  "rotateAtViewCentre": true,
  "enableMeshLoadingControl": true,
  "zoomAtViewCentre": true,
  "restrictUserNavigation": true,
  "disableSegmentSelection": true,
  "dataset": {
    "imageBackground": [
      1,
      1,
      1,
      1
    ],
    "initialNgState": {
      "showDefaultAnnotations": true,
      "defaultAnnotationColor": "#cccccc",
      "layers": {
        " grey value: ": {
          "annotationColor": "#cccccc",
          "type": "image",
          // "source": "precomputed://http://imedv02.ime.kfa-juelich.de:8287/precomputed/BigBrainRelease.2015/8bit",
          "source": "precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/8bit",
          "transform": [
            [
              1,
              0,
              0,
              -70677184
            ],
            [
              0,
              1,
              0,
              -70010000
            ],
            [
              0,
              0,
              1,
              -58788284
            ],
            [
              0,
              0,
              0,
              1
            ]
          ]
        },
        " tissue type: ": {
          "annotationColor": "#cccccc",
          "type": "segmentation",
          // "source": "precomputed://http://imedv02.ime.kfa-juelich.de:8287/precomputed/BigBrainRelease.2015/classif",
          "source": "precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/classif",
          "segments": [
            "0"
          ],
          "selectedAlpha": 0,
          "notSelectedAlpha": 0,
          "transform": [
            [
              1,
              0,
              0,
              -70666600
            ],
            [
              0,
              1,
              0,
              -72910000
            ],
            [
              0,
              0,
              1,
              -58777700
            ],
            [
              0,
              0,
              0,
              1
            ]
          ]
        }
      },
      "navigation": {
        "pose": {
          "position": {
            "voxelSize": [
              21166.666015625,
              20000,
              21166.666015625
            ],
            "voxelCoordinates": [
              0, //-21.8844051361084,
              0, //16.288618087768555,
              0 //28.418994903564453
            ]
          }
        },
        "zoomFactor": 350000
      },
      "perspectiveOrientation": [
        0.3140767216682434,
        -0.7418519854545593,
        0.4988985061645508,
        -0.3195493221282959
      ],
      "perspectiveZoom": 1922235.5293810747
    }
  },
  "layout": {
    "views": "hbp-neuro",
    "planarSlicesBackground": [
      1,
      1,
      1,
      1
    ],
    "useNehubaPerspective": {
      "enableShiftDrag": false,
      "doNotRestrictUserNavigation": false,
      "perspectiveSlicesBackground": [
        1,
        1,
        1,
        1
      ],
      "removePerspectiveSlicesBackground": {
        "color": [
          1,
          1,
          1,
          1
        ],
        "mode": "=="
      },
      "perspectiveBackground": [
        1,
        1,
        1,
        1
      ],
      "fixedZoomPerspectiveSlices": {
        "sliceViewportWidth": 300,
        "sliceViewportHeight": 300,
        "sliceZoom": 563818.3562426177,
        "sliceViewportSizeMultiplier": 2
      },
      "mesh": {
        "backFaceColor": [
          1,
          1,
          1,
          1
        ],
        "removeBasedOnNavigation": true,
        "flipRemovedOctant": true
      },
      "centerToOrigin": true,
      "drawSubstrates": {
        "color": [
          0,
          0,
          0.5,
          0.15
        ]
      },
      "drawZoomLevels": {
        "cutOff": 200000,
        "color": [
          0.5,
          0,
          0,
          0.15
        ]
      },
      "hideImages": false,
      "waitForMesh": true,
      "restrictZoomLevel": {
        "minZoom": 1200000,
        "maxZoom": 3500000
      }
    }
  }
}

export const getRotationVec3 = (index) => {
  if ('export_nehuba' in window) {
    return index === 0
    ? {
        vec31: window.export_nehuba.vec3.fromValues(0, 0, 1),
        vec32: window.export_nehuba.vec3.fromValues(1, 0, 0)
      }
    : index === 1
      ? {
          vec31: window.export_nehuba.vec3.fromValues(0, 0, 1),
          vec32: window.export_nehuba.vec3.fromValues(0, 1, 0)
        }
      : index === 2
        ? {
            vec31: window.export_nehuba.vec3.fromValues(0, -1, 0),
            vec32: window.export_nehuba.vec3.fromValues(1, 0, 0)
          }
        : (console.warn('getRotationVec3 index > 2, returning null'), {
            vec31: null,
            vec32: null
          })
    
  } else {
    console.warn('export_nehuba is not present in window, has it not been exported?')
    return {
      vec31: null,
      vec32: null
    }
  }
}

export const incomingTemplateActiveOpacity = 0.8
export const incomingTemplateInactiveOpacity = 0.5


export const randomColor = () => {
  var letters = '0123456789ABCDEF'.split('')
  var color = '#'
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.round(Math.random() * 15)]
  }
  return color
}

export const generateId = (arr) => {
  var i = 1
  while(arr.find(obj => obj.id === i.toString()))
    i++
  return i.toString()
}

export const openInNewWindow = (url) => {
  const link = document.createElement('a')
  link.target = '_blank'
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const saveToFile = (data, mimeType, filename) => {
  var blob = new Blob([data], {type: mimeType})
  var link = document.createElement('a')
  var url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const loadFromFile = (file, contentHandler) => {
  var reader = new FileReader()
  reader.onload = function (event) {
    var fileContent = event.target.result;
    contentHandler(fileContent)
  }

  reader.readAsText(file, 'UTF-8')
}

export const openFileDialog = (type, acceptedMimeType, fileHandler = null, contentHandler = null) => {
  var file_selector = document.createElement('input')
  file_selector.setAttribute('type', type)
  file_selector.setAttribute('accept', acceptedMimeType)
  file_selector.setAttribute('display', 'none')

  file_selector.onchange = function () {
    var selectedFile = file_selector.files[0]
    document.body.removeChild(file_selector)

    if (fileHandler !== null) {
      fileHandler(selectedFile)
    }

    if (contentHandler !== null) {
      loadFromFile(selectedFile, contentHandler)
    }
  }

  document.body.appendChild(file_selector)
  file_selector.click()
}


export const testLandmarks = {
  referenceLandmarks: [{
    id: 'uniqueIdRefLm1',
    name: 'Reference Point 1',
    coord: [
      12.282029,
      0.325772375,
      -9.724908
    ]
  },{
    id: 'uniqueIdRefLm2',
    name: 'Reference Point 2',
    coord: [
      6.4210755,
      0.325772375,
      -16.609202
    ]
  },{
    id: 'uniqueIdRefLm3',
    name: 'Reference Point 3',
    coord: [
      9.398068,
      -2.74425175,
      -14.748581
    ]
  }],

  incomingLandmarks: [{
    id: 'uniqueIdIncLm1',
    name: 'Incoming Point 1',
    coord: [
      11.087669,
      6.56,
      9.320814
    ]
  },{
    id: 'uniqueIdIncLm2',
    name: 'Incoming Point 2',
    coord: [
      7.4451575,
      6.56,
      1.111573875
    ]
  },{
    id: 'uniqueIdIncLm3',
    name: 'Incoming Point 3',
    coord: [
      8.505292,
      5.0921215,
      5.6511205
    ]
  }],

  landmarkPairs: [{
      id: 'uniqueIdPair1',
      refId: 'uniqueIdRefLm1',
      incId: 'uniqueIdIncLm1',
      name: 'Land Mark Pair #1',
      active: true,
  },{
    id: 'uniqueIdPair2',
    refId: 'uniqueIdRefLm2',
    incId: 'uniqueIdIncLm2',
    name: 'Land Mark Pair #2',
    active: true,
  }, {
      id:'uniqueIdPair3',
      refId: 'uniqueIdRefLm3',
      incId: 'uniqueIdIncLm3',
      name: 'Land Mark Pair #3',
      active: true,
  }], 
}

export const oldJson = [
  {
    "target_point": [
      63.0988757879829,
      74.72,
      47.71491469268696
    ],
    "source_point": [
      11.402186052260548,
      8.618904583495219,
      4.0600000000000005
    ],
    "active": true,
    "name": "most medial, inferior point",
    "colour": "#8dd3c7"
  },
  {
    "target_point": [
      56.5175473767443,
      74.72,
      52.38977784538801
    ],
    "source_point": [
      4.080846718801228,
      4.466383960830783,
      4.0600000000000005
    ],
    "active": true,
    "name": "most lateral, superior point",
    "colour": "#ffffb3"
  },
  {
    "target_point": [
      62.169714975306725,
      80,
      49.472331399788615
    ],
    "source_point": [
      10.224,
      6.752,
      9.74
    ],
    "active": true,
    "name": "most anterior point",
    "colour": "#bebada"
  },
  {
    "target_point": [
      58.082316918797304,
      71.12,
      50.44257820806931
    ],
    "source_point": [
      7.534571293784262,
      6.616700212660056,
      0.3
    ],
    "active": true,
    "name": "most posterior point",
    "colour": "#fb8072"
  },
  {
    "target_point": [
      59.72876312018893,
      75.5,
      51.69494171858955
    ],
    "source_point": [
      7.443257756953321,
      4.854800116378677,
      4.84
    ],
    "active": true,
    "name": "point on superior internal edge",
    "colour": "#80b1d3"
  }
]

export const annotationColorBlur = `grey`
export const annotationColorFocus = `yellow`

export const UPLOAD_URL = process.env.UPLOAD_URL || `http://ime178.ime.kfa-juelich.de:7300`

export const processImageMetaData = ({ visibility = 'public', name = 'Untitled', links = {}, extra = {}, uploadUrl } = {}) => {
  const { fileName } = extra
  const id = `${visibility}/${fileName}`
  const imageSource = links.normalized && `precomputed://${uploadUrl}${links.normalized}`
  const payload = {
    visibility,
    name,
    links,
    extra
  }

  const { neuroglancer = {} } = extra
  const { size, resolution } = neuroglancer
  const dim = size && resolution
    ? [0, 1, 2].map(v => size[v] * resolution[v])
    : null
  
  return {
    payload,
    name,
    visibility,
    extra,
    imageSource,
    id,
    dim
  }
}

export const transposeMat4 = (incM) => [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => incM[ c * 4 + r ]))

export const makeHtmlFragmentForNifti = ({ nifti, warnings }) => {

  const returnHtmlArray = []

  if (warnings && warnings.forEach) {
    warnings.forEach(warning => {
      returnHtmlArray.push(
        `<div class="alert alert-warning">${warning}</div>`
      )
    })
  }
  for (let key in nifti) {
    if (nifti[key])
      returnHtmlArray.push(
        `<div class="text-left">${key}<div class="text-muted">${nifti[key]}</div></div>`
      )  
  }

  return returnHtmlArray.join('\n')
}