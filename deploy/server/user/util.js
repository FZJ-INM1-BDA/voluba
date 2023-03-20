const { Seafile } = require('hbp-seafile')

// adhoc getting seafile handle with user access token
// normally, user.seafileHandle should be populated
const getSeafileHandle = async ({ user }) => {
  const { accessToken, seafile, type } = user
  if (type !== 'hbp-oidc-v2') throw new Error(`cannot save user data for non hbp v2 accounts`)
  const { handle } = seafile
  if (handle.ls && typeof handle.ls === 'function') {
    return handle
  }
  /**
   * through the process of serialisation, methods sometimes gets trimmed
   * if that's the case, return seafile instance with `.from` static method
   */
  if (handle._token) {
    return Seafile.from({ token: handle._token, accessToken })
  }
  const newHandle = new Seafile({ accessToken })
  await newHandle.init()
  return newHandle
}

module.exports = {
  getSeafileHandle
}
