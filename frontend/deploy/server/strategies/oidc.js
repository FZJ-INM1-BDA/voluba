const { Issuer, Strategy, custom } = require('openid-client')

const defaultCb = (tokenset, {id, ...rest}, done) => {
  return done(null, {
    id: id || Date.now(),
    ...rest
  })
}

/**
 * timeout happens way too often
 * increase timeout threshold and introduce retries according to
 * https://github.com/panva/node-openid-client/blob/master/docs/README.md#customizing-http-requests
 */
const overWritingDefaultGotOption = (options) => {
  options.timeout = 5000
  options.retry = 3
  return options
}

exports.configureAuth = async ({ discoveryUrl, clientId, clientSecret, redirectUri, clientConfig = {}, cb = defaultCb }) => {
  if (!discoveryUrl)
    throw new Error('discoveryUrl must be defined!')

  if (!clientId)
    throw new Error('clientId must be defined!')

  if (!clientSecret)
    throw new Error('clientSecret must be defined!')

  if (!redirectUri)
    throw new Error('redirectUri must be defined!')

  const issuer = await Issuer.discover(discoveryUrl)
  issuer[custom.http_options] = overWritingDefaultGotOption

  const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    ...clientConfig
  })
  client[custom.http_options] = overWritingDefaultGotOption

  const oidcStrategy = new Strategy({
    client,
    redirect_uri: redirectUri
  }, cb)

  return {
    oidcStrategy
  }
}