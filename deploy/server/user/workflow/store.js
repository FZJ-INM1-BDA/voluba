const { Seafile } = require('hbp-seafile')
const { getSeafileHandle } = require('../store')
const { USER_DIR_VOLUBA_DIR_NAME } = require('../constants')
const { WORKFLOW_VOLUBA_DIR_NAME } = require('./constants')

const initUser = async ({ user }) => {
  const handle = new Seafile() // await getSeafileHandle({ user })
  await handle.mkdir({ dir: `/${USER_DIR_VOLUBA_DIR_NAME}/${WORKFLOW_VOLUBA_DIR_NAME}` })
}

module.exports = {
  initUser
}