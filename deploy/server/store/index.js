/**
 * Cache to allow for in memory response while data fetching/processing occur
 */

const { 
  REDIS_PROTO,
  REDIS_ADDR,
  REDIS_PORT,

  REDIS_RATE_LIMITING_DB_EPHEMERAL_PORT_6379_TCP_PROTO,
  REDIS_RATE_LIMITING_DB_EPHEMERAL_PORT_6379_TCP_ADDR,
  REDIS_RATE_LIMITING_DB_EPHEMERAL_PORT_6379_TCP_PORT,

  REDIS_USERNAME,
  REDIS_PASSWORD,

} = process.env

const redisProto = REDIS_PROTO || REDIS_RATE_LIMITING_DB_EPHEMERAL_PORT_6379_TCP_PROTO || 'redis'
const redisAddr = REDIS_ADDR || REDIS_RATE_LIMITING_DB_EPHEMERAL_PORT_6379_TCP_ADDR || null
const redisPort = REDIS_PORT || REDIS_RATE_LIMITING_DB_EPHEMERAL_PORT_6379_TCP_PORT || 6379

const userPass = (() => {
  let returnString = ''
  if (REDIS_USERNAME) {
    returnString += REDIS_USERNAME
  }
  if (REDIS_PASSWORD) {
    returnString += `:${REDIS_PASSWORD}`
  }
  return returnString === ''
    ? ''
    : `${returnString}@`
})()

const redisURL = redisAddr && `${redisProto || ''}://${userPass}${redisAddr}:${redisPort}`

const crypto = require('crypto')

let authKey

const getAuthKey = () => {
  crypto.randomBytes(128, (err, buf) => {
    if (err) {
      console.error(`generating random bytes error`, err)
      return
    }
    authKey = buf.toString('base64')
    console.log(`clear store key: ${authKey}`)
  })
}

getAuthKey()

const ensureString = val => {
  if (typeof val !== 'string') throw new Error(`both key and val must be string`)
}

if (redisURL) {
  const redis = require('redis')
  const { promisify } = require('util')
  const client = redis.createClient({
    url: redisURL
  })
  
  const asyncGet = promisify(client.get).bind(client)
  const asyncSet = promisify(client.set).bind(client)
  const asyncDel = promisify(client.del).bind(client)

  const keys = []

  /**
   * maxage in milli seconds
   */
  exports.store = {
    set: async (key, val, { maxAge } = {}) => {
      ensureString(key)
      ensureString(val)
      asyncSet(key, val, ...( maxAge ? [ 'PX', maxAge ] : [] ))
      keys.push(key)
    },
    get: async (key) => {
      ensureString(key)
      return asyncGet(key)
    },
    delete: async (key) => {
      ensureString(key)
      await asyncDel(key)
      const keyIdx = keys.find(k => k === key)
      keys.splice(keyIdx, 1)
    },
    clear: async auth => {
      if (auth !== authKey) {
        getAuthKey()
        throw new Error(`unauthorized`)
      }
      await asyncDel(keys.splice(0))
      keys = []
    }
  }

  exports.StoreType = `redis`
  exports.redisURL = redisURL
  console.log(`redis`)

} else {
  const LRU = require('lru-cache')
  const store = new LRU({
    max: 1024 * 1024 * 256, // 256mb
    length: (n, key) => n.length,
    maxAge: Infinity, // never expires
  })

  exports.store = {
    /**
     * maxage in milli seconds
     */
    set: async (key, val, { maxAge } = {}) => {
      ensureString(key)
      ensureString(val)
      store.set(key, val, ...( maxAge ? [ maxAge ] : [] ))
    },
    get: async (key) => {
      ensureString(key)
      return store.get(key)
    },
    delete: async (key) => {
      ensureString(key)
      store.del(key)
    },
    clear: async auth => {
      if (auth !== authKey) {
        getAuthKey()
        throw new Error(`unauthorized`)
      }
      store.reset()
    }
  }

  exports.StoreType = `lru-cache`
  console.log(`lru-cache`)
}
