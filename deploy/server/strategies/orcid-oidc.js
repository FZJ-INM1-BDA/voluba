const passport = require('passport')
const { configureAuth } = require('./oidc')

const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3000'

const clientId = process.env.ORCID_CLIENTID || 'no oicid id'
const clientSecret = process.env.ORCID_CLIENTSECRET || 'no orcid client secret'
const discoveryUrl = 'https://orcid.org'
const redirectUri = `${HOSTNAME}/orcid-oidc/cb`
const cb = (tokenset, {id, family_name = '', given_name = '', ...rest}, done) => {
  return done(null, {
    id: `orcid:${id}`, // id is a mandatory field, used
    name: `${given_name} ${family_name}`,
    type: 'orcid-oidc',
    idToken: (tokenset && tokenset.id_token) || null
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
      redirect_uris: [ redirectUri ]
    }
  })
  
  passport.use('orcid-oidc', oidcStrategy)
  app.get('/orcid-oidc/auth', passport.authenticate('orcid-oidc'))
  app.get('/orcid-oidc/cb', passport.authenticate('orcid-oidc', {
    successRedirect: '/',
    failureRedirect: '/'
  }))
}
