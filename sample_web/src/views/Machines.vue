<template>
  <v-card v-if="orchestratorConfigSaved">
    <v-card-title>
      マシン一覧
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
      <v-card-actions>
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
      :items="machines"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
      @current-items="getFiltered"
    >
      <template v-slot:item.RobotVersions="{ item }">
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
      </template>
      <!-- <template v-slot:item.updatedAt="{ item }"> {{ item }}</template> -->
      <!-- <template v-slot:item.action="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">edit</v-icon>
        <v-icon small @click="deleteItem(item)">delete</v-icon>
      </template>-->
    </v-data-table>
    <v-snackbar v-model="clipboard" bottom :timeout="2000" color="info">
      クリップボードにコピーしました
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
    title: 'Machines',
  },
  components: {},
  data: () => ({
    search: '',
    machines: [],
    filteredItems: [],
    fixedHeader: true,
    clipboard: false,
    headers: [
      { text: '項番', value: 'dispId' },
      { text: 'マシン名', value: 'Name' },
      { text: 'Id', value: 'Id' },
      { text: 'Robot数', value: 'RobotVersions' },
      { text: 'LicenseKey', value: 'LicenseKey' },
      // { text: '更新日', value: 'updatedAt' },
      // { text: '操作', align: 'center', value: 'action', sortable: false },
    ],
    loading: false,
  }),

  // https://qiita.com/suin/items/7331905a45a8ff80d4dd
  // https://qiita.com/okumurakengo/items/0521049e79f927632cab
  // computed: {
  //   orchestratorConfigSaved() {
  //     return this.$store.state.appStore.orchestratorConfigSaved
  //   },
  // },
  // 上記と等価
  computed: mapState('appStore', ['orchestratorConfigSaved']),
  created: async function() {
    if (this.orchestratorConfigSaved) {
      this.executeAPI()
    }
  },

  methods: {
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
      const config = getConfig(this)
      // alert(JSON.stringify(config))
      const api = new OrchestratorApi(config)
      try {
        await api.authenticate()
      } catch (error) {
        this.loading = false
        alert(error.message)
        return
      }
      const machinesP = api.machine.findAll().catch(error => {
        this.loading = false
        alert(error)
        return
      })
      const machines = await machinesP
      this.machines = machines.map((machine, index) => {
        machine.dispId = index + 1

        api.machine.find(machine.Id).then(value => {
          machine.LicenseKey = value.LicenseKey
          // console.log(value.LicenseKey)
        })

        return machine
      })

      this.loading = false
      // this.$analytics.logEvent('Machines')

      // console.table(this.machines)
      // alert(message)
    },

    async downloadExcel() {
      const config = getConfig(this)
      const api = new OrchestratorApi(config)
      const blob = await api.robot.save2ExcelBlob(this.filteredItems)
      saveAs(blob, 'machines.xlsx')
    },
  },
  // created: function() {
  //   console.log(config);
  // }
}
</script>
