
const getAuthStore = ({ user }) => {
  return {
    namespaced: true,
    state: {
      user
    },
    getters: {
      isHbpOidcV2: state => {
        return state.user && state.user.type === 'hbp-oidc-v2'
      },
      authHeader: state => {
        const idToken = state.user && state.user.idToken || process.env.VUE_APP_ID_TOKEN
        return idToken
          ? { Authorization: `Bearer ${idToken}` }
          : {}
      },
    }
  }
} 

export default getAuthStore