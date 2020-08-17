const initApp = require('./app')

if (process.env.FLUENT_HOST) {
  const os = require('os')
  const { Logger } = require('hbp-fluentd-logger')

  const name = process.env.APPLICATION_NAME || 'voluba'
  let hostname
  try {
    hostname =  os.hostname() || 'unknown-hostname'
  } catch (e) {
    hostname = 'error-hostname'
  }

  const protocol = process.env.FLUENT_PROTOCOL || 'http'
  const host = process.env.FLUENT_HOST || 'localhost'
  const port = process.env.FLUENT_PORT || 24224
  
  const prefix = `${name}.${hostname}`

  const log = new Logger(prefix, {
    protocol,
    host,
    port
  })

  const handleRequestCallback = (err, resp, body) => {
    if (err) {
      process.stderr.write(`fluentD logging failed\n`)
      process.stderr.write(err.toString())
      process.stderr.write('\n')
    }

    if (resp && resp.statusCode >= 400) {
      process.stderr.write(`fluentD logging responded error\n`)
      process.stderr.write(JSON.stringify(resp))
      process.stderr.write('\n')
    }
  }
  const emitInfo = message => log.emit('info', message, handleRequestCallback)

  const emitWarn = message => log.emit('warn', message, handleRequestCallback)

  const emitError = message => log.emit('error', message, handleRequestCallback)

  console.log('starting fluentd logging')

  console.log = function () {
    emitInfo([...arguments])
  }
  console.warn = function () {
    emitWarn([...arguments])
  }
  console.error = function () {
    emitError([...arguments])
  }
}

const PORT = process.env.PORT || 3000

const startServer = async () => {

  console.log('init voluba')
  const app = await initApp()

  app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
}

startServer()