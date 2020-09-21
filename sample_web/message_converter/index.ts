const csv = require('csvtojson')

function main() {
  csv()
    .fromFile('lang.csv')
    .then((results: any[]) => {
      const json = results.reduce((accumulator, row) => {
        const key = row['key']
        delete row['key']
        accumulator[key] = {
          message: row,
        }
        return accumulator
      }, {})
      console.log(JSON.stringify(json))
    })
}

if (!module.parent) {
  main()
}
