import { OrchestratorApi } from 'uipath-orchestrator-api-node'

export const getConfig = me => {
  const selectedRobotModeFlag = me.$store.state.appStore.selectedRobotModeFlag
  return {
    '0': me.$store.state.appStore.enterpriseConfig,
    '1': me.$store.state.appStore.communityConfig,
    '2': me.$store.state.appStore.jsonConfig,
  }[selectedRobotModeFlag]
}

export const saveConfig = (me, selectedRobotModeFlag) => {
  const getApi = config => {
    const api = new OrchestratorApi(config)
    const authPromise = api
      .authenticate()
      .catch(error => alert('MyError' + error))
    // .then(() => {
    //   // 左辺は最終的に Vuexへ保存されるインスタンス(GUIのボックスに該当)
    //   config.token.access_token = api.accessToken
    // })
    return { api, authPromise }
  }

  const storeConfig = selectedRobotModeFlag => {
    const map = {
      '0': () => {
        const { api, authPromise } = getApi(me.enterpriseConfig)
        authPromise.then(() => {
          // enterpriseConfig.token.access_token が空の場合だけ認証がおこなわれて、
          // 結果が api.accessToken から取得できるので、それで上書きする。
          me.enterpriseConfig.token.access_token = api.accessToken
          me.$store.dispatch('appStore/saveEnterpriseConfig', {
            config: me.enterpriseConfig,
            selectedRobotModeFlag: selectedRobotModeFlag,
          })
        })
      },
      '1': () => {
        const { api, authPromise } = getApi(me.communityConfig)
        authPromise.then(() => {
          me.communityConfig.token.access_token = api.accessToken
          me.$store.dispatch('appStore/saveCommunityConfig', {
            config: me.communityConfig,
            selectedRobotModeFlag: selectedRobotModeFlag,
          })
        })
      },
      '2': () => {
        try {
          const jsonConfig = JSON.parse(me.configText)
          const { api, authPromise } = getApi(jsonConfig)
          authPromise.then(() => {
            Object.assign(jsonConfig, {
              token: { access_token: api.accessToken },
            })
            me.configText = JSON.stringify(jsonConfig)
            me.$store.dispatch('appStore/saveJsonConfig', {
              configText: me.configText,
              selectedRobotModeFlag: selectedRobotModeFlag,
            })
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
