
# VuejsWithJwt(.net asp core)
純粋なVuejsとJwt認証を.net coreで対応したサンプルです。

## 開発環境
visual　studio 2017（+.net asp core 2.1）   

## 動作環境
chrome、ie11でテスト

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

※最低限な環境を目指した為、npmなどから取得してしておりません。

## サンプルアプリについて
以下のAPI部分を修正して作成しました。  
https://github.com/kaerugit/VuejsTableInput  
順次公開（予定？）

## License
[MIT](LICENSE.txt)
