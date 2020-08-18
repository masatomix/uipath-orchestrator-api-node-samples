import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import User from './modules/User'
import AppStore from './modules/AppStore'
import config from 'config'

Vue.use(Vuex)

// const store = new Vuex.Store({
export default new Vuex.Store({
  modules: {
    user: User,
    appStore: AppStore,
  },
  state: {},
  mutations: {},
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
      key: config.name,
    }),
  ],
})
