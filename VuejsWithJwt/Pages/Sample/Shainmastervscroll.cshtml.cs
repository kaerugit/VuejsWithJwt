using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.FileProviders;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace VuejsWithJwt.Pages.Sample
{
    public class ShainMastervscrollModel : PageModel
    {
        public void OnGet()
        {

        }

        /// <summary>
        /// 初期化
        /// </summary>
        /// <param name="postjson"></param>
        /// <returns></returns>
        public JsonResult OnPostInit([FromBody] JToken postjson)
        {

            //テストデータの取得
            // FileProviderを作成
            IFileProvider provider = new PhysicalFileProvider(Directory.GetCurrentDirectory());
            // アプリケーションルートの要素を取得
            //IDirectoryContents contents = provider.GetDirectoryContents("");
            // アプリケーションルート下のファイルを取得
            IFileInfo fileInfo = provider.GetFileInfo("wwwroot/testdata/chugoku.json");

            System.IO.StreamReader sr = new System.IO.StreamReader(
                fileInfo.PhysicalPath, System.Text.Encoding.UTF8);
            //内容をすべて読み込む
            string s = sr.ReadToEnd();
            //閉じる
            sr.Close();

            var todofuken = (JToken)JsonConvert.DeserializeObject(s);
            //var json = JsonSerializer.

            JObject json = new JObject();
            json.Add("todofuken", todofuken);

            //複数必要な場合はaddする
            //json.Add("xxx", yyyy);
            return new JsonResult(json);

        }

        /// <summary>
        /// 検索
        /// </summary>
        /// <param name="postjson"></param>
        /// <returns></returns>
        public JsonResult OnPostSearch([FromBody] JToken postjson)
        {

            //本来はDB
            if (TestData.TestData.TestShainData.Length == 0)
            {
                TestData.TestData.TestShainData = $@"
                [
                     {{""扶養家族区分"": [1], ""性別区分"": 1, ""都道府県CD"": ""34"", ""市区町村CD"": """", ""社員コード"": ""11111"", ""社員名"": ""テスト　太郎"", ""入社年月日"": ""2000/04/01 00:00:00""}}
                    ,{{""扶養家族区分"": [1], ""性別区分"": 1, ""都道府県CD"": ""34"", ""市区町村CD"": """", ""社員コード"": ""11112"", ""社員名"": ""テスト　太郎2"", ""入社年月日"": ""2000/04/01 00:00:00""}}
                ]
                ";
            }

			//とりあえず、力技
            var searchResult = (JArray)JsonConvert.DeserializeObject(TestData.TestData.TestShainData);


            //社員コードが入っていないものは除く
            if (true)
            {
                var result = searchResult.Where(w => w["社員コード"]?.ToString().Length > 0 ).ToList();
                searchResult = (JArray)JsonConvert.DeserializeObject(JsonConvert.SerializeObject(result));
            }

            if (postjson["社員コード"]?.ToString().Length > 0)
            {
                var result = searchResult.Where(w => w["社員コード"].ToString() == postjson["社員コード"].ToString()).ToList();
                searchResult = (JArray)JsonConvert.DeserializeObject(JsonConvert.SerializeObject(result));
            }

            if (postjson["社員名"]?.ToString().Length > 0)
            {
                var result = searchResult.Where(w => w["社員名"].ToString().Contains(postjson["社員名"].ToString())).ToList();
                searchResult = (JArray)JsonConvert.DeserializeObject(JsonConvert.SerializeObject(result));
            }

            if (postjson["都道府県CD"]?.ToString().Length > 0)
            {
                var result = searchResult.Where(w => w["都道府県CD"].ToString() == postjson["都道府県CD"].ToString()).ToList();
                searchResult = (JArray)JsonConvert.DeserializeObject(JsonConvert.SerializeObject(result));
            }

            if (postjson["都道府県CD複数"]?.ToList().Count > 0)
            {
                var lst = postjson["都道府県CD複数"].ToList().Select(s => s.ToString()).ToList();

                var result = searchResult.Where(w => lst.Contains(w["都道府県CD"].ToString())).ToList();
                searchResult = (JArray)JsonConvert.DeserializeObject(JsonConvert.SerializeObject(result));
            }

            JObject json = new JObject();
            json.Add("search", searchResult);

            return new JsonResult(json);
        }

        /// <summary>
        /// 更新
        /// </summary>
        /// <param name="postjson"></param>
        /// <returns></returns>
        public JsonResult OnPostSubmit([FromBody] JToken postjson)
        {

            //データ修正
            foreach (var sel in postjson)
            {
                sel["UPDATE_FLAG"] = false;
                sel["NEW_FLAG"] = false;
                sel["DELETE_FLAG"] = false;
            }

            TestData.TestData.TestShainData = JsonConvert.SerializeObject(postjson);

            JObject json = new JObject();

            var error = "";

            //エラー時のテスト（コメント外すと動きます）
            
            //ErrorIdentity：移動する行
            //Field：フォーカスを移動するフィールド
            //Message：エラーメッセージ
            
            //error = $@"
            //    {{
            //        ErrorIdentity: 1,
            //        Field: '社員コード',
            //        Message: '社員コードが重複しています。(★テスト)',
            //    }}
            //";

            if (error.Length > 0)
            {
                json.Add("error", (JObject)JsonConvert.DeserializeObject(error));
            }
            
            return new JsonResult(json);

        }
    }
}