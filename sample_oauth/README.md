こんにちは。[UiPath Friendsコミュニティ](https://uipath-friends.doorkeeper.jp/)運営メンバの @masatomix です。

## イントロ


<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">公式がPowerShell使ってるヤツ、JavaScriptで作ってみています。<a href="https://t.co/NXO9xqibHD">https://t.co/NXO9xqibHD</a><br><br>公式:<a href="https://t.co/oEVEzOAMVd">https://t.co/oEVEzOAMVd</a><a href="https://twitter.com/hashtag/UiPathFriends?src=hash&amp;ref_src=twsrc%5Etfw">#UiPathFriends</a></p>&mdash; Masatomi KINO (@masatomix) <a href="https://twitter.com/masatomix/status/1546493146564988929?ref_src=twsrc%5Etfw">July 11, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> 

公式のサイトで
[外部アプリケーション機能(OAuth)によるOrchestrator APIコール実装方法](https://www.uipath.com/ja/resources/knowledge-base/implementing-orchestrator-api-with-oauth) という記事が公開されていて、PowerShellのサンプルコードが配布されていました。が、PowershellはWindowsでしか動かないし[^1]、動かすにはWebDriverのexeとかが必要だったり環境設定がちょっとメンドクサイですよね。

[^1]: APIは単なるHTTPだしWindowsだけでなく、任意のOS環境で動かしたいしね。

というわけで、自分がよく使ってるTypeScriptで同じようなサンプルを作ってみたので、その使い方を記事にしました。コマンドプロンプトやターミナルから起動すると

- Webブラウザが起動して
- Orchestrator(以下OC)にログインしていなければ、ログインをうながされ
- そのユーザに紐付いたアクセストークンを取得し
- そのアクセストークンでマシン情報やOCのユーザ情報を取得する

って動くようにしてあります。
コマンドプロンプトからブラウザが起動するところはなんだかおぉってなりますね。
さあTypeScriptが動かせる環境も含めて、環境構築して動かしてみましょう。

## あちなみにこのOAuthって

ちなみに、このサンプルや公式で使用している**OAuthという処理シーケンスが導入された経緯、メリットなどについては下記を参照**してみてください。

https://www.youtube.com/watch?v=f1u3f1I93XY&t=28448s



## 環境構築

### Node.jsのインストール

TypeScriptを実行する環境として、Node.jsをインストールします[^2]。
インストールの方法はいろいろとあるのですが、シンプルにやるなら[公式](https://nodejs.org/ja/)のインストーラを使えばOK。つぎへつぎへ、でデフォルト選択でOKです。インストーラの最新版は2022/07/14 現在、16.16.0 LTS のようですね。


最終的に

```console
Z:\> node --version
v16.16.0

Z:\>
```

となればOKです。

[^2]: 公式は環境設定がメンドクサイよねぇと言いながら、Node.js入れてねって言ってしまってゴメンナサイ :-)




### サンプルコードを取得

[https://github.com/masatomix/uipath-orchestrator-api-node-samples/tree/develop](https://github.com/masatomix/uipath-orchestrator-api-node-samples/tree/develop)

よりソースを取得します。下記のようにページの ``` Code>> Download ZIP``` から取得するか

![download](https://imgur.com/3Xx3opW.png)


もしくは、Gitコマンドが動かせる環境であれば、下記のようにコマンドラインからGitを操作してもOKです。

```console
Z:\git> git clone --branch develop https://github.com/masatomix/uipath-orchestrator-api-node-samples
Cloning into 'uipath-orchestrator-api-node-samples'...
remote: Enumerating objects: 108, done.
remote: Counting objects: 100% (108/108), done.

..
Z:\git>
```

[GitHubでソースコード管理するハンズオン](https://qiita.com/masatomix/items/a3f99a1700a835e845dd) などの記事などを参考にして、適宜SourceTree等でソースをダウンロードしてもOKです。このさいGitを覚えてもよいですよね！


つづいて依存モジュールのインストール。

```console
Z:\git> cd uipath-orchestrator-api-node-samples\sample_oauth
Z:\git\uipath-orchestrator-api-node-samples\sample_oauth> npm i

... なんか、``gyp ERR! find Python Python is not set from command line or npm configuration``などとエラーが出てる場合もあるけど
きにしない

Z:\git\uipath-orchestrator-api-node-samples\sample_oauth> 
```

環境の準備は以上です。

###  Orchestratorで、クライアントIDなどを取得する

APIを利用するためには**OC上でクライアントIDとか、利用可能な権限(Scopes)の設定を行う**必要があります。
実際に操作しているところを動画にまとめましたので、よろしければ見てみてください。

https://youtu.be/_0l__SjyRC8

https://youtu.be/wSpZ7l-SQuA



この動画で設定している項目の意味はざっと以下の通りです。

| 項目名                              | 説明                                                         |
| ----------------------------------- | ------------------------------------------------------------ |
| クライアントID(アプリID)            | APIを呼び出したいアプリ単位で発行する、ユニークなキー        |
| アプリケーション名                  | そのアプリの名前。なんでもイイ。                             |
| アプリケーションの種類(機密/非機密) | **認可コード+PKCE (Authorization Code Flow With PKCE)を使う場合は非機密を選択**(今回はこっち)。ただし認可コード+PKCEは、ユーザスコープしか扱えない。あるユーザの参照範囲に基づいてうごく方式で、その為ログイン画面などでログインが必要[^3]。<br />**クライアントクレデンシャル(Client Credential)を使う場合は機密を選択**。ただしクライアントクレデンシャルは、アプリケーションスコープしか扱えない。ログイン画面などを表示できないバッチなどではこちらを用いるが、あるユーザの参照範囲に基づいて動かす、などはできない。 |
| スコープ                            | OR.Machines, OR.Users など、この**クライアントIDに対して発行されるトークンが使用できる、参照できるリソースの最大範囲**を設定する。実際にトークンを取得する際に、スコープを絞ってトークンを発行してもらってもよい。 |
| リダイレクトURL                     | **技術的には「認可コードを転送(リダイレクト)する先のURL」** 。たとえば ``http://localhost:8080/settings`` って設定しておくと、OCサーバが``http://localhost:8080/settings?code=xxxxxx`` ってURLへ、認可コード(codeのValue値xxxxxxのこと)を返してくれるようになる。<br />アプリはそのURLで待つようにしておいて、その認可コードを取り出して処理を継続する。 |

[^3]: ちなみに機密かつユーザスコープを扱う方式として「PKCEじゃない、認可コード方式」ってのもあるんですが今回は割愛します。

参考: 
- [外部アプリケーションを使用して UiPath のリソースにアクセスする(Cloud)](https://docs.uipath.com/automation-cloud/lang-ja/docs/setting-up-the-external-application)
- [外部アプリに OAuth を使用する(OC2021.10.x)](https://docs.uipath.com/orchestrator/lang-ja/v2021.10/reference/using-oauth-for-external-apps)

ちなみに動画では

- クライアントID: ``c9215e20-8fac-445b-9114-34c896f994be``
- 機密/非機密 :  非機密
- スコープ:  ユーザスコープの OR.Machines, OR.Users
- リダイレクトURL: ``http://localhost:8080/settings``

という設定のクライアントIDが発行されました。(アプリIDはクラウド版で発行された例です)
これらの値はあとから使います。


## やってみる

さてサンプルを動かす準備の続きです。こんどはソースコード側です。

UiPath Orchestrator APIを使用するために、**どこのOrchestratorに接続するかなどの設定を記述したファイルを編集**します。
設定ファイルはそれぞれ別のモノを用意しています。

- ``src\config_cloud.ts``  クラウドの場合
- ``src\config_onpre.ts``  オンプレの場合

どっちを使うかは、``src\index.ts`` の冒頭のコメントアウトで制御しているので、適宜書き換えてください。

```typescript
import { default as oauthConfig } from './config_cloud'     デフォルトではクラウド設定を読むようにしてあるけど、
// import { default as oauthConfig } from './config_onpre'   オンプレの場合は、こっちを有効にする
```

では設定ファイルに記述を追加します。
といってもおもに、さきほどOC画面上で取得した情報を転記していくだけです。


- ``src\config_cloud.ts``  クラウドの場合

```typescript
export default {
  client_id: 'xxxxxxxxxxxxxxxxxx', // 適宜置き換えてね
  redirect_uri: 'http://localhost:8080/settings', // 適宜置き換えてね
  scope: 'OR.Users OR.Machines offline_access openid profile email', // 適宜置き換えてね

  // クラウド版の情報はこちらから確認可能だけど、だいたい下記の通り
  // https://cloud.uipath.com/identity_/.well-known/openid-configuration
  authorization_endpoint: 'https://cloud.uipath.com/identity_/connect/authorize', // クラウド版の場合はみんなコレ
  token_endpoint: 'https://cloud.uipath.com/identity_/connect/token',  // クラウド版の場合はみんなコレ

  uri_orch: 'https://cloud.uipath.com/{organizationName}/{tenantName}', // OrchestratorのURL。適宜置き換えてね
}
```

- ``src\config_onpre.ts``  オンプレの場合

```typescript
export default {
  client_id: 'xxxxxxxxxxxxxxxx', // 適宜置き換えてね
  redirect_uri: 'http://localhost:8080/settings', // 適宜置き換えてね
  scope: 'OR.Users OR.Machines offline_access openid profile email', // 適宜置き換えてね

  // オンプレ版の場合は、下記から確認可能だけど、だいたい下記の通り
  // https://[server]/identity/.well-known/openid-configuration
  authorization_endpoint: 'https://[server]/identity/connect/authorize', // 適宜置き換えてね
  token_endpoint: 'https://[server]/identity/connect/token', // 適宜置き換えてね

  uri_orch: 'https://[server]', //  OrchestratorのURL。適宜置き換えてね
}
```

まだ説明してない残りは以下の通りとしてください(上記のコメントにだいたい書いてあるとおりです)。


- ``authorization_endpoint``: クラウドはそのままで。オンプレでは設定ファイル中のコメントに従って適宜書き換え
- ``token_endpoint``: クラウドはそのままで。オンプレでは設定ファイル中のコメントに従って適宜書き換え
- ``uri_orch``  設定ファイル中のコメントに従って適宜書き換え

### いよいよ実行

いよいよ実行です。実行するとブラウザが表示されるので、ログイン処理を行ってください[^4]。

[^4]: OCへログイン済みの場合はそのままスルーされちゃって臨場感がないので、ぜひブラウザでOCからログアウトした状態で、オペしてみてください。

```console
Z:\git\uipath-orchestrator-api-node-samples\sample_oauth> npx ts-node src\index.ts

Server running at http://localhost:8080/settings .. (60 秒でタイムアウトします。)
Getting Access Token succeeded
Access Token: eyJhbGciOiJSUzI1NiIsImtpZCI6IkExRTAxNjE4MkYxMTI5QjMwNTIxOUY2OUQ2REY0N0UzMEQzRDJGQzJSUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6IkpXVCIsIng1dCI6Im9lQVdHQzhSS2JNRklaOXAxdDlINHcwOUw4SSJ9.eyJuYmY...IjpbImV4dGVybmFsIl19.yF8Ap1xLt0a-OleroPkwX6OH4rIIi09zVFo5tqMDy0lBi3-Aby3UQL30gaBOioz8NLvE-tnTMSEqURovX37taO6lJcmQ5rtO7N48sjOtYxHNYYzKYzTUV4vZ5lO_baOdy-P4enV1qiRPqP6QgV_x1M55H8fX6hsn8D827jhUCVR1iH5KWJOtiCU4TeFbPoHFgqagB8Pv0t5xU0fVBoffeUbqyaTjFU5PEA9tm-tmhSHjD-K2l_gHMfYXkEZBCU0xDxjL8qLnSySqdJnA-4c82PWIefueC8SbyBLwc4Z_tzWZzJF-qGtUmFzmGjN9PTs2nQ2b28gXunrbLK3ztEVYvw

Getting all Users ....
┌─────────┬────────────────────────────────────┬──────────────────────────────┬──────────────────┐
│ (index) │              UserName              │           FullName           │       Type       │
├─────────┼────────────────────────────────────┼──────────────────────────────┼──────────────────┤
│    0    │          'administrators'          │       'Administrators'       │ 'DirectoryGroup' │
│    1    │         'automation users'         │      'Automation Users'      │ 'DirectoryGroup' │
│    2    │      'automation developers'       │   'Automation Developers'    │ 'DirectoryGroup' │
│    3    │             'everyone'             │          'Everyone'          │ 'DirectoryGroup' │
│    4    │ 'user2022-002@uipath-friends.info' │ 'user2022-002 UiPathFriends' │ 'DirectoryUser'  │
└─────────┴────────────────────────────────────┴──────────────────────────────┴──────────────────┘

Getting all Machine Keys ....
┌─────────┬────────────────────────────────────────────────────────┬────────────┐
│ (index) │                          Name                          │ LicenseKey │
├─────────┼────────────────────────────────────────────────────────┼────────────┤
│    0    │ "user2022-002@uipath-friends.info's workspace machine" │    null    │
└─────────┴────────────────────────────────────────────────────────┴────────────┘
Done!

Z:\git\uipath-orchestrator-api-node-samples\sample_oauth> 
```

上記はクラウドに対してAPIを実行した結果ですが、ユーザ情報やマシンの情報など、なにか返ってきましたね！


## まとめ

- 認可コード+PKCE方式を使って、Users/Machinesにアクセスできる**ユーザスコープのアクセストークンを発行**しました。
- そのトークンで、**OC画面の情報(ユーザ情報、マシン情報) を実際に取得**してみました。
- 認可コード+PKCE方式を使う場合は**ログイン画面が表示される**ことがわかりました[^5]。
- ログイン自体はOCに対して[^6]行うため、外部アプリケーション(今回はこのTypeScriptのコードのことです) は **ユーザID/Password を知る必要がない** (知ることができない)事が分かりました。


[^5]: あ、試してないけど リフレッシュトークンを利用することで、2回目以降はログイン画面を表示しないことが可能なハズです。。ハズって歯切れが悪いのは、offline_accessのスコープを要求したときにはOCの戻り電文にrefresh_token が含まれていることは確認してるんだけど、そのやり方でOKっていう公式の説明が見つからないのです

[^6]: 厳密には認可サーバに対して


お疲れさまでした！。


## 関連リンク


- [外部アプリケーション機能(OAuth)によるOrchestrator APIコール実装方法](https://www.uipath.com/ja/resources/knowledge-base/implementing-orchestrator-api-with-oauth)
- [OrchestratorにOAuthがやってきた](https://www.youtube.com/watch?v=f1u3f1I93XY&t=28448s) UiPath Friends Festival 2021 ～未来につなげ！今年も豊作！！自動化ノウハウ大収穫祭～ で話したときの動画
- [OrchestratorにOAuthがやってきたの資料](https://speakerdeck.com/masatomix/orchestratornioauthkayatutekita)

