# VuejsWithJwt(ASP.NET Core)
Vuejs(Non-SPA)とJwt(JSON Web Token)認証をASP.NET Coreで対応したサンプルです。  
(プロジェクトは ASP.NET Core Razor Pagesを使用)  
Razorでゴリゴリ書きながらクライアントはVue  
データのやり取りはすべてWeb APIというプロジェクトです。  
※ie11対応  
  
サーバ処理ではDBとの接続が必要なケースがほとんどだと思いますが
好きなコンポーネントで作成して頂ければと思います。

## 開発環境
Visual　Studio 2019（ASP.NET Core 3.1）   

## 動作環境
chrome、edgeでテスト  
（データベースは未使用、slnファイルから実行すれば、動作確認することが可能です）

## 使用コンポーネント
### サーバ
json.net(json関連で使用。ngetで取得)  
https://github.com/JamesNK/Newtonsoft.Json  

### javascript(クライアント)
Vue.js v2.5.21  
https://jp.vuejs.org/index.html  

es6-promise.auto.min.js(IE11でpromise(非同期処理)を使用する為)  
https://github.com/stefanpenner/es6-promise  

js.cookie.js（cookie処理）  
https://github.com/js-cookie/js-cookie  

### css(クライアント)
bulma.io v0.7.1（レスポンシブデザインを考慮）  
https://bulma.io/  

※ダウンロード後、すぐ動作する環境を目指した為、npmなどは利用しておりません。  

## 開発メモ（注意点など）
### ASP.NET Core Razor Pagesの採用理由
・ASP.NET Core Mvcよりシンプル  
・htmlとhtml.cs(サーバ処理)のファイルが近くにあるので、ソースが追いやすい（かも？）  
⇒作者がASP.NET WebFormsの経験が多いので親近感あり
・フォルダ階層も自由に設定できるので、大規模プロジェクトに向いている（かも？）  

ASP.NET Core Razor Pagesにつきましては  以下参考  
https://docs.microsoft.com/ja-jp/aspnet/core/tutorials/razor-pages/razor-pages-start  

### ASP.NET Core Razor Pagesメモ
javascript で　XXXX　をpost(参考 Project.PostApi ←ソース検索)すると  
サーバ側の　onPostXXXX　が呼ばれる  
(mvc同様、引数で呼び出される関数は自動選択)  

###サンプル元(Vue)
以下サンプルのデータ取得部分をWeb API化作成しました。  
https://github.com/kaerugit/VuejsTableInput  
順次追加（予定？？）  
※Vueの内容については上記プロジェクトを参考してください。  

### Jwt認証について
関連するソースは【jwt追加】で検索可  
参考元（ほぼコピー）  
https://github.com/tinohager/AspNetCore.JwtBearer.VueJS  

概要：  
・Startup.cs　でJwtの設定  
・Index.cshtml.cs(Index.cshtml)　でログイン処理  
（Jwtの認証キーはcookieに保存）  
・Web APIアクセス時には認証キーを付与してpost(参考 Project.PostApi ←ソース検索)  
・Razor Pages認証時(ページ表示時)にはJwtCookieMiddleware（←ソース検索）クラスにてRequestHeaderに認証キーを付与してget  

### 認証について
デフォルトの属性に[Authorize]を付与（いちいち属性を追加する必要なし）  
参考：　services.AddMvc（←ソース検索）  
⇒認証しないと、Web API、/Indexページ　以外は使用不可
⇒逆に認証が必要ない場所に[AllowAnonymous]属性が必要（Index.cshtml.cs）

### サーバ側のjson(json.net)の扱いについて
JObject ⇒ javascript {}(object型)  
JArray  ⇒ javascript [](Array 型)  
JToken  ⇒　JObject、JArrayのbase（親）  
※ここら辺を理解出来れば、サンプルの内容理解度が深まると思います。  

### javascript非同期処理について
promise(es6-promise.auto.min.js)で処理しておりますが  
ie対応が必要なければ、awaitの利用をお勧めします。  

### バリデーション全般（個人的見解）
本来は、javascriptとサーバ側で同じ処理を行うのが望ましいが  
(機密情報以外の)基本的なバリデーションはjavascriptで行い  
サーバ側はデータ同時更新の排他処理、DBの型チェック（など）を処理  
（という切り分けを検討中）  

## License
[MIT](LICENSE.txt)

