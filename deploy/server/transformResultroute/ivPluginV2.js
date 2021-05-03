const router = require('express').Router()
const OTP = process.env.VOLUBA_ONE_TIME_PASS
  ? JSON.parse(process.env.VOLUBA_ONE_TIME_PASS)
  : true
const crypto = require('crypto')

const scriptMap = new Map()
const templateMap = new Map()

const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3000'

const rootPath = `${HOSTNAME}/transformResult/iv-plugin-v2/`

//TODO sanitize!!!!

const getTemplate = ({ error }={}) => `
<div class="p-2">
  This is a compainion plugin for the interactive viewer.
  ${error ? '<br />' + error : ''}
</div>
`

const getCombinationBasedOnIdx = idx => [
  (1.0 - ( idx % 3 === 0 ? 0.0 : 0.1)),
  (1.0 - ( (idx + 1) % 3 === 0 ? 0.0 : 0.1 )),
  (1.0 - ( (idx + 2) % 3 === 0 ? 0.0 : 0.1 )),
]

const getDefaultShader = idx => `
void main(){\
  float x = toNormalized(getDataValue());
  if (x < 0.05) {
    emitTransparent();
  } else if (x > 0.95){
    emitTransparent();
  } else {
    emitRGB(vec3(${getCombinationBasedOnIdx(idx)[0].toFixed(1)} * x, ${getCombinationBasedOnIdx(idx)[1].toFixed(1)} * x, ${getCombinationBasedOnIdx(idx)[2].toFixed(1)} * x ));
  }
}
`

const getLayerName = ({ index }) => `VoluBA volume - layer ${index}`
function getLayerNameS() {
  return `VoluBA volume - layer ${this.index || 'unknown idx'}`
}

const getLoadLayerScript = ({ opacity, shader, ngMatrix }) => (imageSource, index) => `
window.interactiveViewer.viewerHandle.loadLayer({
  '${getLayerName({ index, imageSource })}': {
    source: '${imageSource}',
    shader: \`${shader || getDefaultShader(index)}\`,
    opacity: ${opacity},
    transform: ${JSON.stringify(ngMatrix)}
  }
})
`

function loadLayer(imageSource, index) {
  window.interactiveViewer.viewerHandle.loadLayer({
    [getLayerNameS.call({ index })]: {
      source: imageSource,
      shader: this.shader || defaultShader,
      opacity: this.opacity || 0.5,
      transform: this.ngMatrix
    }
  })
}

function removelayer(imageSource, index) {
  window.interactiveViewer.viewerHandle.removeLayer({
    name: getLayerNameS.call({ index })
  })
}

const getRemoveLayer = () => (imageSource, index) => `
window.interactiveViewer.viewerHandle.removeLayer({
  name: '${getLayerName({ index, imageSource })}'
})
`

// to be toString()'ed
async function getVolumeXform(imageSource, index ) {

  const { id: fId, ['@id']: fAId, name: fName } = from
  const { id: tId, ['@id']: tAId, name: tName } = to

  const { vec3, mat4 } = window.export_nehuba
  const xformMatrix = mat4.fromValues(
    ...this.ngMatrix.reduce((acc, curr) => acc.concat(curr), [])
  )

  mat4.transpose(xformMatrix, xformMatrix)

  const url = imageSource.replace(/^precomputed:\/\//, '') + '/info'
  const { scales } = await fetch(url).then(res => res.json())
  const { size, resolution } = scales[0]
  const f = size.map((s, i) => s * resolution[i])
  
  const srcPts = [
    [0,    0,    0],
    [0,    f[1], 0],
    [0,    0,    f[2]],
    // [0,    f[1], f[2]],
    // [f[0], 0,    0],
    [f[0], f[1], 0],
    [f[0], 0,    f[2]],
    [f[0], f[1], f[2]],
  ]
  console.log(srcPts)

  const fromCoords = srcPts.map(xyz => 
    vec3.transformMat4(vec3.create(), xyz, xformMatrix)
  ).map(v => Array.from(v).map(x => x / 1e6))

  let toCoords
  try {

    toCoords = await fetch('https://hbp-spatial-backend.apps.hbp.eu/v1/transform-points', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        source_space: 'Big Brain (Histology)',
        target_space: tName,
        source_points: fromCoords
      })
    })
      .then(res => res.text())
      .then(text => JSON.parse(
        text.replace(/NaN/g, 'null')
      )) // non linear transformation end point sometiemes return NaN, which is not JSON compliant
      .then(({ target_points }) => target_points)
  } catch (e) {
    console.error(e)
    return
  }

  console.log({
    fromCoords,
    toCoords
  })

  const {
    transformation_matrix,
    inverse_matrix
  } = await fetch(`https://voluba-linear-backend.apps.hbp.eu/api/least-squares`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      source_image: fName,
      target_image: tName,
      landmark_pairs: toCoords
        .filter(toCoord => toCoord.every(v => !!v))
        .map((toCoord, idx) => ({
          active: true,
          colour: true,
          name: idx.toString(),
          source_point: fromCoords[idx],
          target_point: toCoord,
        })
      ),
      transformation_type: 'affine' // rigid | rigid+reflection | similarity | similarity+reflection | affine
    })
  }).then(res => res.json())

  console.log({
    transformation_matrix, inverse_matrix
  })
  const newXform = mat4.fromValues(
    ...inverse_matrix.reduce((acc, curr, rowIdx) => acc.concat(
      curr.map((v, colIdx) => rowIdx < 3 && colIdx === 3 ? v * 1e6 : v )
    ), [])
  )
  mat4.transpose(xformMatrix, xformMatrix)

  console.log({
    xformMatrix,
    newXform
  })
  // mat4.transpose(newXform, newXform)
  const result = mat4.mul(mat4.create(), xformMatrix, newXform)

  return [
    Array.from(result.slice(0, 4)),
    Array.from(result.slice(4, 8)),
    Array.from(result.slice(8, 12)),
    Array.from(result.slice(12, 16))
  ]
}

const getScript = ({ name, /*imageSource*/imageSources, shader, opacity, ngMatrix }) => `
(async () => {
  
  // wait for the viewer to be loaded
  await new Promise((rs, rj) => {
    const intervalId = setInterval(() => {
      if (!!window.viewer) {
        rs()
        clearInterval(intervalId)
      }
    }, 1000)
  })

  const onDestroyCb = []
  const imageSources = ${JSON.stringify(imageSources)}
  const getLayerNameS = ${getLayerNameS.toString()}
  const defaultShader = 'void main(){ float x = toNormalized(getDataValue()); if (x < 0.1) { emitTransparent(); } else { emitRGB(vec3(1.0 * x, x * 0., 0. * x )); } }'

  const validTmplIdSet = new Set([
    'minds/core/referencespace/v1.0.0/7f39f7be-445b-47c0-9791-e971c0b6d992', // colin 27
    'minds/core/referencespace/v1.0.0/dafcffc5-4826-4bf1-8ff6-46b8a31ff8e2', // mni152 2009c
    'minds/core/referencespace/v1.0.0/a1655b99-82f1-420f-a3c2-fe80fd4c8588' // big brain
  ])

  ${imageSources.map(getLoadLayerScript({ opacity, shader, ngMatrix }))}

  let cleanUpTimer = setInterval(() => {
    if (window.interactiveViewer.pluginControl['${name}']) {
      clearInterval(cleanUpTimer)

      window.interactiveViewer.pluginControl['${name}'].onShutdown(() => {
        console.log('cleaning up')
        while (onDestroyCb.length) onDestroyCb.pop()()
        ${imageSources.map(getRemoveLayer())}
      })
    }
  }, 500)

  // such a mess
  onDestroyCb.push(() => {
    imageSources.forEach(
      ${removelayer.toString()}
    )
  })

  // subscribe to template change
  let currTmplName, currTmplId
  const s = interactiveViewer.metadata.selectedTemplateBSubject.subscribe(({ ['@id']:id, name }) => {
    if (id === currTmplId) return
    
    // if current id is defined, do clean up, calculate transform, etc
    if (!!currTmplId) {
      ${imageSources.map(getRemoveLayer())}

      // if new layer is not a valid layer, do not proceed
      if (!validTmplIdSet.has(id)) return

      const from = {
        name: currTmplName,
        id: currTmplId,
        ['@id']: currTmplId
      }

      const to = {
        name,
        id,
        ['@id']: id
      }

      Promise.all(
        imageSources.map(
          (${getVolumeXform.toString()}).bind({ ngMatrix: ${JSON.stringify(ngMatrix)} })
        )
      ).then(xforms => {
        imageSources.forEach((imageSource, idx ) => {
          (${loadLayer.toString()}).call({ ngMatrix: xforms[idx] }, imageSource, idx)

        })
      })
    }

    // lastly set current tmpl name and id to new tmpl name and id
    currTmplName = name
    currTmplId = id
  })
  onDestroyCb.push(() => s.unsubscribe())
})()
`

router.get('/script/:scriptId', (req, res) => {
  const { scriptId } = req.params
  if (scriptId === '0') {
    res.setHeader('Content-type', 'application/javascript')
    res.status(200).send('')
  }
  const scriptTxt = scriptMap.get(scriptId)
  if (scriptTxt) {
    res.setHeader('Content-type', 'application/javascript')
    if (OTP) scriptMap.delete(scriptId)
    res.status(200).send(scriptTxt)
  } else {
    res.status(404).end()
  }
})

router.get('/template/:templateId', (req, res) => {
  const { templateId } = req.params
  const templateText = templateMap.get(templateId)
  if (templateText) {
    res.setHeader('Content-type', 'text/html; charset=UTF-8')
    if (OTP) scriptMap.delete(templateId)
    res.status(200).send(templateText)
  } else {
    res.status(404).end()
  }
})

router.get('/:resultId', async (req, res) => {

  const { resultMap: map } = req
  const { resultId } = req.params
  const obj = await map.get(resultId)

  /**
   * single use tokenid
   */
  const displayName = 'VoluBA plugin for interactive viewer'
  if (obj) {
    if (OTP) map.delete(resultId)
    const { date, data } = obj
    const { /*selectedIncomingVolume*/ selectedIncomingVolumes, selectedReferenceVolume, shader, opacity, incTransformMatrix } = data
    const ngMatrix = [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => incTransformMatrix[ c * 4 + r ]))
    const imageSources = selectedIncomingVolumes.map(({ imageSource }) => imageSource)
    const name = `fzj.xg.landmark-reg-${resultId}`

    let scriptId
    try {
      scriptId = crypto.randomBytes(24).toString('hex')
    } catch (e) {
      console.warn(`crypto error, fallback of resultId used`)
      scriptId = resultId
    }
    scriptMap.set(scriptId, getScript({ name, /* imageSource, */ imageSources, ngMatrix, opacity, shader }))

    let templateId
    try {
      templateId = crypto.randomBytes(24).toString('hex')
    } catch (e) {
      console.warn(`crypto error, fallback of resultId used`)
      templateId = resultId
    }
    templateMap.set(templateId, getTemplate())

    return res.status(200).json({
      name,
      displayName,
      templateURL: `${rootPath}template/${templateId}`,
      scriptURL: `${rootPath}script/${scriptId}`,
      persistency: true
    })
  } else {
    const name = `fzj.xg.landmark-reg-not-found`
    return res.status(200).json({
      name,
      displayName,
      template: getTemplate({ error: 'One time use token expired.' }),
      scriptURL: `${rootPath}script/0`
    })
  }
})

module.exports = router
