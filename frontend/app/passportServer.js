const express = require('express')
const session = require('express-session')
const app = express()
const path = require('path')
const passport = require('passport')
const {Issuer, Strategy} = require('openid-client')

const CLIENTID = process.env.CLIENTID || 'no id'
const CLIENTSECRET = process.env.CLIENTSECRET || `no secrete`
const PORT = process.env.PORT || 3001
const SESSIONSECRET = process.env.SESSIONSECRET || `i will never love carrots`

const configureAuthentication = async () => {
  const issuer = await Issuer.discover('https://services.humanbrainproject.eu/oidc')
  const client = new issuer.Client({
    client_id: CLIENTID,
    client_secret: CLIENTSECRET
  })

  const oidcStrategy = new Strategy({
    client,
    redirect_uri: 'http://localhost:3001/oidcCallback'
  }, (tokenset, userinfo, done) => {
    console.log(tokenset)
    return done(null, userinfo)
  })
  passport.use('oidc', oidcStrategy)
}

const main = async () => {
  await configureAuthentication()

  /**
   * passport application of oidc requires session
   */
  app.use(session({
    secret: SESSIONSECRET,
    resave: true,
    saveUninitialized: false
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  app.use(passport.authenticate('oidc'))
  app.use(express.static(path.resolve(__dirname, 'dist')))
  app.listen(PORT, () => console.log(`server listening on ${PORT}`))
}

main()