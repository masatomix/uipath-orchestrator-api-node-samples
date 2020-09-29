<template>
  <v-dialog v-model="localDialog" max-width="500px">
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">Type</th>
            <th class="text-left">StartJobs</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in robots" :key="item.Name">
            <td>{{ item.Name }}</td>
            <td>{{ item.Type | toProduct }}</td>
            <td>
              <a @click="startJobs(value, item.Name)">
                {{ $t('message.ジョブ実行') }}
              </a>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-dialog>
</template>

<script>
// @ is an alias to /src
import OrchestratorApi from 'uipath-orchestrator-api-node'
import { getConfig } from '../configManager'
import { isExecutable } from '../myUtils'
import { mapState } from 'vuex'

export default {
  props: {
    value: Object,
  },
  data: () => ({
    robots: [],
    localDialog: false,
    // headers: [
    //   { text: '名前', value: 'Name' },
    //   { text: 'Type', value: 'Type' },
    // ],
    loading: false,
  }),
  computed: mapState('appStore', {
    orchestratorConfigSaved: 'orchestratorConfigSaved',
    selectedFolder: 'selectedFolder',
    selectedFolderId: state => state.selectedFolder.Id,
  }),
  created: async function() {
    if (this.orchestratorConfigSaved) {
      this.executeAPI()
    }
  },
  methods: {
    async executeAPI() {
      this.loading = true
      const config = getConfig(this.$store)
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
    async startJobs(process, robotName) {
      const api = new OrchestratorApi(getConfig(this.$store))
      await api.authenticate()

      // const robotNames: string[] = await createRobotNames(api)
      // const processKey: string = await createProcessKey(api)
      // console.log(process.ProcessKey)
      // console.log(robotName)

      // パラメタはプロセス名と、ロボット名
      try {
        const result = await api.job.startJobs(process.ProcessKey, [robotName])
        alert(JSON.stringify(result))
        // console.log(result.value)
      } catch (error) {
        alert(error.body.message)
      }
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
