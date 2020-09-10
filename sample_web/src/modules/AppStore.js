export default {
  namespaced: true,
  state: () => ({
    enterpriseConfig: {},
    communityConfig: {},
    jsonConfig: {},
    orchestratorConfigSaved: false,
    selectedRobotModeFlag: NaN,
    selectedFolder: null, // これは別でもいいかもしれない。
  }),
  mutations: {
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
    selectedFolder(state, selectedFolder) {
      state.selectedFolder = selectedFolder // これは別でもいいかもしれない。
    },
  },
  actions: {
    saveEnterpriseConfig(context, payload) {
      context.commit('enterpriseConfig', payload.config)
      context.commit('orchestratorConfigSaved', true)
      context.commit('selectedRobotModeFlag', payload.selectedRobotModeFlag)
    },
    saveCommunityConfig(context, payload) {
      context.commit('communityConfig', payload.config)
      context.commit('orchestratorConfigSaved', true)
      context.commit('selectedRobotModeFlag', payload.selectedRobotModeFlag)
    },
    saveJsonConfig(context, payload) {
      const saveConfig = JSON.parse(payload.configText)
      context.commit('jsonConfig', saveConfig)
      context.commit('orchestratorConfigSaved', true)
      context.commit('selectedRobotModeFlag', payload.selectedRobotModeFlag)
    },
    setSelectedFolder(context, selectedFolder) {
      context.commit('selectedFolder', selectedFolder)
    },
    clearConfig(context) {
      context.commit('enterpriseConfig', {})
      context.commit('communityConfig', {})
      context.commit('jsonConfig', {})
      context.commit('selectedRobotModeFlag', null)
      context.commit('orchestratorConfigSaved', false)
      context.commit('selectedFolder', null) // これは別でもいいかもしれない。
    },
  },
}
