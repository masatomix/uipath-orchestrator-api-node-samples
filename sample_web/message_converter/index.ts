const csv = require('csvtojson')

// usage
// % pwd
// /xxxxx/uipath-orchestrator-api-node-samples/sample_web
// % npx ts-node ./message_converter/index.ts > ./src/lang.json

function main() {
  csv({ noheader: true })
    .fromFile('messages.csv')
    .then((matrix: string[][]) => {
      // 行列を入れ替え
      const newResults: string[][] = transpose(matrix)
      // 1行目はヘッダとしてshiftで取り出し、それ以外をデータ部とする
      const headings: string[] = newResults.shift()

      // rowとしてくる行データを使って、headingsのおなじindex番号をプロパティとして、obj を構成する
      const json = newResults.reduce((accumulator, row: string[]) => {
        const obj = {}
        for (let index = 0; index < row.length; index++) {
          obj[headings[index]] = row[index]
        }

        const key = obj['key']
        delete obj['key'] // keyプロパティはデータとしては不要

        accumulator[key] = {
          message: obj,
        }
        return accumulator
      }, {})
      console.log(JSON.stringify(json))
    })
}

function transpose(matrix: string[][]): string[][] {
  return Object.keys(matrix[0]).map((column) => matrix.map((row) => row[column]))
  // const keys: string[] = Object.keys(matrix[0])
  // // console.log(matrix[0])
  // // 列方向の処理
  // return keys.map((column) => {
  //    return matrix.map((row) => row[column])
  // })
}

if (!module.parent) {
  main()
}
