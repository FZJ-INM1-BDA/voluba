const passport = require('passport')
const { configureAuth } = require('./oidc')
const { Seafile } = require('hbp-seafile')
const { getConfig } = require('../user/store')

const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3000'

const hbpScope = process.env.HBP_V2_SCOPE || 'openid email profile collab.drive'
const clientId = process.env.HBP_V2_CLIENTID || 'no hbp id'
const clientSecret = process.env.HBP_V2_CLIENTSECRET || 'no hbp client secret'
const discoveryUrl = 'https://iam.ebrains.eu/auth/realms/hbp'
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
      return {
        ...user,
        seafileHandle
      }
    })
    .then(async user => {
      await getConfig({ user })
      return user
    })
    .then(user => {
      done(null, user)
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
    scope: hbpScope,
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
