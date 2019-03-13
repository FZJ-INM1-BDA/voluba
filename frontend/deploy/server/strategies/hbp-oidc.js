const passport = require('passport')
const { configureAuth } = require('./oidc')

const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3000'

const clientId = process.env.HBP_CLIENTID || 'no hbp id'
const clientSecret = process.env.HBP_CLIENTSECRET || 'no hbp client secret'
const discoveryUrl = 'https://services.humanbrainproject.eu/oidc'
const redirectUri = `${HOSTNAME}/hbp-oidc/cb`
const cb = (tokenset, {sub, given_name, family_name, ...rest}, done) => {
  return done(null, {
    id: `hbp-oidc:${sub}`,
    name: `${given_name} ${family_name}`,
    type: `hbp-oidc`
  })
}

module.exports = async (app) => {
  const { oidcStrategy } = await configureAuth({
    clientId,
    clientSecret,
    discoveryUrl,
    redirectUri,
    cb,
    clientConfig: {
      redirect_uris: [ redirectUri ],
      response_types: [ 'code' ]
    }
  })
  
  passport.use('hbp-oidc', oidcStrategy)
  app.get('/hbp-oidc/auth', passport.authenticate('hbp-oidc'))
  app.get('/hbp-oidc/cb', passport.authenticate('hbp-oidc', {
    successRedirect: '/',
    failureRedirect: '/'
  }))
}
