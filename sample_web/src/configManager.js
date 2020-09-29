import { OrchestratorApi, getConfigState } from 'uipath-orchestrator-api-node'
import config from 'config'

const isEmpty = config => (config.serverinfo ? false : true)

/**
 * store から、configを取り出す. どのconfigを取り出すかは、引数で指定できる。省略した場合は、storeの選択モードで自動選択される
 * @param {*} store
 * @param {*} paramSelectedRobotModeFlag
 */
export const getConfig = (store, paramSelectedRobotModeFlag) => {
  const selectedRobotModeFlag = paramSelectedRobotModeFlag
    ? paramSelectedRobotModeFlag
    : store.state.appStore.selectedRobotModeFlag
  return {
    '0': store.state.appStore.enterpriseConfig,
    '1': store.state.appStore.communityConfig,
    '2': store.state.appStore.jsonConfig,
  }[selectedRobotModeFlag]
}

/**
 * node-configが作成してくれるconfigを取得する。
 */
const createConfigFromConfigJS = () => {
  const { isEnterprise, isCommunity } = getConfigState(config)
  // node-configが作ってくれる初期値を取得(2)。(1)がなかったらコレを使う。
  const def_enterpriseConfig =
    isEnterprise && !isEmpty(config) ? config : _def_enterpriseConfig
  const def_communityConfig =
    isCommunity && !isEmpty(config) ? config : _def_communityConfig
  const def_configText = _def_configText

  return { def_enterpriseConfig, def_communityConfig, def_configText }
}

/**
 * storeや、デフォルト値などをつかって、configを作成して、返す。
 * @param  store
 */
export const restoreConfig = store => {
  // node-configが作ってくれる初期値configを取得(1)
  const {
    def_enterpriseConfig,
    def_communityConfig,
    def_configText,
  } = createConfigFromConfigJS()

  // firestoreからとる、処理をココに入れる

  // Vuexからとれる設定値configを取得(2)。あったらコレを使う
  const vEnterpriseConfig = getConfig(store, '0')
  const vCommunityConfig = getConfig(store, '1')
  const vJsonConfig = getConfig(store, '2')

  // (2):Vuexがあればそれを使うし、なければ(1)をつかう
  const enterpriseConfig = !isEmpty(vEnterpriseConfig)
    ? vEnterpriseConfig
    : def_enterpriseConfig

  const communityConfig = !isEmpty(vCommunityConfig)
    ? vCommunityConfig
    : def_communityConfig

  const configText = !isEmpty(vJsonConfig)
    ? JSON.stringify(vJsonConfig, null, 2)
    : def_configText

  /////
  const vEnterpriseConfigEtc = store.state.appStore.enterpriseConfigEtc
  const vCommunityConfigEtc = store.state.appStore.communityConfigEtc
  const vJsonConfigEtc = store.state.appStore.jsonConfigEtc

  const enterpriseConfigEtc = isEmpty(vEnterpriseConfigEtc)
    ? _def_enterpriseConfigEtc
    : vEnterpriseConfigEtc

  const communityConfigEtc = isEmpty(vCommunityConfigEtc)
    ? _def_communityConfigEtc
    : vCommunityConfigEtc

  const jsonConfigEtc = isEmpty(vJsonConfigEtc)
    ? _def_jsonConfigEtc
    : vJsonConfigEtc

  return {
    enterpriseConfig,
    communityConfig,
    configText,
    enterpriseConfigEtc,
    communityConfigEtc,
    jsonConfigEtc,
  }
}

export const saveConfig = (me, store, selectedRobotModeFlag) => {
  return {
    '0': () => enterpriseSaveLogic(me, store, selectedRobotModeFlag),
    '1': () => communitySaveLogic(me, store, selectedRobotModeFlag),
    '2': () => jsonSaveLogic(me, store, selectedRobotModeFlag),
  }[selectedRobotModeFlag]()
}

const enterpriseSaveLogic = (me, store, selectedRobotModeFlag) => {
  const api = new OrchestratorApi(me.enterpriseConfig)
  api
    .authenticate()
    .then(authResult => {
      me.enterpriseConfig.token.access_token = api.accessToken
      if (api.isToken) {
        me.enterpriseConfig.token.tokenGetDate = NaN
        me.enterpriseConfigEtc = {}
      } else {
        me.enterpriseConfig.token.tokenGetDate = Date.now()
        me.enterpriseConfigEtc = authResult
      }
      store.dispatch('appStore/saveEnterpriseConfig', {
        config: me.enterpriseConfig,
        selectedRobotModeFlag: selectedRobotModeFlag,
        configEtc: me.enterpriseConfigEtc,
      })
      // 選択した方だけVuexへ保存
      me.saveFinished = true
    })
    .catch(error => alertError(error))
}

const communitySaveLogic = (me, store, selectedRobotModeFlag) => {
  const api = new OrchestratorApi(me.communityConfig)
  api
    .authenticate()
    .then(authResult => {
      me.communityConfig.token.access_token = api.accessToken
      if (api.isToken) {
        me.communityConfig.token.tokenGetDate = NaN
      } else {
        me.communityConfig.token.tokenGetDate = Date.now()
      }
      me.communityConfigEtc = authResult
      store.dispatch('appStore/saveCommunityConfig', {
        config: me.communityConfig,
        selectedRobotModeFlag: selectedRobotModeFlag,
        configEtc: authResult,
      })
      // 選択した方だけVuexへ保存
      me.saveFinished = true
    })
    .catch(error => alertError(error))
}

const jsonSaveLogic = (me, store, selectedRobotModeFlag) => {
  const jsonConfig = JSON.parse(me.configText)
  const api = new OrchestratorApi(jsonConfig)
  api
    .authenticate()
    .then(authResult => {
      const tokenGetDate = api.isToken ? NaN : Date.now()
      Object.assign(jsonConfig, {
        token: {
          access_token: api.accessToken,
          tokenGetDate: tokenGetDate,
        },
      })
      me.configText = JSON.stringify(jsonConfig)
      store.dispatch('appStore/saveJsonConfig', {
        configText: me.configText,
        selectedRobotModeFlag: selectedRobotModeFlag,
        configEtc: authResult,
      })
      // 選択した方だけVuexへ保存
      me.saveFinished = true
    })
    .catch(error => alertError(error))
}

const alertError = error => {
  const message =
    Object.keys(error).length === 0 ? 'Unknown Error' : JSON.stringify(error)
  alert(message)
}

const _def_enterpriseConfig = {
  userinfo: {
    tenancyName: 'default',
    usernameOrEmailAddress: 'admin',
    password: '',
    // organizationUnit: null,
  },
  serverinfo: {
    servername: 'https://orchestrator.example.com',
  },
  token: {
    access_token: '',
  },
}

const _def_communityConfig = {
  serverinfo: {
    servername:
      'https://platform.uipath.com/[AccountLogicalName]/[ServiceName]',
    refresh_token: '[User Key]',
    tenant_logical_name: '[Tenant Logical Name]',
    client_id: '[Client Id]]',
  },
  token: {
    access_token: '',
  },
}
const _def_configText = ''

const _def_enterpriseConfigEtc = {}
const _def_communityConfigEtc = {}
const _def_jsonConfigEtc = {}
