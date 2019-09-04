const BROTLI = `br`
const GZIP = `gzip`

const detEncoding = (acceptEncoding = '') => {
  if (process.env.NODE_ENV !== 'production') return null

  return /br/i.test(acceptEncoding)
    ? BROTLI
    : /gzip/i.test(acceptEncoding)
      ? GZIP
      : null
}

const mimeMap = new Map([
  ['.png', 'image/png'],
  ['.gif', 'image/gif'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.css', 'text/css'],
  ['.html', 'text/html'],
  ['.js', 'text/javascript']
])

exports.BROTLI = BROTLI

exports.GZIP = GZIP

exports.detEncoding = detEncoding

exports.compressionMiddleware = (req, res, next) => {
  const acceptEncoding = req.get('Accept-Encoding')
  const encoding = detEncoding(acceptEncoding)

  // if no encoding is accepted
  // or in dev mode, do not use compression
  if (!encoding) return next()
  
  const ext = /(\.\w*?)$/.exec(req.url)

  // if cannot determine mime-type, do not use encoding
  // as Content-Type header is required for browser to understand response
  if (!ext || !mimeMap.get(ext[1])) return next()
  
  res.set('Content-Type', mimeMap.get(ext[1]))

  if (encoding === BROTLI) {
    req.url = req.url + '.br'
    res.set('Content-Encoding', encoding)
    return next()
  }

  if (encoding === GZIP) {
    req.url = req.url + '.gz'
    res.set('Content-Encoding', encoding)
    return next()
  }

  next()
}