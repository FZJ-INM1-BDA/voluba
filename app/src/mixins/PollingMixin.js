import axios from 'axios'

/**
 * poll once every 5s
 */
const POLLING_FREQUENCY = 1000

export default {
  data: function () {
    return {
      pollingMixin__url: null,
      pollingMixin__pollingMesssage: null,
      pollingMixin__pollingComplete: false,
      pollingMixin__pollingError: null,
      pollingMixin__pollingInProgress: false,
      pollingMixin__results: null,
      pollingMixin__config: null
    }
  },
  methods: {
    pollingMixin__poll: function (url, config) {
      this.pollingMixin__pollingInProgress = true
      this.pollingMixin__url = url
      this.pollingMixin__config = config
      this._pollingMixin__poll()
    },
    _pollingMixin__poll: function () {
      axios(this.pollingMixin__url, this.pollingMixin__config)
        .then(({ data }) => {
          const { finished, message, error, results, params } = data
          
          this.pollingMixin__pollingMesssage = message
          this.pollingMixin__pollingComplete = finished
          this.pollingMixin__pollingError = error

          if (!finished && !error) setTimeout(() => this._pollingMixin__poll(), POLLING_FREQUENCY)
          else {
            this.pollingMixin__pollingInProgress = false
            this.pollingMixin__results = results
          }
        })
        .catch(err => {
          console.error('error', err)
          this.pollingMixin__pollingMesssage = err
          this.pollingMixin__pollingError = err
        })
    }
  }
}