
Vue.component('master-page', {
    props:
        {
        }
    ,
    data: function () {
        return {
        }
    }
    ,
    mounted: function () {
        //chromeなどで一瞬vueのソースが見えるので、そちらの対策（チラチラ対策）
        window.addEventListener("load",
                function () {
                    //#app 
                    //display:noneにすると高さなどの計算ができないので　visibilityで処理
                    document.getElementById("app").style.visibility="visible";
                }
            , false);
    }
    ,
    //デザイン
    template: '\
        <div class="columns">\
            <div class="column" style="margin-top:10px">\
                <span class="icon" onclick="window.top.location.href = \'/Menu\';">\
                    <i class="fas fa-home"></i>\
                </span>\
                サンプルシステム（固定ページ）\
            </div>\
        </div>\
'
});

