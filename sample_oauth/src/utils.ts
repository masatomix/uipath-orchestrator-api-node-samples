import http, { IncomingMessage, ServerResponse } from 'http'
import url from 'url'
import request from 'request'


// https://qiita.com/fukasawah/items/db7f0405564bdc37820e 感謝！
export const getRandomString = (): string => {
    const S = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const N = 50
    const randomValue = Array.from(Array(N))
        .map(() => S[Math.floor(Math.random() * S.length)])
        .join('')
    return randomValue
}

export const getAuthorizationCode = (redirect_uri: string): Promise<string> => {
    const portNumber: number = Number(new URL(redirect_uri).port)
    return new Promise<string>((resolve, reject) => {
        const server = startWebServer()

        // endFlagがtrueだったり、60s経っていたらサーバを落とす
        const limitCounter = 60 // このWEBサーバが何秒でタイムアウトするか。
        let counter = 0
        let endFlag = false
        const id = setInterval(() => {
            if (endFlag) {
                //  参考: https://sasaplus1.hatenadiary.com/entry/20121129/1354198092
                server.close()
                clearInterval(id) // 繰り返しをやめちゃう
            } else if (counter > limitCounter) {
                server.close()
                reject(`${limitCounter} 秒でタイムアウトしました`)
                clearInterval(id) // 繰り返しをやめちゃう
            }
            counter++
        }, 1000)

        function startWebServer() {
            const server = http.createServer()
            server.on('request', (req: IncomingMessage, res: ServerResponse): void => {
                const queryObject = url.parse(req.url!, true).query
                res.writeHead(200, { 'content-type': 'application/json' })
                res.end(JSON.stringify(queryObject, null, 2))

                if (queryObject.code) {
                    resolve(queryObject.code as string)
                    // Webサーバ終了フラグを立てる
                    endFlag = true
                    req.socket.end()
                    req.socket.destroy()
                }
                else {
                    reject(queryObject)
                    endFlag = true
                    req.socket.end()
                    req.socket.destroy()
                }
            })
            server.listen(portNumber, () => console.log(`Server running at ${redirect_uri} .. (${limitCounter} 秒でタイムアウトします。)`))
            return server
        }
    })
}

// Requestを送信して、ResponseのBodyデータを返す。
export const doRequest = (option: any): Promise<any> => {
    // option = Object.assign({}, option, {
    // proxy: 'http://127.0.0.1:8888',
    //     strictSSL: false,
    // })
    return new Promise<any>((resolve, reject) => {
        request(option, (error: any, response: any, body: any) =>
            !error && response.statusCode === 200 ? resolve(body) : reject(body))
    })
}