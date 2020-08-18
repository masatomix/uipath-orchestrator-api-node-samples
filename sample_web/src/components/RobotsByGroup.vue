<template>
  <v-dialog v-model="localDialog" max-width="300px">
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in robots" :key="item.Name">
            <td>{{ item.Name }}</td>
            <td>{{ item.Type | toProduct }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-dialog>
</template>

<script>
// @ is an alias to /src
import OrchestratorApi from 'uipath-orchestrator-api-node'
import { getConfig, isExecutable } from '../myUtils'

export default {
  props: {
    value: Object,
  },
  data: () => ({
    robots: [],
    localDialog: false,
    headers: [
      { text: '名前', value: 'Name' },
      { text: 'Type', value: 'Type' },
    ],
    loading: false,
  }),
  computed: {
    orchestratorConfigSaved() {
      return this.$store.state.appStore.orchestratorConfigSaved
    },
    selectedFolder() {
      return this.$store.state.appStore.selectedFolder
    },
    selectedFolderId() {
      return this.$store.state.appStore.selectedFolder.Id
    },
  },
  created: async function() {
    if (this.orchestratorConfigSaved) {
      this.executeAPI()
    }
  },
  methods: {
    async executeAPI() {
      this.loading = true
      const config = getConfig(this)
      const api = new OrchestratorApi(config)
      api.organizationUnitId = this.selectedFolderId
      try {
        await api.authenticate()
      } catch (error) {
        this.loading = false
        alert(error.message)
        return
      }
      const robotsP = api.robot.findAll().catch(error => {
        this.loading = false
        alert(error)
        return
      })
      const robots = await robotsP
      // this.robots = robots
      this.robots = robots.filter(robot => isExecutable(this.value, robot))
      this.loading = false
    },
    openDialog() {
      this.localDialog = true
    },
  },
  filters: {
    toProduct: function(type) {
      if (type === 'Development') {
        return 'Studio'
      }
      return type
    },
  },
}
</script>
