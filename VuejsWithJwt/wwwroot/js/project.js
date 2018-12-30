//こちらのjavascriptは業務に合わせて変更してください！

'use strict';

//インテリジェンスで表示させたいため使用
var Project = {};

//プロジェクトカスタマイズ用javascript

//バリデーションのチェックを入れるオブジェクト
var validatefield = {};

/*
★こちらのバリデーションの課題
同じ画面で同じv-model（v-model.lazy="elem.社員コード"）で複数存在する場合、先に読み込まれたものが優先となる
⇒同じv-model（v-model.lazy="elem.社員コード"）には同じチェックを入れること
<input v-model.lazy="elem.社員コード" v-dora_update="elem" class="input" />
<input v-model.lazy="elem.社員コード" v-dora_update="elem" class="input" isime="false" ishankaku="true" maxlengthvalue="5" textalign="center" />

*/


/**
 * バリデーション初期処理(doracomponent.jsから呼び出し)
 * @param {el} エレメント
 * @param {field} フィールド名
*/
Project.InitValidate = function (el, field) {
    //formatをセットすることも可能
    //el.setAttribute("dora_format","#,###");

    //サンプルでは速度優先の為tagで判定していますが
    //大規模開発は項目で統一したほうがよいので
    //設定用のjsonなどで処理したほうがよいかもしれません

    //設定用のjson例（ただし設定のjsonの件数が増えれば増えるほど速度低下していくと思われます）
    //[
    //{field:社員コード,ishankaku:true,isime:false},
    //{field:入社日,format:'yyyy/MM/dd'},
    //]

    let obj = {};
    if (validatefield[field] == null) {

        //formatを取得
        if (el.getAttribute("dora_format") != null) {
            obj.format = el.getAttribute("dora_format");
        }

        //■■以下直接 cssに記述する事おすすめ■■
        if (obj.format != null) {
            obj.isime = false;  //formatが入っているものは強制OFF
        }
        else {
            if (el.getAttribute("isime") != null) {
                obj.isime = Project.IsBoolean(el.getAttribute("isime"));
            }
        }
        //テキストの位置
        if (el.getAttribute("textalign") != null) {
            obj.textalign = el.getAttribute("textalign");
        }
        else {
            //formatで勝手に判断
            if (obj.format != null) {
                let formattype = DoraFormat.GetFormatType(obj.format);
                if (formattype == DoraFormat.FORMATTYPES.parcent || formattype == DoraFormat.FORMATTYPES.currency) {
                    obj.textalign = "right";
                }
                else if (formattype == DoraFormat.FORMATTYPES.zero || formattype == DoraFormat.FORMATTYPES.date) {
                    obj.textalign = "center";
                }
            }
        }
        //■■以下直接 cssに記述する事おすすめ(終)■■


        //以下バリデーション

        //プロジェクト独自なチェックが必要な場合　オリジナルなタグを用意し、処理を追加
        // < <input ～ isHankaku="true" />

        //半角
        if (el.getAttribute("ishankaku") != null) {
            obj.isHankaku = Project.IsBoolean(el.getAttribute("ishankaku"));
        }

        //数値(0-9)
        if (el.getAttribute("isnumeric") != null) {
            obj.isNumeric = Project.IsBoolean(el.getAttribute("isnumeric"));
        }

        //全角
        if (el.getAttribute("iszenkaku") != null) {
            obj.isZenkaku = Project.IsBoolean(el.getAttribute("iszenkaku"));
        }

        //文字数チェックMin
        if (el.getAttribute("minlengthvalue") != null) {
            obj.minlengthvalue = +el.getAttribute("minlengthvalue");
        }

        //文字数チェックMax(maxlengthはhtmlとかぶるので注意)
        if (el.getAttribute("maxlengthvalue") != null) {
            obj.maxlengthvalue = +el.getAttribute("maxlengthvalue");
        }

        /*
        //バイト数チェックMin
        if (el.getAttribute("minbytelengthvalue") != null) {
            obj.minbytelength = +el.getAttribute("minbytelengthvalue");
        }

        //バイト数チェックMax
        if (el.getAttribute("maxbytelengthvalue") != null) {
            obj.maxbytelength = +el.getAttribute("maxbytelengthvalue");
        }
        */

        //最大値チェックMin
        if (el.getAttribute("minvalue") != null) {
            obj.minvalue = el.getAttribute("minvalue"); //日付もあるので注意
        }

        //最大値チェックMax
        if (el.getAttribute("maxvalue") != null) {
            obj.maxvalue = el.getAttribute("maxvalue"); //日付もあるので注意
        }

        if (field != null) {
            validatefield[field] = obj;
        }
    }


    //■■以下直接 cssに記述する事おすすめ■■ をコメントにした場合以下必要なし

    //imeの処理
    //if (validatefield[field] != null) {
    let objClass = null;
    if (field != null && validatefield[field] != null) {
        objClass = validatefield[field];
    }
    else if (field == null) {
        objClass = obj;
    }

    if (objClass != null) {
        if (objClass.isime != null) {
            if (objClass.isime == true) {
                //含まれていなければ追加
                el.classList.toggle("ime-on");
            }
            else {
                //含まれていなければ追加
                el.classList.toggle("ime-off");
            }
        }

        if (objClass.textalign != null) {
            if (objClass.textalign.toLocaleLowerCase() == "center") {
                el.classList.toggle("text-center");
            }
            else if (objClass.textalign.toLocaleLowerCase() == "right") {
                el.classList.toggle("text-right");
            }
        }
    }
    //}

}

/**
 * エラーチェック(doracomponent.jsから呼び出し)
 * @param {field} フィールド名
 * @param {value} チェック値
 * @return　{string} エラーメッセージ
*/
Project.CheckValidate = function (field, value) {
    if (value == null || value.length == 0) {
        return "";
    }

    if (validatefield[field] != null) {
        let obj = validatefield[field];

        //半角
        if (obj.isHankaku == true) {
            if (value.match(/^[0-9a-zA-Z]+$/) == null) {
                return "半角ではありません。";
            }
        }

        //数値(0-9)
        if (obj.isNumeric == true) {
            if (value.match(/^[0-9]+$/) == null) {
                return "数値ではありません。";
            }
        }

        //全角
        if (obj.isZenkaku == true) {
            if (value.match(/^[^\x01-\x7E\xA1-\xDF]+$/) == null) {
                return "全角ではありません。";
            }
        }

        //文字数チェックMin
        if (obj.minlengthvalue != null) {
            if (value.length < +obj.minlengthvalue) {
                return +obj.minlengthvalue - 1 + "文字以下の入力はできません。";
            }
        }

        //文字数チェックMax
        if (obj.maxlengthvalue != null) {
            if (value.length > +obj.maxlengthvalue) {
                return +obj.maxlengthvalue + 1 + "文字以上の入力はできません。";
            }
        }

        /*
        //バイト数チェックMin
        if (obj.minbytelength != null) {
            if (GetbyteLength(value) < +obj.minbytelength) {
                return obj.minbytelength + "文字未満の入力はできません。";
            }
        }

        //バイトチェックMax
        if (obj.maxbytelength != null) {
            if (GetbyteLength(value) > +obj.maxbytelength) {
                return obj.maxbytelength + "文字超過の入力はできません。";
            }
        }
        */

        const formattype = DoraFormat.GetFormatType(obj.format);
        let valueInput = value;
        let valueMin = obj.minvalue || "";
        let valueMax = obj.maxvalue || "";

        if (obj.format) {
            if (valueMin.length > 0) {
                valueMin = DoraFormat.ParseFormat(valueMin, obj.format);
            }
            if (valueMax.length > 0) {
                valueMax = DoraFormat.ParseFormat(valueMax, obj.format);
            }
        }
        let appendErrorString = "\n(" + valueMin + "～" + valueMax + "の値で入力してください)";


        //日付の場合は数値に変換
        if (formattype == DoraFormat.FORMATTYPES.date) {
            valueInput = new Date(DoraFormat.ParseFormat(valueInput, obj.format)).getTime();
        }
        //値チェックMin
        if (obj.minvalue != null) {
            let valueCheck = obj.minvalue;
            if (formattype == DoraFormat.FORMATTYPES.date) {
                valueCheck = new Date(DoraFormat.ParseFormat(valueCheck, obj.format)).getTime();
            }

            if (+valueInput < +valueCheck) {
                return valueMin + "より小さな値はの入力はできません。" + appendErrorString;
            }
        }

        //値チェックMax
        if (obj.maxvalue != null) {
            let valueCheck = obj.maxvalue;
            if (formattype == DoraFormat.FORMATTYPES.date) {
                valueCheck = new Date(DoraFormat.ParseFormat(valueCheck, obj.format)).getTime();
            }

            if (+valueInput > +valueCheck) {
                return valueMax + "より大きな値は入力はできません。" + appendErrorString;
            }
        }

    }

    return "";
}

/**
 * コントロールのcssなどの変更(doracomponent.jsから呼び出し)
 * @param {el} エレメント
 * @param {binding} バインディング値
*/
Project.SetControlCss = function (el, binding, errorFlag) {

    //新規フラグでisprimarykey=trueの場合 コントロールを入力不可とする
    let primarykey = el.getAttribute("isprimarykey");
    if (primarykey != null) {
        el.disabled = false;
        if (Project.IsBoolean(primarykey.toString()) == true) {
            if (!(binding.value[DoraConst.FIELD_NEW_FLAG] == true)) {
                el.disabled = true;
            }
        }

        //必須の場合色をつける
        if (el.disabled == true) {
            el.classList.remove("primary-request");
        }
        else {
            el.classList.add("primary-request");
        }

    }

    if (errorFlag == true) {
        el.classList.add("err-control");
    }
    else {
        el.classList.remove("err-control");
    }

}

/**
 * submit時のエラーチェック
 * @param {items} バインド値
 * @param {keyFiled} 重複チェック用の項目
 * @param {requiredfield} 必須項目
 * @param {errorCheckFunction} 個別エラーfunction (必要なければnull)
 * @param {pageMoveFunction} ページ移動のfunction (必要なければnull) ※nullの場合は単票と判定する
 * @param {errTopFlag} trueの場合、エラー行を先頭に移動
*/
Project.IsSubmitValidateError = function (paravue, items, keyFiled, requiredfield, errorCheckFunction, pageMoveFunction, errTopFlag) {

    let error = {};

    let errorClear = function () {
        error = {
            ErrorIdentity: null,     //エラーフラグを付けるエラー行(サーバからのエラーで使用)
            Field: '',
            Message: '',
        }
    };
    errorClear();

    for (let i = 0; i < items.length; i++) {
        let item = items[i];

        item[DoraConst.FIELD_IDENTITY_ID] = i;           //サーバ処理でのエラー時にでも使用してください。※indexと連動させること！

        //ERROR_FLAGをクリア
        item[DoraConst.FIELD_ERROR_FLAG] = false;
    }

    for (let i = 0; i < items.length; i++) {
        let item = items[i];

        //単体エラーが発生しているオブジェクトを検索
        let keys = Object.keys(item);
        let findString = DoraConst.APPEND_ERROR_VALUE;
        for (let j = keys.length - 1; 0 <= j; --j) {
            //if (keys[j].endsWith('～)) IEでは使えないので・・
            let keystring = keys[j];

            if ((keystring.lastIndexOf(findString) + findString.length === keystring.length) && (findString.length <= keystring.length)) {
                item[DoraConst.FIELD_ERROR_FLAG] = true;

                if (error.Message.length == 0) {
                    error = {
                        Field: keystring.replace(findString, ""),
                        Message: '入力項目がエラーです。',
                    };
                    break;
                }
            }
        }
    }

    if (error.Message.length > 0) {
        //エラーメッセージの表示
        Project.MoveErrorFocus(paravue, items, error, pageMoveFunction, errTopFlag);
        return true;
    }

    for (let i = 0; i < items.length; i++) {
        let item = items[i];

        //コントロールのエラーを一旦削除
        let keys = Object.keys(item);
        let findString = DoraConst.APPEND_IS_ERROR;
        for (let j = keys.length - 1; 0 <= j; --j) {
            //if (keys[j].endsWith('～')) IEでは使えないので・・
            let keystring = keys[j];

            if ((keystring.lastIndexOf(findString) + findString.length === keystring.length) && (findString.length <= keystring.length)) {
                delete item[keys[j]];
                break;
            }
        }

        //削除行かどうか
        let deleteFlag = Project.IsBoolean(item[DoraConst.FIELD_DELETE_FLAG]);

        //更新している行のみ (pageMoveFunction == null は単票画面)
        if (item[DoraConst.FIELD_UPDATE_FLAG] == true || pageMoveFunction == null) {

            if (error.Message.length == 0) {
                if (requiredfield != null) {
                    for (let j = 0; j < requiredfield.length; j++) {
                        if (item[requiredfield[j]] == null || item[requiredfield[j]].toString().length == 0) {
                            error = {
                                Field: requiredfield[j],
                                Message: '必須入力が入力されていません。',
                            };
                            break;
                        }
                    }

                    //削除で必須が入っていない場合は更新フラグを取り下げ
                    if (deleteFlag == true) {
                        if (error.Message.length != 0) {
                            errorClear();
                            if (item[DoraConst.FIELD_DELETE_FLAG] != null) {
                                //item[DoraConst.FIELD_DELETE_FLAG] = false;
                                item[DoraConst.FIELD_UPDATE_FLAG] = false;
                            }
                        }
                    }
                }
            }

            //重複チェック
            if (deleteFlag == false && error.Message.length == 0) {
                //新規データが対象（既存行の重複チェックはしない）
                if (item[DoraConst.FIELD_NEW_FLAG] == true) {
                    if (keyFiled != null && keyFiled.length > 0) {
                        let dupeitems = items.filter(
                            function (dupeitem) {

                                if (dupeitem[DoraConst.FIELD_IDENTITY_ID] == item[DoraConst.FIELD_IDENTITY_ID]) {
                                    return false;
                                }

                                let findFlag = true;
                                for (let j = 0; j < keyFiled.length; j++) {
                                    if (dupeitem[keyFiled[j]] != item[keyFiled[j]]) {
                                        findFlag = false;
                                        break;
                                    }
                                }

                                return findFlag;
                            }
                        );

                        if (dupeitems.length > 0) {
                            error = {
                                Field: keyFiled[0],
                                Message: 'データが重複しています。',
                            };
                        }

                    }
                }

            }

            //入力時エラーが、そのままの場合があるので、個別(桁数など)のチェックをもう一度行う
            if (deleteFlag == false && error.Message.length == 0) {
                for (let key in item) {
                    let message = Project.CheckValidate(key, item[key]);
                    if (message.length > 0) {
                        error = {
                            Field: key,
                            Message: message,
                        };
                    }
                }
            }

            //個別チェック（複数の項目などをチェックする場合などに使用）
            if (deleteFlag == false && error.Message.length == 0) {
                if (typeof errorCheckFunction == 'function') {
                    errorCheckFunction(error, item);
                }
            }

        }
        if (error.Message.length > 0) {
            item[DoraConst.FIELD_ERROR_FLAG] = true;

            //エラーメッセージの表示
            Project.MoveErrorFocus(paravue, items, error, pageMoveFunction, errTopFlag);

            return true;
        }

    }

    return false;
};

/**
 * エラー時のフォーカス移動
 * @param {paravue} vueオブジェクト
 * @param {items} バインド値
 * @param {error} エラーオブジェクト
 * @param {pageMoveFunction} ページ移動のfunction  ※nullの場合は単票と判定する
 * @param {errTopFlag} trueの場合、エラー行のデータを先頭に移動
*/
Project.MoveErrorFocus = function (paravue, items, error, pageMoveFunction, errTopFlag) {

    if (error.Message != null && error.Message.length > 0) {

        //error.ErrorIdentity がセットされている場合、ERROR_FLAGをtrueにする処理
        if (error.ErrorIdentity != null && error.ErrorIdentity.toString().length > 0) {
            let errorItems = items.filter(
                function (item) {

                    if (item[DoraConst.FIELD_IDENTITY_ID].toString() == error.ErrorIdentity.toString()) {
                        return true;
                    }
                    return false;
                }
            );

            for (let i = 0; i < errorItems.length; i++) {
                errorItems[i][DoraConst.FIELD_ERROR_FLAG] = true;
            }

        }

        //エラー行を先頭にする
        if (errTopFlag) {
            //エラーフラグの降順、IDENTITY_IDの昇順
            Project.SortJson(items, [DoraConst.FIELD_ERROR_FLAG + ".desc", DoraConst.FIELD_IDENTITY_ID]);
        }

        if (error.Field.length > 0) {
            let errorItems = items.filter(
                function (item) {
                    return Project.IsBoolean(item[DoraConst.FIELD_ERROR_FLAG]) == true;
                }
            );
            if (errorItems.length > 0) {
                //こちらの記述でエラーフィールドに色をセット
                errorItems[0][error.Field + DoraConst.APPEND_IS_ERROR] = true;
            }
        }
        //ページを１ページにする
        //this.$refs.page.gotopage(1);
        if (typeof pageMoveFunction == 'function') {
            pageMoveFunction();
        }
        //強制アップデート(これがないと .err-common の判定がおかしくなる場合があるので・・)
        paravue.$forceUpdate();

        if (error.Field.length > 0) {
            Vue.nextTick(
                function () {
                    let el = document.querySelector(".err-common");

                    if (el == null) {
                        //単票用
                        el = document;
                    }

                    el = el.querySelector("[dora_MV='" + error.Field + "']");
                    if (el != null) {

                        el.focus();
                        //if (typeof el.select == 'function') {
                        //    el.select();
                        //}
                    }

                }
            );
        }

        alert(error.Message);

        return true;
    }
};


Project.PostApi = function (handler, json) {
    return new Promise(
        function (resolve, reject) {
            let req = new XMLHttpRequest();

            req.onload = function () {
                if (req.readyState == 4 && req.status == 200) {
                    let json = null;
                    if (req.response) {
                        if (typeof req.response == 'object') {
                            json = req.response;
                        }
                        else {
                            json = JSON.parse(req.response);
                        }
                    }
                    resolve(json);
                } else {
                    if (token.length > 0) {
                        alert("認証出来ません。");
                    }

                    reject(new Error(req.statusText));
                }
            }.bind(this);

            let posturl = "";
            let actionName = document.querySelector("form").getAttribute("action");

            //asp.net core Razor page用 serverのonPostXXXXが呼ばれる
            if (actionName != null && handler.indexOf("/") == -1 ) {
                posturl = actionName + '?handler=' + handler;
            }
            else {
                posturl = handler;
            }

            if (json == null) {
                req.open('GET', posturl);
            }
            else {
                req.open('POST', posturl);
            }

            req.responseType = 'json';
            req.setRequestHeader("Content-Type", "application/json");

            //razorpage用　クロスサイト・リクエスト対策
            let xsrftoken = document.getElementsByName("__RequestVerificationToken")[0].value || '';

            if (xsrftoken.length > 0) {
                req.setRequestHeader("XSRF-TOKEN", xsrftoken);
            }

            let token = Cookies.get('access_token') || '';
            //jwt認証
            if (token.length > 0) {
                req.setRequestHeader("Authorization", "Bearer " + token);
            }

            if (json == null) {
                req.send(null);
            }
            else {
                req.send(JSON.stringify(json));
            }

        }.bind(this)
    );
};

/**
 * 処理中（くるくる）の開始/終了
 * @param {loadingFlag} true：開始 false:終了
*/
Project.SetLoading = function (loadingFlag, promise) {
    let divid = "divloading";
    if (loadingFlag) {

        //既に表示されている場合は無視
        if (document.getElementById(divid) != null) {
            return ;
        }

        let div = document.createElement('div');
        div.id = divid;
        div.innerHTML =
            "<div class=\"loader-bg\">" +
            "</div>" +
            "<div class=\"loader\">" +
            "</div>"
        ;
        document.body.appendChild(div);
    }
    else {

        let removefunction = function () {
            let div = document.getElementById(divid);
            if (div != null) {
                document.body.removeChild(div);
            }
        }.bind(this);

        //promiseが設定されている場合
        if (promise != null) {
            promise.then(
                function () {
                    removefunction();
                }
            );
        }
        else {
            removefunction();
        }

    }

};

/**
 * iframeダイアログを開く
 * @param {openHtmlPage} 開くページ
 * @param {returnFunc} 画面を戻った時に処理するfunction ※引数1つ（戻り値）
*/
Project.OpenDialog = function (openHtmlPage, args, returnFunc) {
    let wTop = window.top;

    let iframe = wTop.document.createElement("iframe");

    if (wTop.iframeManage == null) {
        wTop.iframeManage = [];
    }

    iframe.id = 'iframe' + wTop.iframeManage.length.toString();
    iframe.src = openHtmlPage;
    iframe.classList.add('iframeDialog');

    let element = wTop.document.body; //.querySelector("body");
    element.appendChild(iframe);

    //メインのスクロールを非表示にする(bulmaで定義されているので無理やり上書き)
    //こちらを記述しないとスクロールバーが2個並んでしまいます。
    //CloseDialogで強制的に削除。
    let head = wTop.document.getElementsByTagName('head')[0];
    let style = wTop.document.createElement("style");
    style.setAttribute("d", true);
    style.innerHTML = "html{overflow-y:hidden!important;/*javaで無理矢理追加*/}";
    head.appendChild(style);


    //自動的にディープコピー
    if (args != null) {
        args = JSON.parse(JSON.stringify(args));
    }

    let iframeObj = {
        Id: iframe.id,
        ReturnFunction: returnFunc,
        Args: args,
    }

    wTop.iframeManage.push(iframeObj);


};

Project.CloseDialog = function (returnValue) {
    let wTop = window.top;

    //最後のオブジェクト
    let iframeObj = wTop.iframeManage[wTop.iframeManage.length - 1];
    let iframeID = iframeObj.Id;

    if (returnValue != null) {
        if (iframeObj.ReturnFunction != null) {
            //自動的にディープコピー
            returnValue = JSON.parse(JSON.stringify(returnValue));
            iframeObj.ReturnFunction(returnValue);
        }
    }
    wTop.document.body.removeChild(wTop.document.getElementById(iframeID));

    //最後の配列を削除
    wTop.iframeManage.pop();

    if (wTop.iframeManage.length == 0) {

        //メインのスクロールを非表示にする(bulmaで定義されているので無理やり上書き) ⇒復活
        let head = wTop.document.getElementsByTagName('head')[0];

        let listArray = head.querySelectorAll("style");
        for (let i = listArray.length - 1; i >= 0; --i) {
            if (listArray[i].getAttribute("d") != null) {
                head.removeChild(listArray[i]);
            }
        }
    }

};

Project.GetDialogArgs = function () {
    let wTop = window.top;

    let args = wTop.iframeManage[wTop.iframeManage.length - 1].Args;

    //自動的にディープコピー
    if (args != null) {
        args = JSON.parse(JSON.stringify(args));
    }

    return args;

};

/**
 * 単票⇒一覧に戻ってきた場合の値のマージ
 * @param {items} バインド値
 * @param {updateData} 更新する値
 * @param {keyFiled} 主キーの項目（配列）
 * @param {pageMoveFunction} ページ移動のfunction (必要なければnull)
*/
Project.MargeInputData = function (items, updateData, keyFiled, pageMoveFunction) {

    //新規データの場合、先頭に追加
    if (updateData[DoraConst.FIELD_NEW_FLAG] == true) {
        items.unshift(updateData);

        if (typeof pageMoveFunction == 'function') {
            pageMoveFunction();
        }
    }
    else {
        if (keyFiled.length > 0) {
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let findFlag = true;

                for (let j = 0; j < keyFiled.length; j++) {
                    if (item[keyFiled[j]] != updateData[keyFiled[j]]) {
                        findFlag = false;
                        break;
                    }
                }

                if (findFlag == true) {
                    //自動的に変更されないので一旦削除してから追加する
                    items.splice(i, 1);
                    if (!(updateData[DoraConst.FIELD_DELETE_FLAG] == true)) {
                        items.splice(i, 0, updateData);
                    }
                    break;
                }

            }
        }
    }

    return items;
};

Project.IsBoolean = function (value) {
    if (value != null &&
        String(true).toLocaleLowerCase() == value.toString().toLocaleLowerCase()) {
        return true;
    }
    else {
        return false;
    }
}

/**
 * jsonのソート
 * @param {items} jsonオブジェクト
 * @param {fieldArray} 【配列バージョン】ソートのフィールド名の配列  ["並び1","並び1"]  個別にorder を変えたい場合["並び1.asc","並び1.desc"] を付与
                       【オブジェクトバージョン】 キーと値(昇順:-1 降順:1)をセット
 * @param {ascflag} 並び順 true：昇順 false:降順   個別設定は↑でも可

*/
Project.SortJson = function (items, fieldArray, ascflag) {

    let defultascvalue = -1;
    if (ascflag == false) {
        defultascvalue = 1;
    }

    let orderobj = [];

    //配列の場合 ["",""]
    if (Array.isArray(fieldArray) == true) {
        for (let i = 0; i < fieldArray.length; i++) {
            let field = fieldArray[i];
            let asc = defultascvalue;

            if (field.indexOf(".asc") > -1) {
                field = field.replace(".asc", "");
                asc = -1;
            }
            else if (field.indexOf(".desc") > -1) {
                field = field.replace(".desc", "");
                asc = 1;
            }

            orderobj.push({
                field: field,
                asc: asc
            });
        }
    }
    else {
        //オブジェクトの場合 {}
        for (let key in fieldArray) {
            orderobj.push({
                field: key,
                asc: fieldArray[key]
            });

        }
    }
    items.sort(
        function (a, b) {
            for (let i = 0; i < orderobj.length; i++) {
                let field = orderobj[i].field;
                let asc = orderobj[i].asc;

                if ((a[field] < b[field]) || (a[field] == null)) {
                    return asc;
                }
                else if ((a[field] > b[field]) || (b[field] == null)) {
                    return asc * -1;
                }
            }

            return 0;
        }
        );

}


//https://zukucode.com/2017/04/javascript-string-length.html 参考
function GetbyteLength(value) {
    let length = 0;
    for (let i = 0; i < value.length; i++) {
        let c = value.charCodeAt(i);
        if ((c >= 0x0 && c < 0x81) || (c === 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
            length += 1;
        } else {
            length += 2;
        }
    }
    return length;
}

