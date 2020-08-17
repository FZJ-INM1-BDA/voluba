const hbpOidc = require('./hbp-oidc')
const orcOidc = require('./orcid-oidc')
const passport = require('passport')
const { store } = require('../store')

module.exports = async (app) => {

  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser((user, done) => {
    store.set(user.id, JSON.stringify(user))
      .then(() => {
        const { id, name, type } = user
        console.log(`strategies/index.js#serializeUser`, { id, name, type })
        done(null, user.id)
      })
      .catch(done)
  })

  passport.deserializeUser((id, done) => {
    store.get(id)
      .then(JSON.parse)
      .then(user => {
        done(null, user)
      })
      .catch(done)
  })

  await hbpOidc(app)
  await orcOidc(app)

  app.get('/user', (req, res) => {
    if (req.user) {
      return res.status(200).send(JSON.stringify(req.user))
    } else {
      return res.status(401).end()
    }
  })

  app.get('/logout', async (req, res) => {
    const { user } = req
    if (user && user.id) {
      console.log(`strategies/index.js#logout`, { id: user.id })
      await store.delete(user.id)
    }
    req.logout()
    res.redirect('/')
  })
}
