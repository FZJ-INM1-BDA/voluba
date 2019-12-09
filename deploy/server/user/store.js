const { Seafile } = require('hbp-seafile')
const { USER_DIR_VOLUBA_CONFIG_FILENAME, USER_DIR_VOLUBA_DIR_NAME } = require('./constants')
const { initUser: workflowInitUser } = require('./workflow/store')

// adhoc getting seafile handle with user access token
// normally, user.seafileHandle should be populated
const getSeafileHandle = async ({ user }) => {
  console.log(`getting sea file handle`)
  const { accessToken, seafileHandle, type } = user
  if (type !== 'hbp-oidc-v2') throw new Error(`cannot save user data for non hbp v2 accounts`)
  if (seafileHandle) return seafileHandle
  const handle = new Seafile({ accessToken })
  await handle.init()
  return handle
}

const masterInitUser = async ({ user }) => {
  const handle = new Seafile() //await getSeafileHandle() || 
  await handle.mkdir({ dir: `/${USER_DIR_VOLUBA_DIR_NAME}` })
  await workflowInitUser({ user })
}

const getConfig = async ({ user }) => {
  const handle = new Seafile() //await getSeafileHandle() || 
  try {
    const file =  await handle.readFile({ dir: `/${USER_DIR_VOLUBA_CONFIG_FILENAME}` })
    return file
  } catch (e) {
    await masterInitUser({ user })
    const file = await  handle.readFile({ dir: `/${USER_DIR_VOLUBA_CONFIG_FILENAME}` })
    return file
  }
}

module.exports = {
  masterInitUser,
  getSeafileHandle,
  getConfig
}