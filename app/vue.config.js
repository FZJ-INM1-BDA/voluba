const path = require('path')
module.exports = {
  productionSourceMap: false,
  publicPath: '.',
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, 'src/')
      }
    }
  }
}