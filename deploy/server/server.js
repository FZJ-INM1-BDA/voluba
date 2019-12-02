const initApp = require('./app')

const PORT = process.env.PORT || 3000

const startServer = async () => {

  console.log('init voluba')
  const app = await initApp()

  app.listen(PORT, () => console.log(`server listening on port ${PORT}`))
}

startServer()