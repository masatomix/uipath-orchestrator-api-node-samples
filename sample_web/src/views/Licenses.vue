<template>
  <v-card v-if="orchestratorConfigSaved">
    <v-card-title>
      ライセンス一覧:
      <v-text-field readonly></v-text-field>
      <v-card-actions>
        <v-btn bottom color="blue darken-3" dark small @click="executeAPI()">
          <v-icon>mdi-reload</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>

    <!-- ここから重複感あり -->
    <v-card-title>
      Runtime Licenses {{ runtimeLicensesStr }}
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
          @click="groupBy1 = toggleGroupBy1()"
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">desktop_mac</v-icon>
            </template>
            <span>マシンでグルーピング</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          bottom
          color="blue darken-3"
          dark
          small
          @click="downloadExcel1()"
        >
          <v-icon>mdi-microsoft-excel</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>
    <v-data-table
      :headers="headers1"
      :items="robots1"
      :search="search"
      :loading="loading1"
      loading-text="Loading... Please wait"
      @current-items="getFiltered1"
      :group-by="groupBy1"
    >
      <template v-slot:item.IsLicensed="{ item }">
        <oc-active v-model="item.IsLicensed" />
      </template>
      <template v-slot:item.Enabled="{ item }">
        <oc-active v-model="item.Enabled" />
      </template>
      <template v-slot:item.IsOnline="{ item }">
        <oc-active v-model="item.IsOnline" />
      </template>

      <template v-slot:item.robotType="{ item }">
        {{ item.robotType | toProduct }}
      </template>
    </v-data-table>

    <v-card-text>
      実行中/トレイ起動中 =>
      OC画面の「使用済み」と同じ。ロボットがトレイで起動中・ワークフロー実行中などのロボットの数。
      <br />ライセンス取得済み？ => OC画面の「ライセンス状況」
      のこと。ライセンスが割り当てられていて、実行可能な状態のこと。
      <br />接続済み？は、Windows上でRobotサービスが起動していて、OCへ接続済みかどうか。
      <br />アクティブ？もOC画面上のOn/Offスイッチの状態のこと。無効化されて、動かない状態にしてあったりすると、false。
    </v-card-text>

    <!-- ここから重複感あり -->
    <hr />
    <!-- ここから重複感あり -->
    <v-card-title>
      Named User Licenses {{ namedUserLicensesStr }}
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
          @click="groupBy2 = toggleGroupBy2()"
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon v-on="on">desktop_mac</v-icon>
            </template>
            <span>ユーザでグルーピング</span>
          </v-tooltip>
        </v-btn>
        <v-btn
          bottom
          color="blue darken-3"
          dark
          small
          @click="downloadExcel2()"
        >
          <v-icon>mdi-microsoft-excel</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>
    <v-data-table
      :headers="headers2"
      :items="robots2"
      :search="search"
      :loading="loading2"
      loading-text="Loading... Please wait"
      @current-items="getFiltered2"
      :group-by="groupBy2"
    >
      <template v-slot:item.LastLoginDate="{ item }">
        {{ item.LastLoginDate | toDateStr }}
      </template>
      <template v-slot:item.robotType="{ item }">
        {{ item.robotType | toProduct }}
      </template>
      <template v-slot:item.MachineNames="{ item }">
        <span v-html="$options.filters.toStr(item.MachineNames)">></span>
      </template>
      <template v-slot:item.ActiveMachineNames="{ item }">
        <span v-html="$options.filters.toStr(item.ActiveMachineNames)">></span>
      </template>
      <template v-slot:item.ActiveRobotId="{ item }">{{
        id2RobotName(item.ActiveRobotId)
      }}</template>

      <template v-slot:item.IsLicensed="{ item }">
        <oc-active v-model="item.IsLicensed">
          {{ item.LastLoginDate | toDateStr }}{{ inUseTime(item) }}
        </oc-active>
      </template>
    </v-data-table>
    <v-card-text>
      ライセンス取得済み？ => OC画面の「ライセンス状況」 のこと
      <br />取得済みのばあい、使用中マシン列にマシン名が表示されます。
    </v-card-text>
    <!-- ここから重複感あり -->
    <v-snackbar v-model="clipboard" bottom :timeout="2000" color="info"
      >クリップボードにコピーしました</v-snackbar
    >
  </v-card>
</template>

<script>
// @ is an alias to /src
import { OrchestratorApi } from 'uipath-orchestrator-api-node'
import { getConfig } from '../configManager'
import { saveAs } from 'file-saver'
import { mapState } from 'vuex'
import moment from 'moment-timezone'
import OcActive from '../components/OcActive'

export default {
  name: 'Home',
  metaInfo: {
    title: 'License',
  },
  components: { OcActive },
  data: () => ({
    search: '',
    robots1: [],
    robots2: [],
    filteredItems1: [],
    filteredItems2: [],
    fixedHeader: true,
    clipboard: false,
    headers1: [
      // { text: '項番', value: 'dispId' },
      // { text: 'Key', value: 'Key' },
      { text: 'RobotType', value: 'robotType' },
      { text: 'マシン名', value: 'MachineName' },
      // { text: 'MachineId', value: 'MachineId' },
      { text: '最大実行可能数', value: 'Runtimes' },
      { text: 'ロボット数', value: 'RobotsCount' },
      { text: '実行中/トレイ起動中', value: 'ExecutingCount' },
      { text: 'ライセンス取得済み？', value: 'IsLicensed' },
      { text: '接続済み？', value: 'IsOnline' },
      { text: 'アクティブ?', value: 'Enabled' },
    ],
    headers2: [
      // { text: '項番', value: 'dispId' },
      // { text: 'Key', value: 'Key' },
      { text: 'RobotType', value: 'robotType' },
      { text: 'ユーザ名', value: 'UserName' },
      // { text: 'ライセンス取得日時', value: 'LastLoginDate' },
      { text: 'マシン名(s)', value: 'MachineNames' },
      // { text: 'MachinesCount', value: 'MachinesCount' },
      { text: 'ライセンス取得済み？/取得日時', value: 'IsLicensed' },
      { text: '取得マシン(s)', value: 'ActiveMachineNames' },
      { text: '取得ロボット', value: 'ActiveRobotId' },
      // { text: 'IsExternalLicensed', value: 'IsExternalLicensed' },
    ],
    loading1: false,
    loading2: false,
    groupBy1: null,
    groupBy2: null,
    robots: [],
    licenseAllowed: null,
    licenseUsed: null,
  }),
  computed: {
    ...mapState('appStore', {
      orchestratorConfigSaved: 'orchestratorConfigSaved',
      selectedFolder: 'selectedFolder',
      selectedFolderId: state => state.selectedFolder.Id,
    }),
    runtimeLicensesStr() {
      if (this.licenseUsed) {
        const robotType = 'Unattended'
        const result = licenseStr(
          this.licenseUsed,
          this.licenseAllowed,
          robotType,
        )
        return `( ${result} )`
      }
      return ''
    },
    namedUserLicensesStr() {
      //  { "Unattended": 2, "Attended": 1, "NonProduction": 0, "Development": 4, "StudioX": 0 }
      if (this.licenseUsed) {
        // return this.licenseUsed
        const robotTypes = ['Attended', 'Development', 'StudioX']
        const result = robotTypes
          .map(robotType =>
            licenseStr(this.licenseUsed, this.licenseAllowed, robotType),
          )
          .reduce((accumulator, current) => {
            return accumulator + ', ' + current
          })
        return `( ${result} )`
      }
      return ''
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
    toggleGroupBy1() {
      return this.groupBy1 == null ? 'Key' : null
    },
    toggleGroupBy2() {
      return this.groupBy2 == null ? 'UserName' : null
    },
    getFiltered1(items) {
      this.filteredItems1 = items
    },
    getFiltered2(items) {
      this.filteredItems2 = items
    },
    copyClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.clipboard = true
      })
    },
    async executeAPI() {
      const api = await getApi(this)
      {
        api.license.find().then(results => {
          this.licenseAllowed = results.Allowed
          this.licenseUsed = results.Used
        })
      }
      {
        api.robot.findAll().then(results => (this.robots = results))
      }
      {
        const robotType = 'Unattended'
        api.license
          .getRuntimeLicenses(robotType)
          .then(results => {
            this.robots1 = results.map(result =>
              Object.assign({}, result, { robotType: robotType }),
            )
          })
          .catch(error => {
            this.loading1 = false
            alert(error)
            return
          })
        this.loading1 = false
      }
      {
        const robotTypes = ['Attended', 'Development']
        const promises = robotTypes.map(robotType => {
          return api.license
            .getNamedUserLicenses(robotType)
            .then(results =>
              results.map(result =>
                Object.assign({}, result, { robotType: robotType }),
              ),
            )
            .catch(error => {
              this.loading2 = false
              alert(error)
              return
            })
        })

        const licenses_s = await Promise.all(promises)
        this.robots2 = licenses_s.reduce((accumulator, current) => {
          return accumulator.concat(current)
        }, [])
        this.loading2 = false
      }
    },

    async downloadExcel1() {
      const config = getConfig(this)
      const api = new OrchestratorApi(config)
      const blob = await api.robot.save2ExcelBlob(this.filteredItems1)
      saveAs(blob, 'RuntimeLicenses.xlsx')
    },

    async downloadExcel2() {
      const config = getConfig(this)
      const api = new OrchestratorApi(config)
      const blob = await api.robot.save2ExcelBlob(this.filteredItems2)
      saveAs(blob, 'NamedUserLicenses.xlsx')
    },

    id2RobotName(robotId) {
      // robotId のある列について
      if (robotId) {
        // 選択されたフォルダのロボットが取得できている場合
        if (this.robots) {
          const robot = this.robots.find(robot => robot.Id === robotId)
          return robot ? robot.Name : '別フォルダのロボット' // そのフォルダではないロボットの場合もある
        }
      }
      return ''
    },
    inUseTime(item) {
      if (item.IsLicensed) {
        const targetDate = moment(item.LastLoginDate)
        const now = moment()

        // const targetDate = moment('2020/01/01 00:00:01')
        // const now = moment('2021/01/01 02:55:01')

        const diffOrg = now.diff(targetDate) / 1000.0
        let diff = diffOrg //(s)
        let unit = '秒'
        // let fixed = '秒'
        const secMax = 60.0
        const minMax = secMax * 60.0
        const hourMax = minMax * 24.0

        if (diffOrg >= secMax) {
          diff = diffOrg / secMax //(m)
          unit = '分'
        }
        if (diffOrg >= minMax) {
          diff = diffOrg / minMax //(h)
          unit = '時間'
        }
        if (diffOrg >= hourMax) {
          diff = diffOrg / hourMax //(d)
          unit = '日'
        }
        const calc = Math.floor(diff * Math.pow(10, 1)) / Math.pow(10, 1) // 第二位で切り捨て
        return ` (${calc} ${unit})`
      } else {
        return ''
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
    toDateStr: function(date) {
      return moment(date).format('yyyy/MM/DD HH:mm')
    },
    toStr: function(MachineNames) {
      if (MachineNames.length != 0) {
        return (
          MachineNames.reduce(
            (accumulator, current) => accumulator + ', ' + current,
          ) + machineLength(MachineNames)
        )
      } else {
        return ''
      }
    },
  },
}
async function getApi(me) {
  me.loading1 = true
  me.loading2 = true
  const config = getConfig(me)
  const api = new OrchestratorApi(config)
  api.organizationUnitId = me.selectedFolderId
  try {
    await api.authenticate()
  } catch (error) {
    me.loading1 = false
    me.loading2 = false
    alert(error.message)
    return
  }
  return api
}
function machineLength(MachineNames) {
  return MachineNames.length > 1 ? ` (${MachineNames.length}台)` : ''
}
function licenseStr(licenseUsed, licenseAllowed, robotType) {
  return `${robotType}: ${licenseUsed[robotType]}/${licenseAllowed[robotType]}`
}
</script>
