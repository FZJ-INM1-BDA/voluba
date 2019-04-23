const router = require('express').Router()

const template = `
<div class="p-2">
  This is a compainion plugin for the interactive viewer.
</div>
`

const getScript = ({ name, incVolName, imageSource, shader, opacity, ngMatrix }) => `
setTimeout(() => {

  window.interactiveViewer.viewerHandle.loadLayer({
    'VoluBA volume - ${incVolName}': {
      type: 'image',
      source: '${imageSource}',
      shader: \`${shader}\`,
      opacity: ${opacity},
      transform: ${JSON.stringify(ngMatrix)}
    }
  })
  window.interactiveViewer.pluginControl['${name}'].onShutdown(() => {
    console.log('on shutdown')
  })
}, 404)
`

router.get('/:resultId', (req, res) => {
  const { resultMap: map } = req
  const { resultId } = req.params
  const obj = map.get(resultId)

  /**
   * single use tokenid
   */
  if (obj) {
    map.delete(resultId)
    const { date, data } = obj
    const { selectedIncomingVolume, selectedReferenceVolume, shader, opacity, incTransformMatrix } = data
    const ngMatrix = [0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => incTransformMatrix[ c * 4 + r ]))
    const { imageSource, name: incVolName } = selectedIncomingVolume
    const name = `fzj.xg.landmark-reg-${resultId}`
    return res.status(200).json({
      name,
      displayName: 'VoluBA plugin for interactive viewer',
      template,
      script: getScript({ name, incVolName, imageSource, ngMatrix, opacity, shader })
    })
  } else {
    return res.status(404).send('Not found')
  }
})

module.exports = router