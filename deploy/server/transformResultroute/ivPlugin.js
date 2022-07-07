const router = require('express').Router()

const getTemplate = ({ error }={}) => `
<div class="p-2">
  This is a compainion plugin for the interactive viewer.
  ${error ? '<br />' + error : ''}
</div>
`

const getScript = ({ name, incVolName, imageSource, shader, opacity, ngMatrix }) => `
(() => {

  let loadLayerTimer = setInterval(() => {
    if (window.viewer) {

      clearInterval(loadLayerTimer)

      window.interactiveViewer.viewerHandle.loadLayer({
        'VoluBA volume - ${incVolName}': {
          source: '${imageSource}',
          shader: \`${shader}\`,
          opacity: ${opacity},
          transform: ${JSON.stringify(ngMatrix)}
        }
      })
    }
  }, 1000)

  let cleanUpTimer = setInterval(() => {
    if (window.interactiveViewer.pluginControl['${name}']) {
      clearInterval(cleanUpTimer)

      window.interactiveViewer.pluginControl['${name}'].onShutdown(() => {
        console.log('cleaning up')
        window.interactiveViewer.viewerHandle.removeLayer({
          name: 'VoluBA volume - ${incVolName}'
        })
      })
    }
  }, 500)
})()
`
/**
 * TODO, trasnform scriptURL and retire inline script
 * violates CSP
 */
router.get('/:resultId', async (req, res) => {
  const { resultMap: map } = req
  const { resultId } = req.params
  const obj = await map.get(resultId)

  /**
   * single use tokenid
   */
  const displayName = 'VoluBA plugin for interactive viewer'
  if (obj) {
    map.delete(resultId)
    const { date, data } = obj
    const { selectedIncomingVolume, selectedReferenceVolume, shader, opacity, incTransformMatrix } = data
    const ngMatrix = [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => incTransformMatrix[ c * 4 + r ]))
    const { imageSource, name: incVolName } = selectedIncomingVolume
    const name = `fzj.xg.landmark-reg-${resultId}`
    return res.status(200).json({
      name,
      displayName,
      template: getTemplate(),
      script: getScript({ name, incVolName, imageSource, ngMatrix, opacity, shader }),
      persistency: true
    })
  } else {
    const name = `fzj.xg.landmark-reg-not-found`
    return res.status(200).json({
      name,
      displayName,
      template: getTemplate({ error: 'One time use token expired.' }),
      script: '',
      persistency: true
    })
  }
})

module.exports = router