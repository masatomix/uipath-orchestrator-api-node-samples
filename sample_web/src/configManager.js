export const getConfig = me => {
  const selectedRobotModeFlag = me.$store.state.appStore.selectedRobotModeFlag
  return {
    '0': me.$store.state.appStore.enterpriseConfig,
    '1': me.$store.state.appStore.communityConfig,
    '2': me.$store.state.appStore.jsonConfig,
  }[selectedRobotModeFlag]
}

export const saveConfig = (me, selectedRobotModeFlag) => {
  const storeConfig = selectedRobotModeFlag => {
    const map = {
      '0': () =>
        me.$store.dispatch('appStore/saveEnterpriseConfig', {
          config: me.enterpriseConfig,
          selectedRobotModeFlag: selectedRobotModeFlag,
        }),
      '1': () =>
        me.$store.dispatch('appStore/saveCommunityConfig', {
          config: me.communityConfig,
          selectedRobotModeFlag: selectedRobotModeFlag,
        }),
      '2': () => {
        try {
          me.$store.dispatch('appStore/saveJsonConfig', {
            configText: me.configText,
            selectedRobotModeFlag: selectedRobotModeFlag,
          })
        } catch (error) {
          alert(error)
          throw error
        }
      },
    }
    return map[selectedRobotModeFlag]
  }
  storeConfig(selectedRobotModeFlag)()
  // 選択した方だけVuexへ保存
  me.saveFinished = true
}

export const isEmpty = config => (config.serverinfo ? false : true)

export const getEnterpriseConfig = vEnterpriseConfig => {
  return this.isEmpty(vEnterpriseConfig)
    ? def_enterpriseConfig
    : vEnterpriseConfig
}

export const getCommunityConfig = vCommunityConfig => {
  return this.isEmpty(vCommunityConfig) ? def_communityConfig : vCommunityConfig
}

export const getConfigText = vJsonConfig => {
  return this.isEmpty(vJsonConfig)
    ? def_configText
    : JSON.stringify(vJsonConfig, null, 2)
}

const def_enterpriseConfig = {
  userinfo: {
    tenancyName: 'default',
    usernameOrEmailAddress: 'admin',
    password: '',
    // organizationUnit: null,
  },
  serverinfo: {
    servername: 'https://orchestrator.example.com',
  },
}
const def_communityConfig = {
  serverinfo: {
    servername:
      'https://platform.uipath.com/[AccountLogicalName]/[ServiceName]',
    refresh_token: '[User Key]',
    tenant_logical_name: '[Tenant Logical Name]',
    client_id: '[Client Id]]',
  },
}
const def_configText = ''
