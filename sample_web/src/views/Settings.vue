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
      ></v-text-field>-->
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
import { saveConfig, restoreConfig } from '../configManager'
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
    enterpriseConfig: null,
    communityConfig: null,
    configText: '',

    enterpriseConfigEtc: null,
    communityConfigEtc: null,
    jsonConfigEtc: null,
  }),
  computed: {
    ...mapState('appStore', ['orchestratorConfigSaved']),
    tokenGetDate() {
      return {
        '0': this.$store.state.appStore.enterpriseConfig.token,
        '1': this.$store.state.appStore.communityConfig.token,
        '2': this.$store.state.appStore.jsonConfig.token,
      }
    },
    // env: () => process.env.NODE_ENV,
    // firebaseConfig: () => firebaseConfig,
  },
  created: function() {
    const retConfig = restoreConfig(this.$store)

    this.enterpriseConfig = retConfig.enterpriseConfig
    this.communityConfig = retConfig.communityConfig
    this.configText = retConfig.configText
    this.enterpriseConfigEtc = retConfig.enterpriseConfigEtc
    this.communityConfigEtc = retConfig.communityConfigEtc
    this.jsonConfigEtc = retConfig.jsonConfigEtc
  },
  methods: {
    save(selectedRobotModeFlag) {
      this.$store.dispatch('appStore/orchestratorConfigNotSaved')
      try {
        saveConfig(this, this.$store, selectedRobotModeFlag)
      } catch (error) {
        alert(`エラーが発生しました: ${error}`)
      }
    },

    copyClipboard(selectedRobotModeFlag) {
      const copyJSONFunc = () => {
        switch (selectedRobotModeFlag) {
          case '0':
            return this.enterpriseConfig
          case '1':
            return this.communityConfig
          case '2':
            return this.configText ? JSON.parse(this.configText) : {}
        }
      }
      try {
        const copyJSON = copyJSONFunc(selectedRobotModeFlag)
        navigator.clipboard
          .writeText(JSON.stringify(copyJSON, null, 2))
          .then(() => (this.clipboard = true))
      } catch (error) {
        alertError(error)
      }
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
}
const alertError = error => {
  const message = 'JSON形式が不正のようです'
  alert(`${message}: ${error}`)
}
</script>
