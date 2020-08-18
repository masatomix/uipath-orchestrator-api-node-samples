export default {
  namespaced: true,
  state: () => ({
    enterpriseConfig: {},
    communityConfig: {},
    jsonConfig: {},
    orchestratorConfigSaved: false,
    selectedRobotModeFlag: NaN,
    selectedFolder: null,
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
      state.selectedFolder = selectedFolder
    },
  },
}
