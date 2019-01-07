using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
using System.Threading.Tasks;

namespace VuejsWithJwt
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            //services.Configure<CookiePolicyOptions>(options =>
            //{
            //    // This lambda determines whether user consent for non-essential cookies is needed for a given request.
            //    options.CheckConsentNeeded = context => true;
            //    options.MinimumSameSitePolicy = SameSiteMode.None;
            //});

            //【jwt追加】
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(cfg =>
            {
                //cfg.Audience = "";
                cfg.RequireHttpsMetadata = false;
                cfg.SaveToken = true;

                cfg.TokenValidationParameters = new TokenValidationParameters()
                {

                    //トークンを作成したサーバーを検証する
                    //ValidateIssuer = true
                    //トークンの受信人が受信を許可されているかを確認する
                    //ValidateAudience = true
                    //トークンの期限が切れておらず、Issuerの署名鍵が有効であることをチェックする 
                    //ValidateLifetime = true
                    //受信したトークンを署名するために使用された鍵が信頼された鍵のリストに入っていることを検証する 
                    //ValidateIssuerSigningKey = true

                    //appsettings.jsonに追加
                    ValidIssuer = Configuration["Tokens:Issuer"],
                    ValidAudience = Configuration["Tokens:Issuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Tokens:Key"]))
                };

            });
            

            services.AddMvc
                (opts =>
                {
                    //一時的に [Authorize]を無視
                    //opts.Filters.Add(new AllowAnonymousFilter());
                }
                )
                .AddRazorPagesOptions(opts =>
                {
                    //デフォルトの属性     [Authorize] を付与
                    opts.Conventions.AuthorizeFolder("/");
                })
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            //【jwt追加】
            services.AddAntiforgery(o => o.HeaderName = "XSRF-TOKEN");

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            //【jwt追加】     
            app.UseJwtCookie();             //JwtCookieMiddleware
            app.UseAuthentication();

            app.UseHttpsRedirection();
            app.UseStaticFiles();


            app.UseMvc();
        }
    }

    /// <summary>
    /// JwtCookieMiddleware
    /// </summary>
    /// <remarks>
    /// 参照：https://code.i-harness.com/ja/q/13fba8a
    /// </remarks>
    public class JwtCookieMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtCookieMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext ctx)
        {

            //Cookieを取得し、存在すれば認証用にセット
            if (ctx.Request.Cookies.TryGetValue("access_token", out var accessToken))
            {
                if (!string.IsNullOrEmpty(accessToken))
                {
                    string bearerToken = String.Format("Bearer {0}", accessToken);

                    //既にある場合もあるので
                    if (ctx.Request.Headers.ContainsKey("Authorization") == false)
                    {
                        ctx.Request.Headers.Add("Authorization", bearerToken);
                    }

                }
            }
            return this._next(ctx);
        }
    }
    public static class JwtCookieMiddlewareExtensions
    {
        public static IApplicationBuilder UseJwtCookie(this IApplicationBuilder build)
        {
            return build.UseMiddleware<JwtCookieMiddleware>();
        }
    }
}
