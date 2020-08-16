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
import { getConfig } from '../myUtils'

export default {
  props: {
    value: Object,
    selectedRobot: Object,
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
      return this.$store.state.orchestratorConfigSaved
    },
    selectedFolder() {
      return this.$store.state.selectedFolder
    },
    selectedFolderId() {
      return this.$store.state.selectedFolder.Id
    },
  },
  created: async function() {
    if (this.orchestratorConfigSaved) {
      this.executeAPI()
    }
  },
  watch: {
    selectedRobot: {
      handler: function() {
        this.executeAPI()
      },
      deep: true,
    },
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
      this.robots = robots.filter(robot => this.isExecutable(this.value, robot))
      this.loading = false
    },

    isExecutable(release, robot) {
      if (robot.Id === -9999) {
        return true
      }
      // console.log(`トレイ上のプロセス名: ${release.Name}`)
      // console.log(`紐付くロボットグループ: ${release.EnvironmentName}`)
      const robotEnvironments = robot.RobotEnvironments.split(',')
      // console.log(`ロボが属するロボットグループ(配列): ${robotEnvironments}`)

      if (robotEnvironments.length > 0) {
        // ロボが属するグループ名を繰り返しチェックして、プロセスのグループ名と一致しているモノが一つでもあったらtrue/なかったらfalse
        return (
          robotEnvironments.filter(
            robotEnvironment => robotEnvironment == release.EnvironmentName,
          ).length > 0
        )
      }
      return false
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
