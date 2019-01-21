const express = require('express')
const app = express()

const path = require('path')

const PORT = express.env.PORT || 3000

app.use(express.static(path.resolve(__dirname, 'dist')))

app.listen(PORT)