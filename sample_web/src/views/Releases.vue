<template>
  <v-card v-if="$store.state.orchestratorConfigSaved">
    <v-card-title>
      プロセス一覧:({{ selectedFolder.DisplayName }})
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        prepend-icon="mdi-magnify"
        label="Search"
        single-line
      ></v-text-field>
      <RobotsSelect v-model="selectedRobot" />
      <v-btn
        bottom
        color="blue darken-3"
        dark
        small
        @click="groupBy = toggleGroupBy()"
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on">fas fa-robot</v-icon>
          </template>
          <span>ロボットグループでグルーピング</span>
        </v-tooltip>
      </v-btn>
      <v-card-actions>
        <v-btn
          bottom
          color="blue darken-3"
          dark
          small
          @click="executeAPI(true)"
        >
          <v-icon>mdi-reload</v-icon>
        </v-btn>
        <v-btn bottom color="blue darken-3" dark small @click="downloadExcel()">
          <v-icon>mdi-microsoft-excel</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="instances"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
      @current-items="getFiltered"
      :group-by="groupBy"
      item-key="Name"
    >
      <template v-slot:item.EnvironmentName="{ item }">
        <RobotsByGroup
          :value="item"
          :selectedRobot="selectedRobot"
          :ref="item.ProcessKey"
        />
        <a @click="openDialog(item.ProcessKey)">{{ item.EnvironmentName }}</a>
      </template>
      <!-- show-expand -->
      <!-- <template v-slot:expanded-item="{ item }">
        <td :colspan="headers.length">
          <RobotsByGroup :value="item" :selectedRobot="selectedRobot" />
        </td>
      </template> -->
    </v-data-table>
    <v-snackbar v-model="clipboard" bottom :timeout="2000" color="info">
      クリップボードにコピーしました
    </v-snackbar>
  </v-card>
</template>

<script>
// @ is an alias to /src
import OrchestratorApi from 'uipath-orchestrator-api-node'
import { getConfig } from '../myUtils'
import { saveAs } from 'file-saver'
import RobotsSelect from '../components/RobotsSelect'
import RobotsByGroup from '../components/RobotsByGroup'

export default {
  name: 'Home',
  components: { RobotsSelect, RobotsByGroup },
  data: () => ({
    search: '',
    instances: [],
    filteredItems: [],
    fixedHeader: true,
    clipboard: false,
    headers: [
      { text: '項番', value: 'dispId' },
      // { text: 'Name', value: 'Name' },
      { text: 'ProcessKey', value: 'ProcessKey' },
      { text: 'ProcessVersion', value: 'ProcessVersion' },
      { text: 'EnvironmentName', value: 'EnvironmentName' },
      // { text: '', value: 'data-table-expand' },
      // { text: '更新日', value: 'updatedAt' },
      // { text: '操作', align: 'center', value: 'action', sortable: false },
    ],
    selectedRobot: null,
    loading: false,
    groupBy: null,
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
    selectedFolderId: {
      handler: function() {
        this.executeAPI()
      },
      deep: true,
    },
    selectedRobot: {
      handler: function() {
        // console.log(this.selectedRobot)
        this.executeAPI(true)
      },
      deep: true,
    },
  },
  methods: {
    toggleGroupBy() {
      return this.groupBy == null ? 'EnvironmentName' : null
    },
    getFiltered(items) {
      this.filteredItems = items
    },
    copyClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        // console.log('テキストコピー完了')
        this.clipboard = true
      })
      // .catch(e => {
      // console.error(e)
      // })
    },
    async executeAPI(filterFlag) {
      this.loading = true
      const tmp = (await this.getReleases()).map((instance, index) => {
        instance.dispId = index + 1
        return instance
      })

      this.instances =
        filterFlag && this.selectedRobot
          ? tmp.filter(instance =>
              this.isExecutable(instance, this.selectedRobot),
            )
          : tmp
      this.loading = false
    },

    async downloadExcel() {
      const config = getConfig(this)
      const api = new OrchestratorApi(config)
      const blob = await api.release.save2ExcelBlob(this.filteredItems)
      saveAs(blob, 'releases.xlsx')
    },

    async getReleases() {
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
      const instanceP = api.release.findAll().catch(error => {
        this.loading = false
        alert(error)
        return
      })
      return instanceP
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
    openDialog(processKey) {
      this.$refs[processKey].openDialog()
    },
  },
  // created: function() {
  //   console.log(config);
  // }
}
</script>
