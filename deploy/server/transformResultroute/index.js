const router = require('express').Router()
const bodyParser = require('body-parser')
const crypto = require('crypto')
const URL = require('url').URL
const cors = require('cors')

const allowCors = (process.env.ALLOW_CORS && !!JSON.parse(process.env.ALLOW_CORS)) || false
const IV_HOST = process.env.IV_HOST || 'https://dev-next-interactive-viewer.apps-dev.hbp.eu'
const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3000'

const map = new Map()
if (allowCors) {
  router.use(cors())
}

router.use(bodyParser.json())

const validateImageSource = (url) => /^precomputed\:\/\/http/.test(url)
const validateBody = ({ selectedIncomingVolume, selectedReferenceVolume, incTransformMatrix }) => 
  selectedIncomingVolume && selectedIncomingVolume.imageSource && validateImageSource(selectedIncomingVolume.imageSource)
  && selectedReferenceVolume && selectedReferenceVolume.imageSource && validateImageSource(selectedReferenceVolume.imageSource)
  && !!incTransformMatrix

const validateBodyV2 = ({ selectedIncomingVolumes, selectedReferenceVolume, incTransformMatrix }) => {
  if (!selectedIncomingVolumes) throw new Error(`selectedIncomingVolumes is not defined`)
  for (const selectedIncomingVolume of selectedIncomingVolumes) {
    if (!selectedIncomingVolume.imageSource) throw new Error(`selectedIncomingVolume does not have imageSource defined: ${JSON.stringify(selectedIncomingVolume)}`)
    if (!validateImageSource(selectedIncomingVolume.imageSource)) throw new Error(`selectedIncomingVolume.imageSource is not valid: ${selectedIncomingVolume.imageSource}`)
  }
  if (!incTransformMatrix) throw new Error(`incTransformMatrix is not defined`)
  return true
}
  
const url = `${IV_HOST}/?templateSelected=Big+Brain+%28Histology%29&parcellationSelected=Grey%2FWhite+matter&navigation=0_0_0_1__0.3140767216682434_-0.7418519854545593_0.4988985061645508_-0.3195493221282959__1922235.5293810747__-17266302_325772.375_-753549.125__271017.69911504426&pluginStates=http%3A%2F%2Flocalhost%3A3000%2FtransformResult%2Finteractive-viewer-plugin%2F06323f93e00bac8cd6926f5b05de212fec74dad8462f3dcc`

const getValidateBodyMdw = validateBodyFn => (req, res, next) => {
  const { body } = req
  try {
    const validateFlag = validateBodyFn(body)
    if (validateFlag) return next()
    else throw new Error(`ill formed body`)
  } catch (e) {
    return res.status(400).send(e.toString())
  }
}

const trimTrailingSlash = str => str.replace(/\/$/, '')

const setMap = ({ body, pluginStatesParam, map: setMapFnMap }) => new Promise((rs, rj) => {

  crypto.randomBytes(24, (err, buf) => {
    if (err) return rj(err.toString())
    const id = buf.toString('hex')

    // TODO implement timing out to avoid mem leak
    setMapFnMap.set(id, {
      date: Date.now(),
      data: body
    })
    const url = new URL(IV_HOST)
    url.searchParams.set('templateSelected', 'Big Brain (Histology)')
    url.searchParams.set('parcellationSelected', 'Grey/White matter')
    if (pluginStatesParam) url.searchParams.set('pluginStates', `${trimTrailingSlash(pluginStatesParam)}/${id}`)

    const { incTransformMatrix, translationFromCorner } = body
    if (incTransformMatrix.slice) {

      incTransformMatrix.slice(12, 15)
      const o = [0, 0, 0, 1]
      const po = [0.3140767216682434, -0.7418519854545593, 0.4988985061645508, -0.3195493221282959]
      const pz = 1922235.5293810747
      const p = incTransformMatrix.slice(12, 15).map((v, idx) => translationFromCorner && translationFromCorner[idx]
        ? v + translationFromCorner[idx]
        : v)
      const z = 271017.69911504426
      url.searchParams.set('navigation', [o.join('_'), po.join('_'), pz, p.join('_'), z].join('__'))
    }

    rs(url.toString())
  })
})

router.post('', getValidateBodyMdw(validateBody) , async (req, res) => {

  try {
    const { body } = req
    const respUrl = await setMap({
      body,
      pluginStatesParam: `${HOSTNAME}/transformResult/iv-plugin/`,
      map
    })

    // TODO deprecate. legacy method
    const [_, id] = /\/([0-9a-f]{1,})$/.exec(respUrl)
    res.status(200).json({
      id,
      url: respUrl
    })
  } catch (e) {
    res.status(500).send(e.toString())
  }
})

router.post('/v2', getValidateBodyMdw(validateBodyV2), async (req, res) => {

  try {
    const { body } = req
    const respUrl = await setMap({
      body,
      pluginStatesParam: `${HOSTNAME}/transformResult/iv-plugin-v2/`,
      map
    })

    // TODO use http redirect
    res.status(200).send(respUrl)
  } catch (e) {
    res.status(500).send(e.toString())
  }
})

/**
 * check result 
 * may need to be access controlled
 * or just disable in production
 */
router.get('/:resultId', (req, res) => {
  const { resultId } = req.params
  const result = map.get(resultId)
  if (result) {
    return res.status(200).json(result)
  } else {
    return res.status(404).send('Not found')
  }
})

router.use('/iv-plugin', cors(), (req, res, next) => {
  req.resultMap = map
  next()
}, require('./ivPlugin'))

router.use('/iv-plugin-v2', cors(), (req, res, next) => {
  req.resultMap = map
  next()
}, require("./ivPluginV2"))

module.exports = router