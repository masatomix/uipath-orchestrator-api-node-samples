<template>
  <v-card v-if="orchestratorConfigSaved">
    <v-card-title>
      {{ $t('message.menu_robots') }}: ({{ selectedFolder.DisplayName }})
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>

      <v-card-actions>
        <v-btn
          bottom
          color="blue darken-3"
          dark
          small
          @click="groupBy = toggleGroupBy()"
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">desktop_mac</v-icon>
            </template>
            <span>{{ $t('message.GroupingByMachine') }}</span>
          </v-tooltip>
        </v-btn>
        <v-btn bottom color="blue darken-3" dark small @click="executeAPI()">
          <v-icon>mdi-reload</v-icon>
        </v-btn>
        <v-btn bottom color="blue darken-3" dark small @click="downloadExcel()">
          <v-icon>mdi-microsoft-excel</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="robots"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
      @current-items="getFiltered"
      :group-by="groupBy"
    >
      <template v-slot:item.Type="{ item }">
        {{ item.Type | toProduct }}</template
      >
      <!-- <template v-slot:item.RobotVersions="{ item }">
        <span>{{ item.RobotVersions.length }}</span>
      </template>
      <template v-slot:item.LicenseKey="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              v-bind="attrs"
              v-on="on"
              small
              class="mr-2"
              @click="copyClipboard(item.LicenseKey)"
              >assignment</v-icon
            >
          </template>
          <span>LicenseKey: {{ item.LicenseKey }}</span>
        </v-tooltip>
      </template>-->
      <!-- <template v-slot:item.updatedAt="{ item }"> {{ item }}</template> -->
      <!-- <template v-slot:item.action="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">edit</v-icon>
        <v-icon small @click="deleteItem(item)">delete</v-icon>
      </template>-->
    </v-data-table>
    <v-snackbar v-model="clipboard" bottom :timeout="2000" color="info">
      {{ $t('message.クリップボードにコピーしました') }}
    </v-snackbar>
  </v-card>
</template>

<script>
// @ is an alias to /src
import OrchestratorApi from 'uipath-orchestrator-api-node'
import { getConfig } from '../configManager'
import { saveAs } from 'file-saver'
import { mapState } from 'vuex'

export default {
  name: 'Home',
  metaInfo: {
    title: 'Robot',
  },
  components: {},
  data: () => ({
    search: '',
    robots: [],
    filteredItems: [],
    fixedHeader: true,
    clipboard: false,
    loading: false,
    groupBy: null,
  }),
  computed: {
    ...mapState('appStore', {
      orchestratorConfigSaved: 'orchestratorConfigSaved',
      selectedFolder: 'selectedFolder',
      selectedFolderId: state => state.selectedFolder.Id,
    }),
    headers() {
      return [
        // { text: '項番', value: 'dispId' },
        { text: 'Id', value: 'Id' },
        { text: this.$t('message.ロボット名'), value: 'Name' },
        { text: this.$t('message.マシン名'), value: 'MachineName' },
        { text: this.$t('message.ユーザ名'), value: 'Username' },
        { text: this.$t('message.RobotType'), value: 'Type' },
        {
          text: this.$t('message.ロボットグループ'),
          value: 'RobotEnvironments',
        },
        // { text: '更新日', value: 'updatedAt' },
        // { text: '操作', align: 'center', value: 'action', sortable: false },
      ]
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
  },
  methods: {
    toggleGroupBy() {
      return this.groupBy == null ? 'MachineName' : null
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
      //   console.error(e)
      // })
    },
    async executeAPI() {
      this.loading = true
      // console.log(config);
      // console.log("test:", process.env.NODE_ENV);
      const config = getConfig(this.$store)
      // alert(JSON.stringify(config))
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
      this.robots = robots
      // this.robots = robots.map((machine, index) => {
      //   machine.dispId = index + 1

      //   api.machine.find(machine.Id).then(value => {
      //     machine.LicenseKey = value.LicenseKey
      //     // console.log(value.LicenseKey)
      //   })

      //   return machine
      // })

      this.loading = false
      // console.table(this.robots)
      // alert(message)
    },

    async downloadExcel() {
      const config = getConfig(this.$store)
      const api = new OrchestratorApi(config)
      const blob = await api.robot.save2ExcelBlob(this.filteredItems)
      saveAs(blob, 'robots.xlsx')
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
