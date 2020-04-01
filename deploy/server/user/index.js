const router = require('express').Router()

const authenticated = (req, res, next) => {
  if (!req.user) return res.status(401).end()
  return next()
}

const isHbpOidcV2 = async (req, res, next) => {
  const { user } = req
  const { type } = user
  if (type !== 'hbp-oidc-v2') return res.status(403).send(`User needs to be authenticated with HBP OIDC v2 (keycloak)`)
  return next()
}

const getUser = (req, res) => {
  const { user } = req
  const { 
    id,
    name,
    type,
    idToken,
    accessToken
   } = user
  return res.status(200).json({
    id,
    name,
    type,
    idToken
  })
}

router.get('', authenticated, getUser)
router.get('/', authenticated, getUser)

router.use('/workflow', authenticated, isHbpOidcV2, require('./workflow'))

module.exports = router