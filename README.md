<p>
  <a href="https://github.com/masatomix/uipath-orchestrator-api-node-samples#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/masatomix/uipath-orchestrator-api-node-samples/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/masatomix/uipath-orchestrator-api-node-samples/blob/master/LICENSE" target="_blank">
    <img alt="License: Apache--2.0" src="https://img.shields.io/github/license/masatomix/uipath-orchestrator-api-node-samples" />
  </a>
</p>



[UiPath Orchestrator のAPI](https://docs.uipath.com/orchestrator/lang-ja/reference#about-odata-and-references) を Node.jsから呼び出すライブラリ[uipath-orchestrator-api-node](https://github.com/masatomix/uipath-orchestrator-api-node)のサンプルです。。

環境構築をして、動かしてみましょう。


## 環境構築

### Node.jsのインストール

インストールの方法はいろいろとあるのですが、シンプルにやるなら公式のインストーラを使えばOK。
(つぎへつぎへ、でデフォルト選択でOKです)
インストーラは2020/06/29 現在、 https://nodejs.org/dist/v12.18.1/node-v12.18.1-x64.msi などでよいでしょう。


最終的に

```console
Z:\> node --version
v12.18.1

Z:\> npm --version
6.14.5

Z:\>
```

となればOKです。


### サンプルコードを取得

https://github.com/masatomix/uipath-orchestrator-api-node-samples

よりソースを取得します。GitHubなどを扱ったことがないかたは、[GitHubでソースコード管理するハンズオン](https://qiita.com/masatomix/items/a3f99a1700a835e845dd) などの記事などを参考にして、適宜SourceTree等でソースをダウンロードしてください。

コマンドラインからGitを操作する場合は

```console
Z:\git> git clone https://github.com/masatomix/uipath-orchestrator-api-node-samples
Cloning into 'uipath-orchestrator-api-node-samples'...
remote: Enumerating objects: 108, done.
remote: Counting objects: 100% (108/108), done.
..
Z:\git> cd uipath-orchestrator-api-node-samples
Z:\git\uipath-orchestrator-api-node-samples>

```

でOKです。


## やってみる

さてやってみます。JavaScript版を動かしてみるので、まずはディレクトリを移動します。

```console
Z:\git\uipath-orchestrator-api-node-samples> cd sample_js
Z:\git\uipath-orchestrator-api-node-samples\sample_js> 
```

UiPath Orchestrator APIを使用するために、**OCのURLやユーザ情報などを記載した設定ファイルを ``config\local.json`` に作成**します。設定ファイルは、**利用しているOrchestratorによって記述内容が異なる**ので、各環境にあわせて下記の通り作ってみましょう。

参考: https://github.com/masatomix/uipath-orchestrator-api-node#preferences

Orchestrator Enterprise版(オンプレ)の場合


```json
{
  "userinfo": {
    "tenancyName": "default",
    "usernameOrEmailAddress": "admin",
    "password": "xxxxxx"
  },
  "serverinfo": {
    "servername": "https://www.example.com/"
  }
}
```

Orchestrator Cloud 版の場合

```json
{
  "serverinfo": {
    "servername": "https://platform.uipath.com/[AccountLogicalName]/[ServiceName]",
    "refresh_token": "[User Key]",
    "tenant_logical_name": "[Tenant Logical Name]",
    "client_id": "[Client Id]]"
  }
}
```

つづいて依存モジュールのインストール

```console
Z:\git\uipath-orchestrator-api-node-samples\sample_js> npm i

... なんか、``gyp ERR! find Python Python is not set from command line or npm configuration``などとエラーが出てる場合もあるけど
きにしない

```


いよいよ実行です

```console
Z:\git\uipath-orchestrator-api-node-samples\sample_js> node index.js
{
  result: 'xxxxxDw2Y2pb66shqNBs6qGWriVAwLuAiBjxdGTPsTYXNUWspQN6wRopq4Dg',
  targetUrl: null,
  success: true,
  error: null,
  unAuthorizedRequest: false,
  __abp: true
}
┌─────────┬────────────┬────────────┬─────────────┬────────────┬────────────────────┬─────────────────┬──────┬───────────────┐
│ (index) │ LicenseKey │    Name    │ Description │    Type    │ NonProductionSlots │ UnattendedSlots │  Id  │ RobotVersions │
├─────────┼────────────┼────────────┼─────────────┼────────────┼────────────────────┼─────────────────┼──────┼───────────────┤
│    0    │    null    │ 'WINDOWS'  │    null     │ 'Standard' │         0          │        0        │  86  │      []       │
│    1    │    null    │ 'PBPC0124' │    null     │ 'Standard' │         0          │        0        │  87  │      []       │
│    2    │    null    │ 'PBPC0281' │    null     │ 'Standard' │         0          │        0        │ 2559 │      []       │
└─────────┴────────────┴────────────┴─────────────┴────────────┴────────────────────┴─────────────────┴──────┴───────────────┘

Z:\git\uipath-orchestrator-api-node-samples\sample_js>
```



返ってきましたね。




## その他

### 実行してみる(TypeScript)

そのうちQiita化します



### 実行してみる(Webから)

そのうちQiita化します



## Revision history

改訂履歴

- 0.0.2 ドキュメント整理ほか
- 0.0.1 初版作成



## Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/masatomix/uipath-orchestrator-api-node-samples/issues).

## Show your support

Give a ⭐️ if this project helped you!

## License

Copyright © 2020 [Masatomi KINO](https://github.com/masatomix).<br />
This project is [Apache--2.0](https://github.com/masatomix/uipath-orchestrator-api-node-samples/blob/master/LICENSE) licensed.

***
_This README was generated by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
