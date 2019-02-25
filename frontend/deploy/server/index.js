const express = require('express')
const session = require('express-session')
const path = require('path')
const dotenv = require('dotenv')
const MemoryStore = require('memorystore')(session)

const PORT = process.env.PORT || 3000
const SESSIONSECRET = process.env.SESSIONSECRET || `i will never love carrots`

const app = express()
dotenv.config()

const store = new MemoryStore({
  checkPeriod: 86400000
})

/**
 * passport application of oidc requires session
 */
app.use(session({
  secret: SESSIONSECRET,
  resave: true,
  saveUninitialized: false,
  store
}))

const authStrategies = require('./strategies')

const startServer = async (app) => {
  await authStrategies(app)
  const publicPath = path.join(__dirname, '..',  'public')
  app.use(express.static(publicPath))
  app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
}

startServer(app)