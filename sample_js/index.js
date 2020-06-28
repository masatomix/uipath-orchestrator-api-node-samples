const config = require('config')
const { OrchestratorApi } = require('uipath-orchestrator-api-node')

const oc = new OrchestratorApi(config)

const main = async function () {
  try {
    const token = await oc.authenticate()
    console.log(token)
    const machines = await oc.machine.findAll()
    console.table(machines)
  } catch (error) {
    console.error(error)
  }
}

if (!module.parent) {
  main()
}
