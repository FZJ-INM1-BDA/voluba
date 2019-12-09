const storeUtil = require('../util')
const { USER_DIR_VOLUBA_DIR_NAME } = require('../constants')
const { WORKFLOW_VOLUBA_DIR_NAME } = require('./constants')

const initUser = async ({ user }) => {
  const handle = await storeUtil.getSeafileHandle({ user })
  await handle.mkdir({ dir: `/${USER_DIR_VOLUBA_DIR_NAME}/${WORKFLOW_VOLUBA_DIR_NAME}` })
}

module.exports = {
  initUser
}