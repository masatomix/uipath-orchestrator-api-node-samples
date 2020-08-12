<template>
  <v-card v-if="$store.state.orchestratorConfigSaved">
    <v-card-title>
      Orchestrator設定一覧
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
      <v-btn bottom color="pink" dark fab small @click="executeAPI()">
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="instances"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
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
      </template> -->
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
import { getConfig } from '../myUtils'

export default {
  name: 'Home',
  components: {},
  data: () => ({
    search: '',
    instances: [],
    fixedHeader: true,
    clipboard: false,
    headers: [
      { text: '項番', value: 'dispId' },
      { text: 'Id', value: 'Id' },
      { text: 'Value', value: 'Value' },
      { text: 'Name', value: 'Name' },
      // { text: '更新日', value: 'updatedAt' },
      // { text: '操作', align: 'center', value: 'action', sortable: false },
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
    this.executeAPI()
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
    copyClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log('テキストコピー完了')
          this.clipboard = true
        })
        .catch(e => {
          console.error(e)
        })
    },
    async executeAPI() {
      this.loading = true
      const config = getConfig(this)
      const api = new OrchestratorApi(config)
      // api.organizationUnitId = this.selectedFolderId
      try {
        await api.authenticate()
      } catch (error) {
        this.loading = false
        alert(error.message)
        return
      }
      const instanceP = api.setting.findAll().catch(error => {
        this.loading = false
        alert(error)
        return
      })
      this.instances = (await instanceP).map((instance, index) => {
        instance.dispId = index + 1
        return instance
      })

      this.loading = false
      console.table(this.instances)
    },
  },
  // created: function() {
  //   console.log(config);
  // }
}
</script>
