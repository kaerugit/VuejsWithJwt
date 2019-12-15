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
using Microsoft.Extensions.Hosting;

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

            //3.0�ǉ�
            services.AddControllersWithViews();
            services.AddRazorPages();

            //services.Configure<CookiePolicyOptions>(options =>
            //{
            //    // This lambda determines whether user consent for non-essential cookies is needed for a given request.
            //    options.CheckConsentNeeded = context => true;
            //    options.MinimumSameSitePolicy = SameSiteMode.None;
            //});

            //�yjwt�ǉ��z
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

                    //�g�[�N�����쐬�����T�[�o�[�����؂���
                    //ValidateIssuer = true
                    //�g�[�N���̎�M�l����M��������Ă��邩���m�F����
                    //ValidateAudience = true
                    //�g�[�N���̊������؂�Ă��炸�AIssuer�̏��������L���ł��邱�Ƃ��`�F�b�N���� 
                    //ValidateLifetime = true
                    //��M�����g�[�N�����������邽�߂Ɏg�p���ꂽ�����M�����ꂽ���̃��X�g�ɓ����Ă��邱�Ƃ����؂��� 
                    //ValidateIssuerSigningKey = true

                    //appsettings.json�ɒǉ�
                    ValidIssuer = Configuration["Tokens:Issuer"],
                    ValidAudience = Configuration["Tokens:Issuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Tokens:Key"]))
                };

            });

            //3.0�ǉ��@[FromBody] JToken �Ή�
            services.AddControllers().AddNewtonsoftJson();

            services.AddMvc
                (opts =>
                {
                    //3.0�ǉ�
                    //opts.EnableEndpointRouting = false;

                    //�ꎞ�I�� [Authorize]�𖳎�
                    //opts.Filters.Add(new AllowAnonymousFilter());
                }
                )
                .AddRazorPagesOptions(opts =>
                {
                    //�f�t�H���g�̑���     [Authorize] ��t�^
                    opts.Conventions.AuthorizeFolder("/");
                })
                .SetCompatibilityVersion(CompatibilityVersion.Version_3_0);

            //�yjwt�ǉ��z
            services.AddAntiforgery(o => o.HeaderName = "XSRF-TOKEN");

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            //�yjwt�ǉ��z     
            app.UseJwtCookie();             //JwtCookieMiddleware
            app.UseAuthentication();        //�Ǝ��F�ؒǉ�

            app.UseAuthorization();         //[Authorize]

            //�N���X�h���C��
            //app.UseCors();//�F�؁E�F��

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
                //3.0�ǉ��@[Route("api/[controller]")]���ĂׂȂ�
                endpoints.MapControllers();
            });

        }
    }

    /// <summary>
    /// JwtCookieMiddleware
    /// </summary>
    /// <remarks>
    /// �Q�ƁFhttps://code.i-harness.com/ja/q/13fba8a
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

            //Cookie���擾���A���݂���ΔF�ؗp�ɃZ�b�g
            if (ctx.Request.Cookies.TryGetValue("access_token", out var accessToken))
            {
                if (!string.IsNullOrEmpty(accessToken))
                {
                    string bearerToken = String.Format("Bearer {0}", accessToken);

                    //���ɂ���ꍇ������̂�
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
