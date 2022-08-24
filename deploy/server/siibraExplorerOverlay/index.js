const router = require('express').Router()
const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const asyncRead = promisify(fs.readFile)

let templateContent = null
const cacheTemplatePromise = (async () => {
    templateContent = await asyncRead(
        path.join(__dirname, "template.html"),
        "utf-8"
    )
})()

const verifyTransform = transform => {
    if (!transform) return null
    const splitXform = transform.split(",")
    if (splitXform.length !== 12) return null
    const splitXformNumber = splitXform.map(v => Number(v))
    if (splitXformNumber.some(v => isNaN( v ))) return null
    
    return [
        splitXformNumber.slice(0, 4),
        splitXformNumber.slice(4, 8),
        splitXformNumber.slice(8),
        [0, 0, 0, 1]
    ]
}

router.get('/template.html', async (req, res) => {
    await cacheTemplatePromise
    res.setHeader("cache-control", "no-cache")
    const { precomputed, transform } = req.query
    res.setHeader("content-type", "text/html; charset=UTF-8")

    let returnContent = templateContent
    if (!!precomputed) {
        returnContent = returnContent.replace('const precomputedUrl = null', `const precomputedUrl = DOMPurify.sanitize( ${JSON.stringify(precomputed.replace(/^precomputed:\/\//, ''))} )`)
    }

    const verifiedTransform = verifyTransform(transform)
    if (!!verifiedTransform) {
        returnContent = returnContent.replace('const transform = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]', `const transform = ${JSON.stringify(verifiedTransform)}`)
    }
    res.send(returnContent)
})



module.exports = router
