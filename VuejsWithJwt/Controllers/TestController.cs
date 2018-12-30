using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace VuejsWithJwt.wwwroot
{



    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class TestController : ControllerBase
    {
        [HttpPost]
        public JsonResult Post([FromBody] JToken RequestData)
        {

            List<string> lstString = new List<string>
            {
                "POST API 1",
                "POST API 2",
                "POST API 3"
            };
            return new JsonResult(lstString);

        }


        [HttpGet]
        public JsonResult Get()
        {

            List<string> lstString = new List<string>
            {
                "API 1",
                "API 2",
                "API 3"
            };
            return new JsonResult(lstString);

        }

    }
}