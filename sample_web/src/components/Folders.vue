<template>
  <v-select
    v-if="orchestratorConfigSaved"
    v-model="localValue"
    :items="folders"
    :label="$t('message.components_folder_name')"
    dense
    prepend-icon="folder_open"
    item-text="DisplayName"
    item-value="Id"
    return-object
  ></v-select>
</template>

<script>
import { OrchestratorApi } from 'uipath-orchestrator-api-node'
import { getConfig } from '../configManager'

export default {
  name: 'Folders',
  props: {
    value: Object,
  },
  components: {},
  data: () => ({
    folders: [],
  }),
  computed: {
    orchestratorConfigSaved() {
      return this.$store.state.appStore.orchestratorConfigSaved
    },
    localValue: {
      get: function() {
        return this.value
      },
      set: function(value) {
        this.$emit('input', value) // おやでは @input に書いたメソッドがよばれる。引数にvalue
      },
    },
  },
  created: async function() {
    this.executeAPI()
  },
  watch: {
    orchestratorConfigSaved: {
      handler: function() {
        if (this.orchestratorConfigSaved) {
          this.executeAPI()
        }
      },
      deep: true,
    },
    localValue: {
      handler: function() {
        this.$store.dispatch('appStore/setSelectedFolder', this.localValue)
      },
      deep: true,
    },
  },
  methods: {
    async executeAPI() {
      const config = getConfig(this)
      if (config) {
        const api = new OrchestratorApi(config)
        try {
          await api.authenticate()
        } catch (error) {
          alert(error.message)
          return
        }
        const foldersP = api.folder.findAll().catch(error => {
          alert(error)
          return
        })
        const folders = await foldersP
        this.folders = folders
        this.localValue = folders[0]
      }
    },
  },
  // created: function() {
  //   console.log(config);
  // }
}
</script>
