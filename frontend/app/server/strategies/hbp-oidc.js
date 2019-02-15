const passport = require('passport')
const { configureAuth } = require('./oidc')

const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3000'

const clientId = process.env.HBP_CLIENTID || 'no hbp id'
const clientSecret = process.env.HBP_CLIENTSECRET || 'no hbp client secret'
const discoveryUrl = 'https://services.humanbrainproject.eu/oidc'
const redirectUri = `${HOSTNAME}/hbp-oidc/cb`
const cb = (tokenset, userinfo, done) => {
  console.log('hbp-oidc auth success', {
    tokenset,
    userinfo
  })
  return done(null, userinfo)
}

module.exports = async (app) => {
  const { oidcStrategy } = await configureAuth({
    clientId,
    clientSecret,
    discoveryUrl,
    redirectUri,
    cb
  })
  
  passport.use('hbp-oidc', oidcStrategy)
  app.get('/hbp-oidc/auth', passport.authenticate('hbp-oidc'))
  app.get('/hbp-oidc/cb', passport.authenticate('hbp-oidc', {
    successRedirect: '/',
    failureRedirect: '/'
  }))
}

