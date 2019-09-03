
const getAuthStore = ({ user }) => ({
  namespaced: true,
  state: {
    user
  },
  getters: {
    authHeader: state => {
      const idToken = state.user && state.user.idToken || process.env.VUE_APP_ID_TOKEN
      return idToken
        ? { Authorization: `Bearer ${idToken}` }
        : {}
    },
  }
})

export default getAuthStore