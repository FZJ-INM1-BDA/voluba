const LRU = require('lru-cache')
const store = new LRU({
  max: 1024 * 1024 * 64, // 64 mb
  maxAge: 1e3 * 60 * 60 * 24, // 1 day
  length: function (n, key) {
    return key.length + n.length
  }
})

module.exports = {
  store: {
    set: async function (key, val) {
      if (typeof val !== 'string') throw new Error(`val must be string`)
      store.set(key, val)
    },
    get: async function (key) {
      return store.get(key)
    },
    delete: async function (key) {
      store.del(key)
      return
    },
    clear: async function(){
      store.reset()
    }
  }
}
