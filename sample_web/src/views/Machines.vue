<template>
  <v-card>
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
      <v-btn bottom color="pink" dark fab small @click="executeAPI()">
        <v-icon>mdi-reload</v-icon>
      </v-btn>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="machines"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
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
    <v-alert dense type="info" dismissible v-model="clipboard"
      >クリップボードにコピーしました</v-alert
    >
  </v-card>
</template>

<script>
// @ is an alias to /src
import OrchestratorApi from 'uipath-orchestrator-api-node'
import config from 'config'

export default {
  name: 'Home',
  components: {},
  data: () => ({
    search: '',
    machines: [],
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
  created: async function() {
    this.executeAPI()
  },
  methods: {
    copyClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log('テキストコピー完了')
          this.clipboard = true
          setTimeout(() => (this.clipboard = false), 3000)
        })
        .catch(e => {
          console.error(e)
        })
    },
    async executeAPI() {
      this.loading = true
      // console.log(config);
      // console.log("test:", process.env.NODE_ENV);
      const api = new OrchestratorApi(config)

      await api.authenticate()
      const machines = await api.machine.findAll()
      this.machines = machines.map((machine, index) => {
        machine.dispId = index + 1

        api.machine.find(machine.Id).then(value => {
          machine.LicenseKey = value.LicenseKey
          // console.log(value.LicenseKey)
        })

        return machine
      })

      this.loading = false
      console.table(this.machines)
      // alert(message)
    },
  },
  // created: function() {
  //   console.log(config);
  // }
}
</script>
