<template>
  <v-card v-if="orchestratorConfigSaved">
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
        <RobotsByGroup :value="item" :ref="item.ProcessKey" />
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
      {{ $t('message.クリップボードにコピーしました') }}
    </v-snackbar>
  </v-card>
</template>

<script>
// @ is an alias to /src
import OrchestratorApi from 'uipath-orchestrator-api-node'
import { isExecutable } from '../myUtils'
import { getConfig } from '../configManager'
import { saveAs } from 'file-saver'
import { mapState } from 'vuex'
import RobotsSelect from '../components/RobotsSelect'
import RobotsByGroup from '../components/RobotsByGroup'

export default {
  name: 'Home',
  metaInfo: {
    title: 'Releases',
  },
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

      // filterFlagがたっていて、選択されたロボットがあるかつ、そのロボットのIdが -9999 (ALL) 以外なら、フィルタする
      this.instances =
        filterFlag && this.selectedRobot && this.selectedRobot.Id !== -9999
          ? tmp.filter(instance => isExecutable(instance, this.selectedRobot))
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
    openDialog(processKey) {
      this.$refs[processKey].openDialog()
    },
  },
  // created: function() {
  //   console.log(config);
  // }
}
</script>
