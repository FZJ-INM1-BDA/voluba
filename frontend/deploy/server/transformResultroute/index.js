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

const url = `${IV_HOST}/?templateSelected=Big+Brain+%28Histology%29&parcellationSelected=Grey%2FWhite+matter&navigation=0_0_0_1__0.3140767216682434_-0.7418519854545593_0.4988985061645508_-0.3195493221282959__1922235.5293810747__-17266302_325772.375_-753549.125__271017.69911504426&pluginStates=http%3A%2F%2Flocalhost%3A3000%2FtransformResult%2Finteractive-viewer-plugin%2F06323f93e00bac8cd6926f5b05de212fec74dad8462f3dcc`

router.post('', (req, res) => {
  const { body } = req
  if (!validateBody(body)) {
    return res.status(400).send('ill formed body')
  }

  /**
   * implement timeout collection
   */
  crypto.randomBytes(24, (err, buf) => {
    if (err) 
      return res.status(500).send(JSON.stringify(err))
    const id = buf.toString('hex')
    map.set(id, {
      date: Date.now(),
      data: body
    })
    const url = new URL(IV_HOST)
    url.searchParams.set('templateSelected', 'Big Brain (Histology)')
    url.searchParams.set('parcellationSelected', 'Grey/White matter')
    url.searchParams.set('pluginStates', `${HOSTNAME}/transformResult/iv-plugin/${id}`)
    res.status(200).json({ id, url: url.toString() })
  })
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

module.exports = router