const hbpOidc = require('./hbp-oidc')
const orcOidc = require('./orcid-oidc')
const passport = require('passport')
const objStoreDb = new Map()

module.exports = async (app) => {

  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser((user, done) => {
    objStoreDb.set(user.id, user)
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    const user = objStoreDb.get(id)
    if (user) 
      return done(null, user)
    else
      return done(null, false)
  })

  await hbpOidc(app)
  await orcOidc(app)

  app.get('/user', (req, res) => {
    if (req.user) {
      return res.status(200).send(JSON.stringify(req.user))
    } else {
      return res.sendStatus(401)
    }
  })

  app.get('/logout', (req, res) => {
    const { user } = req
    if (user && user.id) {
      objStoreDb.delete(user.id)
    }
    req.logout()
    res.redirect('/')
  })
}