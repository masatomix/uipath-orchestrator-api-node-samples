<template>
  <v-select
    v-if="orchestratorConfigSaved"
    v-model="localValue"
    prepend-icon="fas fa-robot"
    :items="instances"
    label="ロボットでフィルタ"
    item-text="Name"
    item-value="Id"
    return-object
  ></v-select>
</template>

<script>
import { OrchestratorApi } from 'uipath-orchestrator-api-node'
import { getConfig } from '../myUtils'

export default {
  name: 'RobotsSelect',
  props: {
    value: Object,
  },
  components: {},
  data: () => ({
    instances: [],
  }),
  computed: {
    orchestratorConfigSaved() {
      return this.$store.state.orchestratorConfigSaved
    },
    selectedFolder() {
      return this.$store.state.selectedFolder
    },
    selectedFolderId() {
      return this.$store.state.selectedFolder.Id
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
    selectedFolderId: {
      handler: function() {
        this.executeAPI()
      },
      deep: true,
    },
    orchestratorConfigSaved: {
      handler: function() {
        this.executeAPI()
      },
      deep: true,
    },
    // localValue: {
    //   handler: function() {
    //     this.$store.commit('selectedFolder', this.localValue)
    //   },
    //   deep: true,
    // },
  },
  methods: {
    async executeAPI() {
      const config = getConfig(this)
      if (config) {
        const api = new OrchestratorApi(config)
        api.organizationUnitId = this.selectedFolderId
        try {
          await api.authenticate()
        } catch (error) {
          alert(error.message)
          return
        }
        const promise = api.robot.findAll().catch(error => {
          alert(error)
          return
        })
        const instances = await promise
        instances.unshift({ Id: -9999, Name: 'ALL' })
        this.instances = instances
        this.localValue = instances[0]
      }
    },
  },
}
</script>
