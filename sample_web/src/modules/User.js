export default {
  namespaced: true,
  state: () => ({
    user: {},
    loginStatus: false,
  }),
  mutations: {
    // 例: user(state,user) のこと
    user(state, user) {
      state.user = user
    },
    loginStatus(state, loginStatus) {
      state.loginStatus = loginStatus
    },
  },
}
