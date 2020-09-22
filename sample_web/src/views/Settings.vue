<template>
  <v-card>
    <v-card-title>
      {{ $t('message.menu_settings') }}
      <v-spacer></v-spacer>
    </v-card-title>

    <v-card-text>
      <v-radio-group v-model="selectedRobotModeFlag" row>
        <v-radio
          v-for="(robotModeFlag, i) in ['0', '1', '2']"
          :key="i"
          :label="$t(toValue(robotModeFlag))"
          :value="robotModeFlag"
        ></v-radio>
      </v-radio-group>
    </v-card-text>
    <v-card-text v-if="selectedRobotModeFlag === '0'">
      <v-text-field
        v-model="enterpriseConfig.serverinfo.servername"
        :label="$t('message.servername')"
      ></v-text-field>
      <v-text-field
        v-model="enterpriseConfig.userinfo.tenancyName"
        :label="$t('message.tenancy_name')"
      ></v-text-field>
      <v-text-field
        v-model="enterpriseConfig.userinfo.usernameOrEmailAddress"
        :label="$t('message.username_or_emailAddress')"
      ></v-text-field>
      <v-text-field
        v-model="enterpriseConfig.userinfo.password"
        :label="$t('message.password')"
        type="password"
      ></v-text-field>
      <v-text-field
        v-model="enterpriseConfig.token.access_token"
        :label="$t('message.token')"
      ></v-text-field>
      <!-- <v-text-field
        v-model="enterpriseConfig.userinfo.organizationUnit"
        label="organizationUnit"
      ></v-text-field> -->

      {{ enterpriseConfig }}
    </v-card-text>

    <v-card-text v-if="selectedRobotModeFlag === '1'">
      <v-text-field
        v-model="communityConfig.serverinfo.servername"
        :label="$t('message.servername')"
      ></v-text-field>
      <v-text-field
        v-model="communityConfig.serverinfo.tenant_logical_name"
        :label="$t('message.tenant_logical_name')"
      ></v-text-field>
      <v-text-field
        v-model="communityConfig.serverinfo.refresh_token"
        :label="$t('message.refresh_token')"
      ></v-text-field>
      <v-text-field
        v-model="communityConfig.serverinfo.client_id"
        :label="$t('message.client_id')"
      ></v-text-field>
      <v-text-field
        v-model="communityConfig.token.access_token"
        :label="$t('message.token')"
      ></v-text-field>
    </v-card-text>

    <v-card-text v-if="selectedRobotModeFlag === '2'">
      <v-textarea
        name="input-7-1"
        :label="$t('message.JSONで直接記述してください')"
        v-model="configText"
        rows="13"
      ></v-textarea>
    </v-card-text>
    <v-card-actions>
      <v-btn v-on:click="save(selectedRobotModeFlag)">
        {{ $t('message.保存') }}
      </v-btn>
      <v-btn v-on:click="copyClipboard(selectedRobotModeFlag)">
        <v-icon>assignment</v-icon>
      </v-btn>
    </v-card-actions>
    <v-snackbar v-model="saveFinished" bottom :timeout="3000" color="info">
      {{ $t('message.保存完了です') }}
    </v-snackbar>
    <v-snackbar v-model="clipboard" bottom :timeout="2000" color="info">
      {{ $t('message.クリップボードにコピーしました') }}
    </v-snackbar>
  </v-card>
</template>

<script>
// @ is an alias to /src
import config from 'config'
import { isEmpty, getConfigState } from '../myUtils'
import { saveConfig } from '../configManager'
import { mapState } from 'vuex'

export default {
  name: 'Home',
  metaInfo: {
    title: 'Settings',
  },
  components: {},
  data: () => ({
    saveFinished: false, // 保存オペをしたらtrue
    selectedRobotModeFlag: '0', // 今選択しているモード
    clipboard: false,
    def_enterpriseConfig: {
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
    },
    def_communityConfig: {
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
    },
    def_configText: '',
    enterpriseConfig: null,
    communityConfig: null,
    configText: '',
  }),
  computed: mapState('appStore', ['orchestratorConfigSaved']),
  created: function() {
    // Vuexからとる(1)。あったらコレを使う
    const vEnterpriseConfig = this.$store.state.appStore.enterpriseConfig
    const vCommunityConfig = this.$store.state.appStore.communityConfig
    const vJsonConfig = this.$store.state.appStore.jsonConfig

    const { isEnterprise, isCommunity } = getConfigState(config)

    // 初期値を取得(2)。(1)がなかったら、コレを使う。
    const def_enterpriseConfig = isEnterprise
      ? config
      : this.def_enterpriseConfig
    const def_communityConfig = isCommunity ? config : this.def_communityConfig
    const def_configText = this.def_configText

    // (1) が空なら(2)。ある場合は(1)
    this.enterpriseConfig = isEmpty(vEnterpriseConfig)
      ? def_enterpriseConfig
      : vEnterpriseConfig

    this.communityConfig = isEmpty(vCommunityConfig)
      ? def_communityConfig
      : vCommunityConfig

    this.configText = isEmpty(vJsonConfig)
      ? def_configText
      : JSON.stringify(vJsonConfig, null, 2)
  },
  methods: {
    save(selectedRobotModeFlag) {
      this.$store.dispatch('appStore/orchestratorConfigNotSaved')
      saveConfig(this, selectedRobotModeFlag)
    },

    copyClipboard(selectedRobotModeFlag) {
      const copyJSON = {
        '0': this.enterpriseConfig,
        '1': this.communityConfig,
        '2': this.configText ? JSON.parse(this.configText) : {},
      }[selectedRobotModeFlag]

      // console.log(JSON.stringify(copyJSON))

      navigator.clipboard
        .writeText(JSON.stringify(copyJSON, null, 2))
        .then(() => {
          // console.log('テキストコピー完了')
          this.clipboard = true
        })
      // .catch(e => {
      //   console.error(e)
      // })
    },
    toValue(robotModeFlag) {
      const map = {
        '0': 'message.Enterprise版',
        '1': 'message.Community版',
        '2': 'message.JSONで指定',
      }
      return map[robotModeFlag]
    },
  },
  // created: function() {
  //   console.log(config);
  // }
}
</script>
