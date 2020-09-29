<template>
  <v-footer>
    <v-spacer></v-spacer>
    <button v-on:click="changeLocale('ja')" style="margin: 5px">
      <flag iso="jp" />
    </button>
    <button v-on:click="changeLocale('en')" style="margin: 5px">
      <flag iso="us" />
    </button>
    <div>
      &copy; Masatomi KINO.{{ new Date().getFullYear() }}
      <span style="font-size: 0.8em">{{ urlStr }}</span>
    </div>
  </v-footer>
</template>

<script>
import { getConfig } from '../configManager'

export default {
  name: 'OcFooter',
  // props: {
  //   value: Boolean,
  // },
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
    urlStr() {
      const config = getConfig(this.$store)
      return config ? `(${config.serverinfo.servername})` : ''
    },
  },
  methods: {
    changeLocale(locale) {
      this.$i18n.locale = locale // app のi18n
      this.$vuetify.lang.current = locale // vuetifyのGUIのi18n
    },
  },
}
</script>
