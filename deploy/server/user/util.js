// adhoc getting seafile handle with user access token
// normally, user.seafileHandle should be populated
const getSeafileHandle = async ({ user }) => {
  const { accessToken, seafileHandle, type } = user
  if (type !== 'hbp-oidc-v2') throw new Error(`cannot save user data for non hbp v2 accounts`)
  if (seafileHandle) return seafileHandle
  const handle = new Seafile({ accessToken })
  await handle.init()
  return handle
}

module.exports = {
  getSeafileHandle
}