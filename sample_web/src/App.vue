<template>
  <v-app id="inspire">
    <v-navigation-drawer
      v-model="drawer"
      :clipped="$vuetify.breakpoint.lgAndUp"
      app
      v-if="loginStatus"
    >
      <v-container>
        <Folders v-model="selectedFolder" />
      </v-container>
      <v-list dense>
        <template v-for="item in localItems">
          <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="6">
              <v-subheader v-if="item.heading">{{ item.heading }}</v-subheader>
            </v-col>
            <v-col cols="6" class="text-center">
              <a href="#!" class="body-2 black--text">EDIT</a>
            </v-col>
          </v-row>
          <v-list-group
            v-else-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.model ? item.icon : item['icon-alt']"
            append-icon
          >
            <template v-slot:activator>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{ item.text }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-list-item v-for="(child, i) in item.children" :key="i">
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <!-- <v-list-item v-else :key="item.text" @click="$router.push(item.path)"> -->
          <v-list-item v-else :key="item.text" @click="gotoPath(item)">
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ $t(item.text) }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      :clipped-left="$vuetify.breakpoint.lgAndUp"
      app
      color="blue darken-3"
      dark
    >
      <v-toolbar-title style="width: 500px" class="ml-0 pl-4">
        <v-app-bar-nav-icon
          @click.stop="drawer = !drawer"
          v-if="loginStatus"
        ></v-app-bar-nav-icon>
        <span class="hidden-sm-and-down">{{ $t('message.AppName') }}</span>
        <span style="font-size: 0.75em">{{ mode }}</span>
      </v-toolbar-title>

      <div class="flex-grow-1"></div>

      <v-btn @click="logout()" v-if="loginStatus">{{
        $t('message.ログアウト')
      }}</v-btn>
      <!-- <v-btn icon>
        <v-icon>mdi-apps</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>mdi-bell</v-icon>
      </v-btn>
      <v-btn icon large>
        <v-avatar size="32px" item>
          <v-img
            src="https://cdn.vuetifyjs.com/images/logos/logo.svg"
            alt="Vuetify"
          ></v-img>
        </v-avatar>
      </v-btn>-->
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
    <oc-footer />
  </v-app>
</template>

<script>
import firebase from 'firebase'
import constants from '@/constants'
import Folders from './components/Folders'
import OcFooter from './components/OcFooter'
import OrchestratorApi from 'uipath-orchestrator-api-node'
import { getConfig } from './configManager'

export default {
  metaInfo() {
    return {
      // if no subcomponents specify a metaInfo.title, this title will be used
      title: 'Default Title',
      // all titles will be injected into this template
      titleTemplate: name =>
        name ? `${name} | My Orchestrator Webapp` : 'My Orchestrator Webapp',
      changed(metaInfo) {
        // console.log(metaInfo.title)
        firebase.analytics().setCurrentScreen(metaInfo.title)
        firebase.analytics().logEvent('page_view')
        firebase.analytics().logEvent('screen_view', {
          screen_name: metaInfo.title,
        })
      },
    }
  },
  props: {
    source: String,
  },
  components: {
    Folders,
    OcFooter,
  },
  computed: {
    loginStatus() {
      return this.$store.state.user.loginStatus
    },
    user() {
      return this.$store.state.user.user
    },
    orchestratorConfigSaved() {
      return this.$store.state.appStore.orchestratorConfigSaved
    },
    localItems() {
      if (this.$store.state.appStore.orchestratorConfigSaved) {
        return this.items
      }
      return this.items.filter(item => item.always === true)
    },
    mode() {
      const config = getConfig(this.$store)
      if (config) {
        const api = new OrchestratorApi(config)
        return api.isEnterprise ? '(Enterprise mode)' : '(Community mode)'
      }
      return ''
    },
  },
  data: () => ({
    drawer: null,
    items: [
      {
        icon: 'desktop_mac',
        text: 'message.menu_machines',
        path: 'machines',
        always: false,
      }, //マシン一覧
      { icon: 'fas fa-robot', text: 'message.menu_robots', path: 'robots' }, //ロボット一覧
      { icon: 'work', text: 'message.menu_licenses', path: 'licenses' }, // ライセンス状態
      {
        icon: 'fas fa-rocket',
        text: 'message.menu_releases',
        path: 'releases',
      }, //プロセス一覧
      {
        icon: 'settings',
        text: 'message.menu_ocsettings',
        path: 'ocsettings',
      }, //Orchestrator設定一覧'
      {
        icon: 'fas fa-cogs',
        text: 'message.menu_settings',
        path: 'settings',
        always: true,
      }, //WEB設定
    ],
    selectedFolder: null,
  }),
  // created: async function() {
  //   this.items = this.items.map(item => item)
  // },
  methods: {
    gotoPath: function(item) {
      this.$router.push({ path: item.path }).catch(() => {
        // console.log(error.message)
      })
    },
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router.push(constants.path.TOP)
          window.location.reload()
        })
        .catch(function(error) {
          const errorCode = error.code
          const errorMessage = error.message
          alert(errorCode, errorMessage)
        })
    },
  },
}
</script>
