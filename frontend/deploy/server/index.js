const express = require('express')
const session = require('express-session')
const path = require('path')
const dotenv = require('dotenv')
const MemoryStore = require('memorystore')(session)
const csp = require('helmet-csp')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 3000
const SESSIONSECRET = process.env.SESSIONSECRET || `i will never love carrots`
const CSP_DEFAULT_SRC = process.env.CSP_DEFAULT_SRC && process.env.CSP_DEFAULT_SRC.split(';') || []
const CSP_CONNECT_SRC = process.env.CSP_CONNECT_SRC && process.env.CSP_CONNECT_SRC.split(';') || []

const app = express()

app.use(csp({
  directives: {
    styleSrc: ["'unsafe-inline'", "'self'"],
    connectSrc: ["'self'", '*.humanbrainproject.org', '*.humanbrainproject.eu', '*.hbp.eu', ...CSP_CONNECT_SRC],
    defaultSrc: ["'self'", ...CSP_DEFAULT_SRC],
    reportUri: '/report-violation'
  },
  loose: false,
  reportOnly: true
}))

app.post('/report-violation', bodyParser.json({
  type: ['json', 'application/csp-report']
}), (req, res) => {
  if (req.body) {
    /**
     * Handle CSP Violation
     */
    console.log('CSP Violation: ', req.body)
  } else {
    console.log('CSP Violation: No data received!')
  }
  res.status(204).end()
})

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
  try{
    await authStrategies(app)
  } catch (e) {
    console.log(`error during authStrategy`, e)
    throw e
  }

  app.use('/transformResult', require('./transformResultroute'))
  
  const publicPath = path.join(__dirname, '..',  'public')
  app.use(express.static(publicPath))
  app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
}

startServer(app)