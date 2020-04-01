// n.b. default import is required for sinon stubs to work properly
const storeUtil = require('../util')
const { USER_DIR_VOLUBA_DIR_NAME } = require('../constants')
const { WORKFLOW_VOLUBA_DIR_NAME, AUTOSAVE_FILENAME } = require('./constants')
const router = require('express').Router()
const bodyParser = require('body-parser')
const uuidv4 = require('uuid/v4')
const { Readable } = require('stream')

/**
 * List all workflows for the specific user
 */
router.get('/', async (req, res) => {
  const { user } = req
  const handle = await storeUtil.getSeafileHandle({ user })
  const ls = await handle.ls({ dir: `/${USER_DIR_VOLUBA_DIR_NAME}/${WORKFLOW_VOLUBA_DIR_NAME}` })
  res.status(200).json(ls)
})

/**
 * Periodic autosave a work
 */
router.post('/autosave', bodyParser.json(), async (req, res) => {
  const { user, body } = req
  const readStream = new Readable()
  readStream.path = AUTOSAVE_FILENAME
  readStream.push(JSON.stringify(body, null, 2))
  readStream.push(null)
  const handle = await storeUtil.getSeafileHandle({ user })
  await handle.uploadFile({ readStream, filename: AUTOSAVE_FILENAME}, { dir: `/${USER_DIR_VOLUBA_DIR_NAME}/${WORKFLOW_VOLUBA_DIR_NAME}` })
  res.status(200).end()
})

/**
 * Permanently save a work
 */
router.post('/', bodyParser.json(), async (req, res) => {
  const id = uuidv4()
  const { user, body } = req
  const readStream = new Readable()
  readStream.path = `${id}.json`
  readStream.push(JSON.stringify(body, null, 2))
  readStream.push(null)
  const handle = await storeUtil.getSeafileHandle({ user })
  await handle.uploadFile({ readStream, filename: `${id}.json`}, { dir: `/${USER_DIR_VOLUBA_DIR_NAME}/${WORKFLOW_VOLUBA_DIR_NAME}` })
  res.status(200).send(id)
})

/**
 * Get workflow with a specific ID
 */
router.get('/:workflowId', async (req, res) => {

  const { workflowId } = req.params
  const { user } = req
  const handle = await storeUtil.getSeafileHandle({ user })
  try{
    const file = await handle.readFile({ dir: `/${USER_DIR_VOLUBA_DIR_NAME}/${WORKFLOW_VOLUBA_DIR_NAME}/${workflowId}.json` })
    const parsedJson = JSON.parse(file)
    res.status(200).json(parsedJson)
  }catch(e){
    console.error(e)
    res.status(500).send(e.toString())
  }
  
})

/**
 * Delete a workflow witha  specific ID
 */
router.delete('/:workflowId', async (req, res) => {
  res.status(405).send(`Delete not yet implemented`)
})

module.exports = router
