const passport = require('passport')
const { configureAuth } = require('./oidc')
const { Seafile } = require('hbp-seafile')

const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3000'

const clientId = process.env.HBP_V2_CLIENTID || 'no hbp id'
const clientSecret = process.env.HBP_V2_CLIENTSECRET || 'no hbp client secret'
const discoveryUrl = 'https://iam.humanbrainproject.eu/auth/realms/hbp'
const redirectUri = `${HOSTNAME}/hbp-oidc-v2/cb`
const cb = (tokenset, {sub, given_name, family_name, ...rest}, done) => {
  
  const idToken = (tokenset && tokenset.id_token) || null
  const accessToken = (tokenset && tokenset.access_token) || null

  const user = {
    id: `hbp-oidc-v2:${sub}`,
    name: `${given_name} ${family_name}`,
    type: `hbp-oidc-v2`,
    idToken,
    accessToken,
  }

  const seafileHandle = new Seafile({ accessToken })
  seafileHandle.init()
    .then(() => {
      done(null, {
        ...user,
        seafileHandle
      })
    })
    .catch(e => {
      console.warn(`seafile handle init failed`, e)
      done(null, user)
    })
}

module.exports = async (app) => {
  const { oidcStrategy } = await configureAuth({
    clientId,
    clientSecret,
    discoveryUrl,
    redirectUri,
    cb,
    scope: 'openid offline_access email profile collab.drive',
    clientConfig: {
      redirect_uris: [ redirectUri ],
      response_types: [ 'code' ]
    }
  })
  
  passport.use('hbp-oidc-v2', oidcStrategy)
  app.get('/hbp-oidc-v2/auth', passport.authenticate('hbp-oidc-v2'))
  app.get('/hbp-oidc-v2/cb', passport.authenticate('hbp-oidc-v2', {
    successRedirect: '/',
    failureRedirect: '/'
  }))
}
