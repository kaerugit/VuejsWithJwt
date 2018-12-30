using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;

namespace VuejsWithJwt.Pages
{
    [AllowAnonymous]
    public class IndexModel : PageModel
    {

        private readonly IConfiguration _config;

        public IndexModel(IConfiguration configuration)
        {
            this._config = configuration;
        }


        public void OnGet()
        {
            
        }

        /// <summary>
        /// ログインの処理
        /// </summary>
        /// <param name="postjson"></param>
        /// <returns></returns>
        public ActionResult OnPostLogin([FromBody] JToken postjson)
        {

            //jsonで取得
            var userid = postjson["Userid"].ToString();
            var password = postjson["Password"].ToString();

            if (userid.Length ==0 || password.Length == 0)
            {
                return this.BadRequest("Could not create token");
            }

            //認証(実際はDBなどにAccess)
            if (userid != "yama" || password != "kawa")
            {
                return this.BadRequest("Could not create token");
            }

            //https://auth0.com/blog/jp-securing-asp-dot-net-core-2-applications-with-jwts/　
            var claims = new[]
            {
                // JwtBearerAuthentication 用
                
                new Claim(JwtRegisteredClaimNames.Jti, userid),
                //ほかに追加項目があれば
                //new Claim(JwtRegisteredClaimNames.Sub, ""),

                // User.Identity プロパティ用                
                //new Claim(ClaimTypes.Sid, userid),
                //new Claim(ClaimTypes.Name, ""),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(this._config["Tokens:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            //保持期間など
            var token = new JwtSecurityToken(
                issuer: this._config["Tokens:Issuer"],
                audience: this._config["Tokens:Issuer"],
                claims: claims,
                //とりあえず設定　7日間  UtcNowとどちらかよいのか不明
                expires: DateTime.Now.AddDays(7),
                //expires: DateTime.Now.AddMinutes(1),        //短い場合のテスト
                signingCredentials: creds);


            ////return Ok(new
            return new OkObjectResult(new
            {
                token = new JwtSecurityTokenHandler().WriteToken(token),
                expiration = token.ValidTo
            });
        }

    }
}
