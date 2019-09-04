const express = require('express')
const session = require('express-session')
const path = require('path')
const dotenv = require('dotenv')
const MemoryStore = require('memorystore')(session)
const { compressionMiddleware } = require('nomiseco')

const SESSIONSECRET = process.env.SESSIONSECRET || `i will never love carrots`

const app = express()
if (process.env !== 'production'){
  dotenv.config()
}

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
  cookie: {
    maxAge: 86400000
  },
  store
}))

const authStrategies = require('./strategies')

const initServer = async () => {
  try{
    await authStrategies(app)
  } catch (e) {
    console.log(`error during authStrategy`, e)
    throw e
  }

  app.use('/transformResult', require('./transformResultroute'))
  
  const publicPath = path.join(__dirname, '..',  'public')

  if (process.env.NODE_ENV === 'production') {
    app.use(compressionMiddleware)
  }

  app.use(express.static(publicPath))
  return app
}

module.exports = initServer