import config from 'config'
import { OrchestratorApi } from 'uipath-orchestrator-api-node'

const api: OrchestratorApi = new OrchestratorApi(config)

const main = async function () {
  try {
    const token: any = await api.authenticate()
    console.log(token)
    const machines: Array<any> = await api.machine.findAll()
    console.table(machines)
  } catch (error) {
    console.error(error)
  }
}

if (!module.parent) {
  main()
}
