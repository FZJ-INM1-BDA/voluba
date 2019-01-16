/* eslint-disable */

exports.getShader = (rgb) => `void main() {
  float x = toNormalized(getDataValue());
  emitRGB(vec3(x * ${rgb[0].toFixed(1)}, x * ${rgb[1].toFixed(1)}, x * ${rgb[2].toFixed(1)} ));
}`

exports.patchSliceViewPanel = function (sliceViewPanel) {
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

exports.defaultXform = function (array) {
  return array
}

/**
 * Assuming 2 x 2 panel
 */
exports.determineElement = function (element) {
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

exports.getDefaultNehubaConfigLight = (sourceUrl) => {
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
          "default": {
            "type": "image",
            "source": `${sourceUrl}`,
          }
        }
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
        "waitForMesh": false,
        "restrictZoomLevel": {
          "minZoom": 1200000,
          "maxZoom": 3500000
        }
      }
    }
  }
}

exports.testBigbrain = {
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
          "type": "image",
          "source": "precomputed://http://imedv02.ime.kfa-juelich.de:8287/precomputed/BigBrainRelease.2015/8bit",
          // "source": "precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/8bit",
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
          "type": "segmentation",
          "source": "precomputed://http://imedv02.ime.kfa-juelich.de:8287/precomputed/BigBrainRelease.2015/classif",
          // "source": "precomputed://https://neuroglancer.humanbrainproject.org/precomputed/BigBrainRelease.2015/classif",
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

exports.getRotationVec3 = (index) => {
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

exports.incomingTemplateActiveOpacity = 0.8
exports.incomingTemplateInactiveOpacity = 0.5


exports.randomColor = () => {
  var letters = '0123456789ABCDEF'.split('')
  var color = '#'
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.round(Math.random() * 15)]
  }
  return color
}