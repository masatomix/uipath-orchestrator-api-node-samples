import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import constants from '@/constants'
import config from 'config'

Vue.use(Vuex)

// const store = new Vuex.Store({
export default new Vuex.Store({
  state: {
    user: {},
    loginStatus: false,
    enterpriseConfig: {},
    communityConfig: {},
    jsonConfig: {},
    orchestratorConfigSaved: false,
    selectedRobotModeFlag: NaN,
  },
  mutations: {
    [constants.mutations.user](state, user) {
      state.user = user
    },
    [constants.mutations.loginStatus](state, loginStatus) {
      state.loginStatus = loginStatus
    },
    enterpriseConfig(state, enterpriseConfig) {
      state.enterpriseConfig = enterpriseConfig
    },
    communityConfig(state, communityConfig) {
      state.communityConfig = communityConfig
    },
    jsonConfig(state, jsonConfig) {
      state.jsonConfig = jsonConfig
    },
    selectedRobotModeFlag(state, selectedRobotModeFlag) {
      state.selectedRobotModeFlag = selectedRobotModeFlag
    },
    orchestratorConfigSaved(state, orchestratorConfigSaved) {
      state.orchestratorConfigSaved = orchestratorConfigSaved
    },
  },
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
      key: config.name,
    }),
  ],
})
