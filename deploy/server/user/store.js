const { USER_DIR_VOLUBA_CONFIG_FILENAME, USER_DIR_VOLUBA_DIR_NAME } = require('./constants')
const { initUser: workflowInitUser } = require('./workflow/store')
const { getSeafileHandle } = require('./util')
const { Readable } = require('stream')

const configFile = {
  name: 'Voluba config file',
  contact: 'inm1-bda@fz-juelich.de'
}

const masterInitUser = async ({ user }) => {
  const handle = await getSeafileHandle({ user })
  await handle.mkdir({ dir: `/${USER_DIR_VOLUBA_DIR_NAME}` })
  await workflowInitUser({ user })

  const readStream = new Readable()
  readStream.path = USER_DIR_VOLUBA_CONFIG_FILENAME
  readStream.push(JSON.stringify(configFile, null, 2))
  readStream.push(null)
  await handle.uploadFile({ readStream, filename: USER_DIR_VOLUBA_CONFIG_FILENAME }, { dir: `/` })
}

const getConfig = async ({ user }) => {
  const { name } = user
  const handle = await getSeafileHandle({ user })
  try {
    const file =  await handle.readFile({ dir: `/${USER_DIR_VOLUBA_CONFIG_FILENAME}` })
    console.log(`${name} profile exists`)
    return file
  } catch (e) {
    console.log(`${name} profile does not exist, creating init files`)
    await masterInitUser({ user })
    console.log(`${name} profile init complete`)
    const file = await handle.readFile({ dir: `/${USER_DIR_VOLUBA_CONFIG_FILENAME}` })
    return file
  }
}

module.exports = {
  masterInitUser,
  getConfig
}