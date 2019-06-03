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
  cookie: {
    maxAge: 86400000
  },
  store
}))

const authStrategies = require('./strategies')

const startServer = async (app) => {
  try{
    await authStrategies(app)
  } catch (e) {
    console.log(`error during authStrategy`, e)
    throw e
  }

  app.use('/transformResult', require('./transformResultroute'))

  /**
   * currently hardcoded
   */
  app.get('/serverWarnings', (req, res) => {
    res.status(200).json([
      `There will be a downtime for the nifti upload service on June 5, 2019 between 12:30 and 13:00 CEST. You may experience interruption uploading and retrieving the uploaded volume during this time. We thank you for your understanding.`
    ])
  })
  
  const publicPath = path.join(__dirname, '..',  'public')
  app.use(express.static(publicPath))
  app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
}

startServer(app)