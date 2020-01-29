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

const getRemoveLayer = () => (imageSource, index) => `
window.interactiveViewer.viewerHandle.removeLayer({
  name: '${getLayerName({ index, imageSource })}'
})
`

const getScript = ({ name, /*imageSource*/imageSources, shader, opacity, ngMatrix }) => `
(() => {

  let loadLayerTimer = setInterval(() => {
    if (window.viewer) {

      clearInterval(loadLayerTimer)
      ${imageSources.map(getLoadLayerScript({ opacity, shader, ngMatrix }))}
    }
  }, 1000)

  let cleanUpTimer = setInterval(() => {
    if (window.interactiveViewer.pluginControl['${name}']) {
      clearInterval(cleanUpTimer)

      window.interactiveViewer.pluginControl['${name}'].onShutdown(() => {
        console.log('cleaning up')
        ${imageSources.map(getRemoveLayer())}
      })
    }
  }, 500)
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

router.get('/:resultId', (req, res) => {

  const { resultMap: map } = req
  const { resultId } = req.params
  const obj = map.get(resultId)

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
      scriptURL: `${rootPath}script/${scriptId}`
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