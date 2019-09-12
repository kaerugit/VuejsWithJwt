var DoraConst = {
    FIELD_NEW_FLAG: "NEW_FLAG",
    FIELD_UPDATE_FLAG: "UPDATE_FLAG",
    /*テンプレート内は記述できないので注意！ */
    FIELD_DELETE_FLAG: "DELETE_FLAG",
    /*テンプレート内は記述できないので注意！ */
    FIELD_ERROR_FLAG: "ERROR_FLAG",
    /*自動的に連番付与するフィールド*/
    FIELD_IDENTITY_ID: "IDENTITY_ID",

    /*エラーがあった場合を判定するフィールド(modelに勝手に追加しているので必要ない場合は削除する必要がある)*/
    APPEND_IS_ERROR: "_IS_ERROR",
    /*エラーがあった場合にエラー値を格納するフィールド(modelに勝手に追加しているので必要ない場合は削除する必要がある)*/
    APPEND_ERROR_VALUE:"_IS_ERROR_VALUE"
};

Vue.directive('dora_table', {

    componentUpdated: function (el, binding, vnode) {
        let theadArray = el.querySelectorAll('thead');
        let widthArray = [];

        if (theadArray.length > 0) {
            let trArray = theadArray[0].querySelectorAll('tr');
            if (trArray.length > 0) {
                let thArray = trArray[0].querySelectorAll('th');

                let width = 0;
                for (let i = 0; i < thArray.length; i++) {
                    let currentWidth = parseInt(thArray[i].style.width);

                    widthArray.push(currentWidth);
                    width += currentWidth;  //obj.st.clientWidth;

                }
                //alert(width);
                el.style.width = width + 'px'; //clientWidth = width;

            }
        }

        let tbodyArray = el.querySelectorAll('tbody');

        if (widthArray.length > 0 && tbodyArray.length > 0) {
            let trArray = tbodyArray[0].querySelectorAll('tr');

            //if (trArray.length > 0) {
            //edgeだと全件ループしないと正しくセットされない（chrome,ieは最初の一件で問題ない）
            for (let i = 0; i < trArray.length; i++) {
                let tdArray = trArray[i].querySelectorAll('td');

                if (tdArray.length > 0) {

                    //alert(tbodyArray.length);

                    for (let i = 0; i < widthArray.length; i++) {

                        let width = widthArray[i];

                        let obj = tdArray[i];

                        //存在する場合
                        if (obj) {
                            obj.style.width = width + 'px';
                        }
                    }
                }
            }

        }
    }
}
);

// v-dora_update.bindingvaluedisp 指定でフォーカス取得時 バインディングの値をそのままセット
// v-dora_update.bindingvaluedispをセットし、dora_format="#,###" とした場合、入力は 1000(modelの値) 表示は1,000 となる

//外部から参照用
//(エレメント).isinputerror()      エラーの場合：true
//(エレメント).execchangeevent()   エラーチェックを個別に実行
//(エレメント).isinputdata()       入力されたかどうか

//備忘録
//メインのコンポーネントで v-on:change イベント定義した場合 メインのv-on:changeが先に実行される
//入力された値が正しいかどうか先にチェックするには execchangeeventを実行する必要がある)

Vue.directive('dora_update', {
    //データ更新時にフラグを追加
    bind: function (el, binding, vnode) {

        //あまりよろしくないがbinding データを保存
        //el.bindingvalue = binding;

        //v-modelの場所の情報を取得
        for (dir in vnode.data.directives) {
            switch (vnode.data.directives[dir].name.toLowerCase()) {
                case "dora_update":
                    //勝手に追加
                    el.dora_directivesdoraupdate = vnode.data.directives[dir];

                    break;
                case "model":
                    //勝手に追加
                    el.dora_directivesmodel = vnode.data.directives[dir];

                    let expression = vnode.data.directives[dir].expression.toString();
                    let index = expression.indexOf(".");
                    if (index == -1) {
                        el.dora_modelvalue = expression;
                    } else {
                        el.dora_modelvalue = expression.substring(index + 1);
                    }
                    break;
            }
        }

        if (el.dora_modelvalue != null) {
            el.setAttribute("dora_MV", el.dora_modelvalue);
        }

        //project.js の関数を呼んでいます(※必ずメインでincludeしておいてください <script src="./javascript/doracomponent.js"></script>)
        //バリデーションを初期化
        if (typeof Project.InitValidate == 'function') {
            Project.InitValidate(el, el.dora_modelvalue);
        }

        //CSSの設定
        if (typeof Project.SetControlCss == 'function') {
            let errorFlag = false;
            if (el.dora_directivesdoraupdate.value[el.dora_modelvalue + DoraConst.APPEND_IS_ERROR] != null) {
                errorFlag = true;
            }

            Project.SetControlCss(el, el.dora_directivesdoraupdate, errorFlag);
        }

        //データの取得（関数化）
        el.getModelData = function () {

            if (el.dora_modelvalue != null){
                //el.dora_directivesdoraupdate.value[el.dora_modelvalue]  と同様（直接書いている所は意味があるので変更しないこと）
                return el.dora_directivesmodel.value;
            }
            else{
                return el.value;
            }
        };

        let format = el.getAttribute("dora_format");
        if (format != null) {
            el.value = DoraFormat.ParseFormat(el.getModelData(), format);
        }

        //■■■外部から呼び出し用function■■■

        //コントロールがエラーかどうか確認
        el.isinputdata = function () {
            try {
                return el.inputflag;
            }
            catch (e) {
            };
            return false;
        };


        //エラーかどうか（外部より参照用）
        el.isinputerror = function () {
            if (el.dora_modelvalue != null) {
                try {
                    if (el.dora_directivesdoraupdate.value[el.dora_modelvalue + DoraConst.APPEND_IS_ERROR] == true) {
                        return true;
                    }
                }
                catch (e) {
                };
            }
            return false;
        };


        //外部から呼ばれる関数(v-on:change イベントと併用した場合 v-on:changeが実行されるので、先にexecchangeeventを実行する必要がある)
        el.execchangeevent = function (evt) {
            return el.event_change(evt);
        };

        //■■■外部から呼び出し用function（終）■■■

        //■■■イベント追加■■■

        //変更時のイベント
        el.event_input = function (evt) {
            el.inputflag = true;
        };
        el.addEventListener("input", el.event_input, false);

        //change イベント
        el.event_change = function (evt) {

            if (el.dora_modelvalue == null) {
                return true;
            }

            //二度実行防止(updateでfalseになります)
            if (el.onceflag == true) {
                return true;
            }

            el.onceflag = true;

            //フラグの更新
            let defultField = DoraConst.FIELD_UPDATE_FLAG;

            el.dora_directivesdoraupdate.value[defultField] = true;

            let message = '';
            //バインドデータの更新（日付などを正しい値にする）
            let format = el.getAttribute("dora_format");

            if (!(format == null || format.length == 0)) {
                if (el.value.length == 0) {
                    el.dora_directivesdoraupdate.value[el.dora_modelvalue] = null;    
                    //vnode.context.$emit('input');
                    
                }
                else {
                    let retvalue = DoraFormat.TransformFormat(el.value, format);
                    //変換に失敗した場合
                    if (retvalue == null) {
                        message = '値が違います。';
                    }
                    //変換できないものはとりあえずnullをセットしておく
                    //Vue.set(el.dora_directivesdoraupdate.value, el.dora_directivesmodel.expression, retvalue)
                    el.dora_directivesdoraupdate.value[el.dora_modelvalue] = retvalue;    
                }

            }

            if (message.length == 0) {
                //project.js の関数を呼んでいます(※必ずメインでincludeしておいてください <script src="./javascript/doracomponent.js"></script>)
                if (typeof Project.CheckValidate == 'function') {   
                    message = Project.CheckValidate(el.dora_modelvalue, el.dora_directivesdoraupdate.value[el.dora_modelvalue]);
                }
            }

            delete el.dora_directivesdoraupdate.value[el.dora_modelvalue + DoraConst.APPEND_IS_ERROR];
            delete el.dora_directivesdoraupdate.value[el.dora_modelvalue + DoraConst.APPEND_ERROR_VALUE];
            if (message.length > 0) {
                el.dora_directivesdoraupdate.value[el.dora_modelvalue + DoraConst.APPEND_IS_ERROR] = true;

                alert(message);
                evt.preventDefault();
                evt.stopPropagation();
                el.dora_directivesdoraupdate.value[el.dora_modelvalue + DoraConst.APPEND_ERROR_VALUE] = el.value;

                Vue.nextTick(
                    function () {
                        el.focus();
                    }
                );

                return false;
            }

            return true;
        };
        el.addEventListener("change", el.event_change, false);

        //フォーカス取得時イベント
        el.event_focus = function (evt) {
            let ae = evt.target;

            //こちらを入れないと選択状態にならない
            Vue.nextTick(
                function () {
                    if (ae != document.activeElement) {
                        return;
                    }

                    //v-dora_update.bindingvaluedisp と定義している場合 バインディングの値をそのままセット
                    if (binding.modifiers.bindingvaluedisp == true && el.getModelData() != null) {
                        ae.value = el.getModelData();
                    }
                    
                    if (typeof ae.select == 'function') {
                        //課題　ieはこちらでOK　chromeはsetTimeoutが必要 edgeはsetTimeoutを入れると処理によって無限ループになる
                        ae.select();
                                                                        
                    }
                }
            );


        };
        el.addEventListener("focus", el.event_focus, false);

        el.event_blur = null;
        //modelをそのまま表示している場合はフォーカス喪失時に再度フォーマット
        if (binding.modifiers.bindingvaluedisp == true) {

            //フォーカス喪失時のイベント
            el.event_blur = function (evt) {
                let ae = evt.target;
                //if (typeof ae.select == 'function') {
                //    //選択解除
                //    try {
                //        ae.selectionStart = 0;
                //        ae.selectionEnd = 0;
                //    } catch (e) { }
                //}

                let format = ae.getAttribute("dora_format");

                if (format == null || format.length == 0) {
                    return;
                }

                if (binding.modifiers.bindingvaluedisp == true) {
                    if (el.getModelData() != null) {
                        ae.value = DoraFormat.ParseFormat(el.getModelData(), format);
                    }
                }

            };
            el.addEventListener("blur", el.event_blur, false);
        }

    },

    update: function (el, binding, vnode) { //, oldValue) {

        el.onceflag = false;
        el.inputflag = false;

        //なぜかよくわからないが再取得（セットしておかないと値が変わらない）
        for (dir in vnode.data.directives) {
            switch (vnode.data.directives[dir].name.toLowerCase()) {
                case "dora_update":
                    //勝手に追加
                    el.dora_directivesdoraupdate = vnode.data.directives[dir];
                    break;
                case "model":
                    //勝手に追加
                    el.dora_directivesmodel = vnode.data.directives[dir];
                    break;
            }
        }
        
        let inputerrorflag = el.isinputerror();
        if (typeof Project.SetControlCss == 'function') {
            Project.SetControlCss(el, el.dora_directivesdoraupdate, inputerrorflag);
        }

        //エラーの場合エラー値をセット
        let errorValue = '';

        if (inputerrorflag) {
            if (el.dora_directivesdoraupdate.value[el.dora_modelvalue + DoraConst.APPEND_ERROR_VALUE] != null) {
                errorValue = '' + el.dora_directivesdoraupdate.value[el.dora_modelvalue + DoraConst.APPEND_ERROR_VALUE];
                el.value = errorValue;
            }
        }

        if (errorValue.length == 0) {
            //フォーマットの処理
            let format = el.getAttribute("dora_format");

            if (format == null || format.length == 0) {
                return;
            }
            
            if (el.getModelData() != null) {
                el.value = DoraFormat.ParseFormat(el.getModelData(), format);
            }
        }
    },

    unbind: function (el) {
        el.removeEventListener("input", el.event_input, false);
        el.removeEventListener("change", el.event_change, false);
        el.removeEventListener("focus", el.event_focus, false);
        if (el.event_blur != null) {
            el.removeEventListener("blur", el.event_blur, false);
        }
    }
    ,

});

//コンボボックス
//値を変更したい場合functionを作成 selectvaluetest(elem.name)
//コンボボックスの値が変わらないものについては v-dora_selectitems.once で速度はやくなります。
//v-dora_selectitems
Vue.directive('dora_selectitems', {
    //データ更新時にフラグを追加
    bind: function (el, binding, vnode) {

        let options = el.options;
        options.length = 0;
        //for (var i = options.length - 1; 0 <= i; --i) {
        //    el.remove(i);
        //}

        let blanktext = el.getAttribute("dora_blanktext");

        //存在しない場合は無視(修正した場合updateにコピー)
        if (blanktext != null) {
            let op = document.createElement("option");
            op.value = '';
            op.text = blanktext;
            el.appendChild(op);
        }

        //連想配列をループ処理で値を取り出してセレクトボックスにセットする
        for (let i = 0; i < binding.value.length; i++) {
            let op = document.createElement("option");
            op.value = binding.value[i].value;  //value値
            op.text = binding.value[i].text;   //テキスト値
            el.appendChild(op);
        }

    },
    update: function (el, binding, vnode) { //(el, binding, vnode) {

        let optionLength = el.options.length;
        let blanktext = el.getAttribute("dora_blanktext");

        if (blanktext != null) {
            optionLength--;
        }

        //値が変更にならないもの
        if (optionLength > 0 && binding.modifiers.once == true) {
            return;
        }


        if (binding.value.length == optionLength) {
            //if (binding.value.length == binding.oldValue.length) {
            if (JSON.stringify(binding.value) == JSON.stringify(binding.oldValue)) {
                return;
            }
            //}
        }

        let options = el.options;
        options.length = 0;

        //存在しない場合は無視(修正した場合updateにコピー)
        if (blanktext != null) {
            let op = document.createElement("option");
            op.value = '';
            op.text = blanktext;
            el.appendChild(op);
        }

        //連想配列をループ処理で値を取り出してセレクトボックスにセットする
        for (let i = 0; i < binding.value.length; i++) {
            let op = document.createElement("option");
            op.value = binding.value[i].value;  //value値
            op.text = binding.value[i].text;   //テキスト値
            el.appendChild(op);
        }

    }
});

//フォーマット
Vue.filter('formatdelimiter', function (value, formatvalue) {
    return DoraFormat.ParseFormat(value, formatvalue);
});

//仮想スクロール
Vue.component('dora-vscroll', {
    props:
    {
        //連結するオブジェクト
        dora_bind_items: {
            type: Array,
            default: []
        },
        //連結するdivタグ
        dora_bind_div: {
            type: String,
        }
        ,
        //行の高さ（1つでも高さが変わるデータが存在したら正しく表示されない）
        dora_height: {
            type: Number,
            default: 20
        }
        ,
        //pc版の場合、検索後条件パネルを非表示にする場合使用
        dora_display_panel: {
            type: Boolean,
            default: false
        }
        ,

    }
    ,
    data: function () {
        return {
            //ダミーのdivの高さ
            heightcalc: 0,
            //タイトルの高さ
            heighttitle: 0,
            //データの位置
            currentindex: 0,
            //tableのElement
            tableelement: null,
            //現状のElement
            vscrollelement: null,

            //現在表示されている行数（自動計算）
            datasize: 0,

            //スクロールイベントが連続で実行されない制御で使用
            timerflag: false,
            scrolltimer: null,

            //データ件数
            oldCount :0,

        }
    }
    ,
    mounted: function () {
        this.tableelement = document.getElementById(this.dora_bind_div);
        this.vscrollelement = this.tableelement.parentElement.querySelector("[vscroll='']");

        if (this.vscrollelement == null) {
            //e100に意味はありません(ソース検索用)
            alert('開発エラー[e100]');
        }

        //上下キー（エンターキー（最終項目））イベント
        this.tableelement.addEventListener("keydown",
            function (evt) {
                //改行は最終行のみ対応
                if (evt.keyCode == 13 || evt.keyCode == 38 || evt.keyCode == 40) {

                    let objActive = document.activeElement;
                    if (objActive == null || objActive.type == null) {
                        return;
                    }
                    let objActiveType = objActive.type.toLowerCase();

                    //判定微妙かも
                    if (objActiveType == "textarea") {
                        return;
                    }
                    else if (evt.keyCode != 13 && objActiveType.indexOf("select") == 0) {
                        return;
                    }

                    let parentTD = objActive;
                    let findFlag = false;

                    //td（親）を求める3は少し適当
                    for (let i = 1; i < 3; i++) {
                        parentTD = parentTD.parentNode;
                        if (parentTD != null && parentTD.tagName.toLowerCase() == "td") {
                            findFlag = true;
                            break;
                        }
                    }

                    //最後の項目で改行
                    let lastEnterFlag = false;

                    let firstFlag = false;
                    let lastFlag = false;

                    //親にtdが存在した場合
                    if (findFlag == true) {

                        //tdのindexを求める
                        let parentTR = parentTD.parentNode;

                        //trのindexを求める
                        let listArrayTR = parentTR.parentNode.querySelectorAll('tr');

                        if (parentTR == listArrayTR[0]) {
                            firstFlag = true;
                        }
                        if (parentTR == listArrayTR[listArrayTR.length-1]) {
                            lastFlag = true;
                        }

                        if (evt.keyCode == 13) {
                            let listArrayTD = parentTR.querySelectorAll('td');

                            if (parentTD == listArrayTD[listArrayTD.length - 1]) {  //一番最後の項目（一番最後の項目がfocus取得できなかったら不具合にかも・・）
                                lastEnterFlag = true;
                            }
                        }
                    }

                    //見つかった場合
                    let moveIndex = 0;
                    if (firstFlag == true || lastFlag==true) {

                        if ((evt.keyCode == 38) && (firstFlag==true)) {      //上
                            moveIndex = -1;
                        }
                        else if ((evt.keyCode == 40) && (lastFlag==true)) {       //下
                            moveIndex = 1;
                        }
                        else if ((lastEnterFlag) && (lastFlag == true)) {       //エンターキーで一番最後の項目
                            moveIndex = 1;
                        }

                        //if (lastEnterFlag == false){
                        objActive.blur();
                        objActive.focus();
                        //}

                        if (moveIndex != 0) {
                            movefunction(moveIndex, lastEnterFlag);
                        }
                    }

                }
            }.bind(this)
        );

        //ホイールマウスのイベント
        let mouseWheelEvent =
            function (evt) {
                let objActive = document.activeElement;
                if (objActive == null || objActive.type == null) {
                    return;
                }

                let objActiveType = objActive.type.toLowerCase();

                if (objActiveType == "textarea") {
                    return false;
                }
                else if (objActiveType.indexOf("select") == 0) {
                    return false;
                }

                //参考 http://code.i-harness.com/ja/q/545831
                //true=ie 各ブラウザで加速度を調整したい場合はこちらを修正
                let delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail / 3 : 0;

                delta = Math.floor(-delta/3);
                if (delta !=0){
                    movefunction(delta, false);
                }
                return evt.preventDefault() && false;

            }.bind(this);

        //マルチブラウザ対応（どちらかにヒットするはず・・）
        this.tableelement.addEventListener('DOMMouseScroll', mouseWheelEvent);
        this.tableelement.addEventListener('mousewheel', mouseWheelEvent);

        //上下キー、ホイール共通処理
        let movefunction =
            function (moveIndex, enterFlag) {

                if (moveIndex < 0) {
                    //上に移動
                    if (this.currentindex == 0) {
                        moveIndex = 0;
                    }
                }
                else if (moveIndex > 0) {
                    //下に移動
                    if (this.getLastDataIndex() <= this.currentindex) {
                        moveIndex = 0;
                    }
                }

                if (moveIndex != 0) {
                    this.scrollobject =
                        {
                            moveIndex: moveIndex,
                            enterFlag: enterFlag,
                        };

                    this.execscroll(moveIndex, enterFlag);
                }

            }.bind(this);


        //右のスクロールバーのホイールイベント
        let vmouseWheelEvent =
            function (evt) {
                this.mousedown();
            }.bind(this);

        this.vscrollelement.addEventListener('DOMMouseScroll', vmouseWheelEvent );
        this.vscrollelement.addEventListener('mousewheel', vmouseWheelEvent );

        //スクロールバーのmouseover時（こちら入れないとエラー後にスクロールバーをクリックすると怪奇現象が起こる）
        let vmouseoverEvent =
            function (evt) {
                this.mousedown();       //値の確定
            }.bind(this)

        this.vscrollelement.addEventListener('mouseover', vmouseoverEvent );

        //画面をリサイズした場合に表示数を変更
        var currentWindowWidth = window.innerWidth;

        window.addEventListener("resize",
            function () {

                if (currentWindowWidth == window.innerWidth) {
                    // ウインドウ横幅が変わっていないため処理をキャンセル。(スマホ用)
                    return;
                }
            
                // ウインドウ横幅が変わったのでリサイズと見なす。
                // 横幅を更新
                currentWindowWidth = window.innerWidth;

                this.mousedown();       //値の確定

                this.getVirtualScrollData(true);
                //強制アップデート
                this.$forceUpdate();
            }.bind(this)
        );
        
    }
    ,
    template: '\
        <div class="" @scroll="scroll" vscroll="" @mousedown ="mousedown ">\
            <div v-bind:style="{ height: heightcalc + \'px\'}">\
            </div>\
        </div>\
    '
    ,
    methods: {
        /**
         * 指定したページに移動する
         * @param {number} index 移動するデータのindex
         * @param {focusfield} focusを移動する（v-modelの値） ※ v-modelが複数ある場合は最初の方に移動
         *        外から this.$refs.page.gotoindex する場合は mounted以降で呼び出し
         */
        gotoindex: function (index,focusfield) {

            //this.bindItems.pushでdomが再作成されるので、その後に実行
            //このvueの動作を理解出来きてないと、はまることが多々あるかも・・

            //詳しく書くと　this.bindItems.push　されたものが
            //function実行後  dora-vscroll の watch が実行され domを作成
            //その後に処理しないと、フォーカスなど移動できない・・

            Vue.nextTick(
                function () {
                    this.tableelement.scrollLeft = 0;

                    let moveIndex = 0;
                    let updownvalue = -1;
                    let lastIndex = this.getLastDataIndex();
                    if (index < this.datasize) {
                        moveIndex = index;

                        if (this.dora_bind_items != null && ((this.dora_bind_items.length - 1) == index)) {
                            updownvalue = 1;    //最終データはスクロール下優先
                        }
                        index = 0;
                    }
                    else if (this.dora_bind_items != null && lastIndex < index) {
                        moveIndex = index - lastIndex;

                        //課題
                        //最後のデータにエラーが発生した場合に、上キーで移動した場合、空欄になる（原因不明の不具合があったので）最後のデータは計算して出力するように変更
                        index = lastIndex;
                        updownvalue = 1;   
                    }
                    this.currentindex = index;
                    this.getVirtualScrollData(false, updownvalue);

                    if (focus != null && moveIndex >= 0) {
                        let trArray = this.tableelement.querySelector('tbody').querySelectorAll('tr');

                        try {
                            //こちら入れないと値が変わらない場合あり
                            setTimeout(function () {
                                trArray[moveIndex].querySelector("[dora_MV='" + focusfield + "']").focus();
                            }, 0);
                        }
                        catch (e) { };
                    }

                }.bind(this)
            );
        }
        ,
        //右スクロールバーのスクロールイベント
        scroll: function () {
            this.execscroll(0, false);
        }
        ,
        //右スクロールバーのmousedown
        mousedown: function () {
            //フォーカスがあるとvueが更新してくれないのでフォーカスを移動させる
            //この処理を削除すると、フォーカスがある項目が再描画されない
            //ホイールマウスの時も呼ばれています
            let objActive = document.activeElement;
            if (objActive != null) {
                objActive.blur();
            }
        }
        ,
        //スクロール実処理
        execscroll: function (moveIndex, enterFlag) {
            let objActive = document.activeElement;

            let inputFlag = false;

            if (objActive.isinputdata) {

                if (typeof objActive.isinputdata == 'function') {
                    inputFlag = objActive.isinputdata();
                }

                if (inputFlag == false) {
                    if (moveIndex == 0) {
                        this.getVirtualScrollData(true);
                        return;
                    }
                }

                //とりあえず、フォーカスを移動させてonchangeを実行させる
                objActive.blur();   //2018/11/17 時点ではedgeでは動作せず

                setTimeout(function () {

                    //入力した場合のみ（一度エラーを表示した後は素通し）
                    if (inputFlag) {
                        if (typeof objActive.isinputerror == 'function') {
                            //エラーの場合
                            if (objActive.isinputerror()) {
                                this.getVirtualScrollData(false);
                                //evt.preventDefault();
                                //evt.stopPropagation();
                                return;
                            }
                        }
                    }

                    let currentindexcalc = this.currentindex;
                    currentindexcalc += moveIndex;
                    if (currentindexcalc < 0) {
                        currentindexcalc = 0;
                    }
                    else if ((this.dora_bind_items.length - 1) < currentindexcalc) {
                        currentindexcalc = this.dora_bind_items.length - 1;
                    }

                    if (moveIndex == 0) {
                        this.getVirtualScrollData(true);
                    }
                    else {
                        this.currentindex = currentindexcalc;
                        this.getVirtualScrollData(false);
                    }

                    Vue.nextTick(
                        function () {

                            if (enterFlag) {
                                //this.tableelement.scrollLeft=0;
                                
                                let parentTD = objActive;
                                let findFlag = false;


                                //かなりfocus.jsと被るのでもったいない・・

                                //td（親）を求める3は少し適当
                                for (let i = 1; i < 3; i++) {
                                    parentTD = parentTD.parentNode;
                                    if (parentTD != null && parentTD.tagName.toLowerCase() == "td") {
                                        findFlag = true;
                                        break;
                                    }
                                }
                                if (findFlag == true) {
                                    let parentTR = parentTD.parentNode;

                                    let listArray = parentTR.querySelectorAll('input,textarea');

                                    //最初にフォーカスが移動できるコントロールに移動
                                    for (let i = 0; i < listArray.length; i++) {
                                        let obj = listArray[i];
                                        //let objType = obj.type.toLowerCase();

                                        //focusがセットできない場合は次
                                        if (obj.readOnly == true || obj.disabled == true) {
                                            continue;
                                        }
                                        else if (obj.tabIndex != null && (+obj.tabIndex) < 0) {
                                            continue;
                                        }                                        
                                        objActive = obj;

                                        break;

                                    }
                                }
                            }

                            objActive.focus();
                            //if (typeof objActive.select == 'function') {
                            //    objActive.select();
                            //}

                        }.bind(this)
                    );

                }.bind(this), 0);
            }
            else {
                this.getVirtualScrollData(true);
            }

        }
        ,
        //テーブルの高さ
        getTableheight: function () {
            //return (this.vscrollelement.scrollHeight - this.heighttitle);
            return (this.heightcalc - this.heighttitle);
        }
        ,
        //最終表示用INDEX（一番下までデータを表示させない） ※10件データがあって、3件画面表示できる場合は　7を戻す(7件目から3つのデータを表示)
        getLastDataIndex: function () {
            return (this.dora_bind_items.length - this.datasize);
        }
        ,
        //スクロールの高さ
        getScrollHeight: function (elm) {
            return elm.scrollHeight - elm.clientHeight;
        }
        ,
        getVirtualScrollData: function (scrollflag, argsupdownvalue) {
            //タイトル部分の取得
            if (this.heighttitle == 0) {
                try {
                    let trArray = this.tableelement.querySelector('table').querySelector('thead').querySelectorAll('tr');
                    //alert(this.tableelement.querySelector('table').querySelector('thead').clientHeight);                    
                    if (trArray != null) {
                        for (let i = 0; i < trArray.length; i++) {
                            let height = trArray[i].clientHeight;
                            //if (height == 0){
                            //    height = trArray[i].style.height;
                            //}
                            this.heighttitle += +(height);
                        }
                    }
                }
                catch (e) { };
            }


            this.heightcalc = this.heighttitle + (this.dora_bind_items.length * this.dora_height);
            let updownvalue = 0;

            if (scrollflag) {
                if (this.timerflag == false) {
                    //現在のデータ位置を計算
                    currentvalue = this.currentindex;
                    this.currentindex = Math.round((this.vscrollelement.scrollTop / this.getTableheight()) * (this.dora_bind_items.length));

                    updownvalue = this.currentindex - currentvalue;
                }
            }
            else {
                //キーボード系の移動はスクロールを修正
                let currentvalue = this.vscrollelement.scrollTop;
                let scrollvalue = 0;

                if (this.currentindex == 0) {
                    scrollvalue = 0;
                }
                else if (this.currentindex > this.dora_bind_items.length - 1) {
                    scrollvalue = this.heightcalc; //this.vscrollelement.scrollHeight;
                }
                else {
                    scrollvalue = Math.round(((this.currentindex + 1) / (this.dora_bind_items.length)) * this.getTableheight());
                }

                this.vscrollelement.scrollTop = scrollvalue;

                //こちらのイベント発生後 連続で発生させないようにする
                this.timerflag = true;

                if (this.scrolltimer != null) {
                    clearTimeout(this.scrolltimer);
                }

                this.scrolltimer = setTimeout(function () {
                    this.timerflag = false;
                }.bind(this), 500);

                updownvalue = scrollvalue - currentvalue;
            }

            this.datasize = Math.ceil((this.tableelement.clientHeight - this.heighttitle) / this.dora_height);

            if (this.datasize < 1) {
                this.datasize = 1;
            }

            //親に通知
            this.$emit('input', this.dora_bind_items.slice(this.currentindex, this.currentindex + this.datasize));

            let scrollHeight = this.getScrollHeight(this.vscrollelement);

            //置き換える
            let scrollTop = -1;
            if (argsupdownvalue != null) {
                updownvalue = argsupdownvalue;

                if (updownvalue < 0 ) {
                    //上に移動
                    scrollTop = 0;
                }
                else if (updownvalue > 0) {
                    //下に移動
                    scrollTop = this.tableelement.clientHeight;
                }
            }
            else {
                if (this.vscrollelement.scrollTop == 0) {
                    scrollTop = 0;
                }
                else if (this.vscrollelement.scrollTop == scrollHeight) {
                    scrollTop = this.getScrollHeight(this.tableelement);
                }
                else if (updownvalue < 0 || this.currentindex == 0) {
                    //上に移動
                    scrollTop = 0;
                }
                else if (updownvalue > 0 || (this.getLastDataIndex() <= this.currentindex)) {
                    //下に移動
                    scrollTop = this.getScrollHeight(this.tableelement);
                }

            }

            if (scrollTop != -1) {
                if (this.tableelement.scrollTop != scrollTop) {
                    Vue.nextTick(
                        function () {
                            this.tableelement.scrollTop = scrollTop;
                        }.bind(this)
                    );
                }
            }

            //スクロール位置で微妙な表示位置になるので、trのclick時にスクロールを調整する
            //Vue.nextTick(
            //    function () {
            let trArray = this.tableelement.querySelector('tbody').querySelectorAll('tr');

            if (trArray != null && trArray.length > 0) {

                let index = 0;
                if (trArray[index].dora_isClickfunction == null) {

                    trArray[index].dora_isClickfunction = true;

                    trArray[index].addEventListener('click',
                        function (event) {
                            let scrolltop = 0;
                            if (this.tableelement.scrollTop != scrolltop) {
                                this.tableelement.scrollTop = scrolltop;
                            }
                        }.bind(this)
                    );
                }
                        
                //最終行
                if (trArray.length != 1) {

                    let index = trArray.length - 1;
                    if (trArray[index].dora_isClickfunction == null) {

                        trArray[index].dora_isClickfunction = true;

                        trArray[index].addEventListener('click',
                            function (event) {
                                let scrolltop = this.getScrollHeight(this.tableelement);
                                if (this.tableelement.scrollTop != scrolltop) {
                                    this.tableelement.scrollTop = scrolltop;
                                }
                            }.bind(this)
                        );
                    }

                }

            }

            //   }.bind(this)
            //);

        }
    }
    ,
    watch: {
        dora_bind_items: function (value) {
            if (this.dora_bind_items == null || this.dora_bind_items.length == 0) {
                this.heightcalc = 0;
                this.oldCount = -1;
                //let elInput = document.getElementById(this.dora_bind_div);
                this.tableelement.scrollTop = 0;
                this.tableelement.scrollLeft = 0;
                this.vscrollelement.scrollTop = 0;

                //親はこのように指定
                //v-bind:dora_display_panel.sync="isDisplayWherePanel"
                //条件パネルを非表示
                this.$emit('update:dora_display_panel', true);
            }
            else {

                //条件パネルを表示
                this.$emit('update:dora_display_panel', false);

                /* 行の高さ確認用
                try {
                    let trArray = this.tableelement.querySelector('tbody').querySelector('tr');
    
                    if (trArray != null) {
                        console.log(trArray.clientHeight);
                    }
                }
                catch (e) { }
                */
            }

            //データの件数が違う場合に実行
            if ((value.length || 0) != this.oldCount) {
                this.getVirtualScrollData(true);
            }
            else {
                //親に通知
                this.$emit('input', this.dora_bind_items.slice(this.currentindex, this.currentindex + this.datasize));
            }
            this.oldCount = (value.length || 0);

        }
    }
});

//https://kuroeveryday.blogspot.com/2017/10/pagination-with-vue2.html 参考
Vue.component('dora-paging', {
    props:
    {
        // 現在のページ番号
        /*
        currentPage: {
            type: Number,
            default: -1
        },
        */
        // 1ページに表示するアイテムの上限（0にすると全件表示） ※ページング表示もなし
        dora_size: {
            type: Number,
            default: 20
        },
        // ページネーションに表示するページ数の上限
        dora_page_range: {
            type: Number,
            default: 10
        },
        //連結するオブジェクト
        dora_bind_items: {
            type: Array,
            default: []
        },
        //連結するdivタグ
        dora_bind_div: {
            type: String,
        }
        ,
        //pc版の場合、検索後条件パネルを非表示にする場合使用
        dora_display_panel: {
            type: Boolean,
            default: false
        }
        ,
    }
    ,
    //componentの変数は関数化する必要あり
    //https://jp.vuejs.org/v2/guide/components.html
    data: function () {
        return {
            currentPage: -1,
        }
    }
    ,
    template: '\
<div class="" >\
  <nav v-show="isShow" class="pagination is-centered" role="navigation" aria-label="pagination">\
        <a @click="first" class="pagination-previous" href="#">&laquo;</a>\
        <a @click="prev" class="pagination-previous" href="#">&lt;</a>\
        <a @click="next" class="pagination-next" href="#">&gt;</a>\
        <a @click="last" class="pagination-next" href="#">&raquo;</a>\
      \
      <ul class="pagination-list">\
          <li v-for="i in displayPageRange" class="page-item" >\
            <a @click="gotopage(i)" :class="{\'pagination-link\':true,\'is-current\':(i-1) === currentPage}" href="#">{{ i }}</a>\
          </li>\
      </ul>\
      \
  </nav>\
</div>\
        '
    ,
    computed: {
        /**
         * ページ数を取得する
         * @return {number} 総ページ数(1はじまり)
         */
        pages: function () {
            return Math.ceil(this.dora_bind_items.length / this.dora_size);
        },
        /**
         * ページネーションで表示するページ番号の範囲を取得する
         * @return {Array<number>} ページ番号の配列
         */
        displayPageRange: function () {

            const half = Math.ceil(this.dora_page_range / 2);
            let start, end;

            if (this.pages < this.dora_page_range) {
                // ページネーションのrangeよりページ数がすくない場合
                start = 1;
                end = this.pages;

            } else if (this.currentPage < half) {
                // 左端のページ番号が1になったとき
                start = 1;
                end = start + this.dora_page_range - 1;

            } else if (this.pages - half < this.currentPage) {
                // 右端のページ番号が総ページ数になったとき
                end = this.pages;
                start = end - this.dora_page_range + 1;

            } else {
                // activeページを中央にする
                start = this.currentPage - half + 1;
                end = this.currentPage + half;
            }

            let indexes = [];
            for (let i = start; i <= end; i++) {
                indexes.push(i);
            }
            return indexes;
        },

        isShow: function () {
            //全件の場合
            if (this.dora_size == 0) {
                return false;
            }
            if (this.dora_bind_items == null || this.dora_bind_items.length == 0) {
                return false;
            }
            return true;
        }

    },
    methods: {
        /**
         * ページ先頭に移動する
         */
        first: function () {
            this.currentPage = 0;
            this.selectHandler(true);
        },
        /**
         * ページ後尾に移動する
         */
        last: function () {
            this.currentPage = this.pages - 1;
            this.selectHandler(true);
        },
        /**
         * 1ページ前に移動する
         */
        prev: function () {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.selectHandler(true);
            }
        },
        /**
         * 1ページ次に移動する
         */
        next: function () {
            if (this.currentPage < this.pages - 1) {
                this.currentPage++;
                this.selectHandler(true);
            }
        },
        /**
         * 指定したページに移動する
         * @param {number} index ページ番号
         * 戻り値 データが存在する場合:true
         *        外から this.$refs.page.gotopage する場合は mounted以降で呼び出し
         */
        gotopage: function (index) {
            this.currentPage = index - 1;
            this.selectHandler(true);
        },
        /**
         * ページを変更したときの処理
         */
        selectHandler: function (scrollflag) {

            if (scrollflag == true) {
                //スクロールをtopにする
                if (this.dora_bind_div != null) {
                    let bindDiv = this.dora_bind_div.split(',');

                    for (let i in bindDiv) {
                        document.getElementById(bindDiv[i]).scrollTop = 0;
                        document.getElementById(bindDiv[i]).scrollLeft = 0;
                    }
                }
            }

            if (this.dora_size == 0) {
                //全件
                this.$emit('input', this.dora_bind_items);
            }
            else {
                let head = this.currentPage * this.dora_size;
                //親に通知
                this.$emit('input', this.dora_bind_items.slice(head, head + this.dora_size));
            }

        }

    }
    ,
    watch: {
        dora_bind_items: function (value) {
            if (this.dora_bind_items == null || this.dora_bind_items.length == 0) {
                this.currentPage = -1;
            }

            if (this.currentPage == -1 && this.dora_bind_items.length > 0) {
                this.currentPage = 0;
            }

            //こちらの場合スクロールを行わない
            this.selectHandler(false);

            //親はこのように指定
            //v-bind:dora_display_panel.sync="isDisplayWherePanel"
            if (value && value.length != 0) {
                //条件パネルを非表示
                this.$emit('update:dora_display_panel', false);
            }
            else {
                //条件パネルを表示
                this.$emit('update:dora_display_panel', true);
            }
        }
    }
    ,
});

var DoraFormat = {
    FORMATTYPES: {
        //未設定（文字列）
        none: 0,
        //頭0埋め
        zero: 1,
        //金額
        currency: 2,
        //日付
        date: 3,
        //パーセント
        parcent: 4
    }
    ,
    //小数点
    DECIMAL_SEPARATOR : "."
    ,
    //通貨区切り
    THOUSANDS_SEPARATOR: ","
    ,
}


DoraFormat.GetFormatType = function (formatString) {
    let formattype = DoraFormat.FORMATTYPES.none;
    
    if (formatString !=null && formatString.length > 0) {
        if (formatString.substr(0, 2) == "00") { //if (formatString.startsWith("00")) {                              
            formattype = DoraFormat.FORMATTYPES.zero;
        }
        else if (formatString.substr(-1, 1) == "%") { //if (formatString.endsWith("%")) {      /* パーセント系*/
            formattype = DoraFormat.FORMATTYPES.parcent;
        }
        else if (formatString.indexOf("/") != -1 || formatString.indexOf(":") != -1 || formatString.indexOf(".f") != -1) {  /*日付系*/
            formattype = DoraFormat.FORMATTYPES.date;
        }
        else if (
                formatString.indexOf(DoraFormat.THOUSANDS_SEPARATOR) != -1 ||
                formatString.indexOf(DoraFormat.DECIMAL_SEPARATOR) != -1 ||
                formatString.indexOf("#") != -1 ||
                formatString == "0"
            ) {   /*数値系*/
            formattype = DoraFormat.FORMATTYPES.currency;
        }
    }
    return formattype;
}

/**
* 値(DB)→表示(html)変換
* @param value
* @param formatString
*/
DoraFormat.ParseFormat = function(value, formatString) {

    if (value == null) {
        return null;
    }

    //値をそのまま戻す
    if (formatString == null || formatString.length == 0 || value.toString().length == 0) {
        return value;
    }

    let formattype = DoraFormat.GetFormatType(formatString);

    if (formattype == DoraFormat.FORMATTYPES.none) {
        return value;
    }

    let motoValue = value;
    value = value.toString();
    if (formattype == DoraFormat.FORMATTYPES.parcent) {
        formatString = formatString.replace("%", "");
        value = value.replace("%", "");
    }

    switch (formattype) {
        case DoraFormat.FORMATTYPES.zero:
            if (value.length > 0 && value.length != formatString.length) {

                value = (formatString + value).toString();
                value = value.substr(value.length - formatString.length);

            }

            break;
        case DoraFormat.FORMATTYPES.currency:
        case DoraFormat.FORMATTYPES.parcent:
            //value = value.replace(new RegExp(DoraFormat.THOUSANDS_SEPARATOR, 'g'), "");
            let errorFlag = false;

            //整数と小数にわける
            //let [seisu, shosu = ""] = value.split(DoraFormat.DECIMAL_SEPARATOR);
            let sep = value.split(DoraFormat.DECIMAL_SEPARATOR);
            let seisu = sep[0];
            let shosu = "";
            if (sep.length > 1) {
                shosu = sep[1];
            }

            //let [seisuformat, shosuformat = ""] = formatString.split(DoraFormat.DECIMAL_SEPARATOR);
            sep = formatString.split(DoraFormat.DECIMAL_SEPARATOR);
            let seisuformat = sep[0];
            let shosuformat = "";
            if (sep.length > 1) {
                shosuformat = sep[1];
            }

            //1 → 100 にする
            if (formattype == DoraFormat.FORMATTYPES.parcent && seisu.length > 0) {

                shosu += "000";
                shosu = shosu.substr(0, 2) + DoraFormat.DECIMAL_SEPARATOR + shosu.substr(2);
                value = seisu + shosu;


                //[seisu, shosu = ""] = value.split(DoraFormat.DECIMAL_SEPARATOR);
                sep = value.split(DoraFormat.DECIMAL_SEPARATOR);
                seisu = sep[0];
                shosu = "";
                if (sep.length > 1) {
                    shosu = sep[1];
                }

                let seisuAny = seisu;
                if (isNaN(seisuAny) == true) {
                    errorFlag = true;
                }
                else {
                    seisu = parseInt(seisu).toString();
                }
            }


            if (seisuformat.indexOf(DoraFormat.THOUSANDS_SEPARATOR) != -1) {
                seisu = seisu.replace(/\B(?=(\d{3})+(?!\d))/g, DoraFormat.THOUSANDS_SEPARATOR);       //カンマ区切り

                if (value == "0" && seisuformat.substr(-1, 1) == "#") {
                    seisu = "";
                }
            }

            if (shosuformat.length > 0) {
                shosu = shosu + shosuformat;
                shosu = DoraFormat.DECIMAL_SEPARATOR + shosu.substring(0, shosuformat.length);
            }
            else {
                shosu = "";
            }

            let valueAny = value;

            if (errorFlag == true || isNaN(valueAny) == true) {
                value = motoValue;      //元の値をセット
            }
            else {
                value = seisu + shosu;

                if (formattype == DoraFormat.FORMATTYPES.parcent) {
                    if (value.length > 0 && value.substr(-1, 1) != "%") {
                        value += "%";
                    }
                }
            }
            break;
        case DoraFormat.FORMATTYPES.date:
            //console.log("transform:" + value);
            if (value.length != 0) {
                let dateValuetemp = changeDateValue(value);

                if (dateValuetemp == null || isNaN(+dateValuetemp)) {
                    //value = "";
                }
                else {
                    let dateValue = new Date(+dateValuetemp);

                    value = formatString;
                    let year = dateValue.getFullYear().toString();
                    let month = (dateValue.getMonth() + 1).toString();
                    let day = dateValue.getDate().toString();

                    let hour = dateValue.getHours().toString();
                    let minute = dateValue.getMinutes().toString();
                    let second = dateValue.getSeconds().toString();
                    let milli = dateValue.getMilliseconds().toString() + '000';
                    milli = milli.substr(0, 3);

                    value = value.replace("yyyy", year);
                    value = value.replace("yy", year.substr(2));

                    value = value.replace("MM", month.length == 1 ? "0" + month : month);
                    value = value.replace("M", month);

                    value = value.replace("dd", day.length == 1 ? "0" + day : day);
                    value = value.replace("d", day);

                    value = value.replace("HH", hour.length == 1 ? "0" + hour : hour);
                    value = value.replace("H", hour);

                    value = value.replace("mm", minute.length == 1 ? "0" + minute : minute);
                    value = value.replace("m", minute);

                    value = value.replace("ss", second.length == 1 ? "0" + second : second);
                    value = value.replace("s", second);
                    
                    value = value.replace("fff", milli);
                    

                }
            }
            break;
    }

    return value;

}

/**
* 表示(html)→値(DB)変換
* @param value
* @param formatString
*/
DoraFormat.TransformFormat = function (value, formatString) {

    if (value == null) {
        return null;
    }

    //値をそのまま戻す
    if (formatString == null || formatString.length == 0 || value.toString().length == 0) {
        return value;
    }

    let formattype = DoraFormat.GetFormatType(formatString);

    if (formattype == DoraFormat.FORMATTYPES.none) {
        return value;
    }

    let motoValue = value;
    value = value.toString();
    if (formattype == DoraFormat.FORMATTYPES.parcent) {
        formatString = formatString.replace("%", "");
        value = value.replace("%", "");
    }

    switch (formattype) {
        case DoraFormat.FORMATTYPES.zero:
            //DB書き込み時にも0を付与する場合
            //if (value.length > 0 && value.length != formatString.length) {

            //    value = (formatString + value).toString();
            //    value = value.substr(value.length - formatString.length);

            //}

            break;
        case DoraFormat.FORMATTYPES.currency:
        case DoraFormat.FORMATTYPES.parcent:
            value = value.replace(new RegExp(DoraFormat.THOUSANDS_SEPARATOR, 'g'), "");

            //整数と小数にわける
            //let [seisu, shosu = ""] = value.split(DoraFormat.DECIMAL_SEPARATOR);
            let sep = value.split(DoraFormat.DECIMAL_SEPARATOR);
            let seisu = sep[0];
            let shosu = "";
            if (sep.length > 1) {
                shosu = sep[1];
            }

            //let [seisuformat, shosuformat = ""] = formatString.split(DoraFormat.DECIMAL_SEPARATOR);
            sep = formatString.split(DoraFormat.DECIMAL_SEPARATOR);
            let seisuformat = sep[0];
            let shosuformat = "";
            if (sep.length > 1) {
                shosuformat = sep[1];
            }

            if (shosuformat.length > 0) {
                shosu = shosu + shosuformat;
                shosu = shosu.substring(0, shosuformat.length)
                shosu = DoraFormat.DECIMAL_SEPARATOR + shosu;
            }
            else {
                shosu = "";
            }

            //00 が0にならないため
            if (+seisu ==0 ){
                seisu =0;
            }
            value = seisu + shosu;

            if (isNaN(value) == true) {
                value = null;    //数値でない
            }
            else {
                if (formattype == DoraFormat.FORMATTYPES.parcent) {
                    //100% → 1にする

                    shosu = shosu.replace(DoraFormat.DECIMAL_SEPARATOR, "");

                    let zerostr = "";
                    for (let i = 0; i < (3 - seisu.length); i++) {
                        zerostr += "0";
                    }

                    value = zerostr + seisu;
                    value = value.substr(0, value.length - 2) + DoraFormat.DECIMAL_SEPARATOR + value.substr(-2);

                    value = value + shosu;

                    //let valueAny = value;
                    //if (isNaN(valueAny) == false) {
                    //    value = parseFloat(value).toString();
                    //}
                    //else {
                    //    value = null;
                    //}

                }
            }
            break;

        case DoraFormat.FORMATTYPES.date:
            if (value.length != 0) {

                //new Date

                let dateValuetemp = changeDateValue(value);

                if (dateValuetemp == null || isNaN(+dateValuetemp)) {
                    value = null;
                }
                else {
                    let dateValue = new Date(+dateValuetemp);

                    //日付型の保存値 W3C 日付形式 http://www.profaim.jp/rel-tech/datatype/w3c_dateform.php
                    //T と Z が重要(そのままの時間で表示)
                    value = "yyyy-MM-ddTHH:mm:ss.fffZ";

                    let year = dateValue.getFullYear().toString();
                    let month = (dateValue.getMonth() + 1).toString();
                    let day = dateValue.getDate().toString();

                    let hour = dateValue.getHours().toString();
                    let minute = dateValue.getMinutes().toString();
                    let second = dateValue.getSeconds().toString()
                    let milli = dateValue.getMilliseconds().toString() + '000';
                    milli = milli.substr(0,3);

                    value = value.replace("yyyy", year);
                    value = value.replace("yy", year.substr(2));

                    value = value.replace("MM", month.length == 1 ? "0" + month : month);
                    value = value.replace("M", month);

                    value = value.replace("dd", day.length == 1 ? "0" + day : day);
                    value = value.replace("d", day);

                    value = value.replace("HH", hour.length == 1 ? "0" + hour : hour);
                    value = value.replace("H", hour);

                    value = value.replace("mm", minute.length == 1 ? "0" + minute : minute);
                    value = value.replace("m", minute);

                    value = value.replace("ss", second.length == 1 ? "0" + second : second);
                    value = value.replace("s", second);

                    value = value.replace("fff", milli);
                }
            }

            break;
    }

    return value;
}


function changeDateValue(value) {

    value = value.replace("T", " ");
    value = value.replace("Z", "");
    // / を - に置換
    value = value.replace(/\//g, "-");


    let reg = new RegExp("[^\\:\\-\\s0-9\.]");
    //変な文字を含んでいたら終了
    if (value.match(reg)) {
        return null;
    }

    //ミリ秒をとる
    let millistring = "000";
    let millisep = value.split(".");
    if (millisep.length > 1) {
        value = millisep[0];
        millistring = millisep[1];
    }

    //let [datestring, timestring = ""] = value.split(" ");
    let sep = value.split(" ");
    let datestring = sep[0];
    let timestring = "";
    if (sep.length > 1) {
        timestring = sep[1];
    }
	

    let nowDateTime = new Date();

    //年・月・日・曜日を取得する
    let year = nowDateTime.getFullYear().toString();
    let month = (nowDateTime.getMonth() + 1).toString();
    //var week = nowDateTime.getDay().toString();
    let day = nowDateTime.getDate().toString();

    let hour = "0";//= nowDateTime.getHours().toString();
    let minute = "0";// = nowDateTime.getMinutes().toString();
    let second = "0";//= nowDateTime.getSeconds().toString();
	
    //時刻のみ
    if (value.indexOf(":") != -1 && timestring.length == 0) {
        year = "1900";
        month = "1";
        day = "1";
        timestring = datestring;
        datestring = "";
    }


    if (datestring.length > 0) {
        let arr = datestring.split("-");

        if (arr.length == 2) {
            if (arr[0].length == 4) {   //4桁の場合は　年/月とみなす
                year = arr[0];
                month = arr[1];
                day = "1";
            }
            else {      //こちらは　月、日とみなす
                month = arr[0];
                day = arr[1];
            }
        }
        else if (arr.length == 3) {      //年月日入っている場合
            if (arr[0].length == 2) {
                year = year.substring(0, 2) + arr[0];
            }
            else {
                year = arr[0];
            }

            month = arr[1];
            day = arr[2];
        }
        else {
            return null;
        }
    }

    if (timestring.length > 0) {
        let arr = timestring.split(":");
        if (arr.length == 2) {
            hour = arr[0];
            minute = arr[1];
            second = "0";
        }
        else if (arr.length == 3) {
            hour = arr[0];
            minute = arr[1];
            second = arr[2];

        }
        else {
            return null;
        }
    }

    nowDateTime = new Date(year, parseInt(month) - 1, day, hour, minute, second, millistring);

    //時刻型かどうかの確認
    if (parseInt(nowDateTime.getFullYear()) != parseInt(year)) {
        return null;
    }

    if (parseInt(nowDateTime.getMonth() + 1) != parseInt(month)) {
        return null;
    }

    if (parseInt(nowDateTime.getDate()) != parseInt(day)) {
        return null;
    }

    if (parseInt(nowDateTime.getHours()) != parseInt(hour)) {
        return null;
    }

    if (parseInt(nowDateTime.getMinutes()) != parseInt(minute)) {
        return null;
    }

    if (parseInt(nowDateTime.getSeconds()) != parseInt(second)) {
        return null;
    }

    if (parseInt(nowDateTime.getMilliseconds()) != parseInt(millistring)) {
        return null;
    }


    return nowDateTime.getTime();

}

