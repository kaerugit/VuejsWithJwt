'use strict';

window.addEventListener("keydown", keydownHandler);

function keydownHandler(e) {
    setfocus(e);
}

function setfocus(e) {

    if (!(e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40)) {
        return
    }

    //textareaが全て選択されているかどうかチェックするfunction
    let isAllSelect = function () {
        let objActive = document.activeElement;

        let selectionValue = "";
        let selectionObjct = window.getSelection();     //IE以外はこちらに文字がセットされる
        if (selectionObjct != null && selectionObjct.toString() != "") {
            selectionValue = selectionObjct.toString();
        }
        else {
            if (objActive.value != "") {
                try {
                    selectionValue = objActive.value.substring(objActive.selectionStart, objActive.selectionEnd);
                }
                catch (e) { }
            }
        }
        if (objActive.value.length != selectionValue.length) {
            return false;
        }
        return true;
    }

    if (e.keyCode == 13) {

        //ボタンの場合クリックイベントを実行
        if (document.activeElement.tagName.toLowerCase() == "button") {
            document.activeElement.click();
            return;
        }

        //focus対象のオブジェクト
        let listArray = document.querySelectorAll('select,input,textarea,button');
        let findFlag = false;

        for (let i = 0; i < listArray.length; i++) {
            let obj = listArray[i];
            let objType = obj.type.toLowerCase();

            if (findFlag == true) {
                if (objType != "hidden") {
                    try {
                        if (obj.readOnly == true) {
                            continue;
                        }
                    }
                    catch (e) { }

                    try {
                        if (obj.disabled == true) {
                            continue;
                        }
                    }
                    catch (e) { }

                    if (obj.tabIndex != null && (+obj.tabIndex) < 0) {
                        continue;
                    }

                    //イベントのキャンセル
                    e.preventDefault();
                    obj.focus();

                    //お好みで
                    //if (typeof obj.select == 'function') {
                    //    obj.select();
                    //}

                    break;
                }
            }

            if (listArray[i] === document.activeElement) {
                if (objType == "textarea") {        //textareaはエンターキーで改行なので特別処理
                    if (isAllSelect() == false) {     //全て選択されていない場合は処理しない
                        break;
                    }
                }

                findFlag = true;
            }

        }
    }
    //上下(tableタグ前提で上下移動)
    else if (e.keyCode == 38 || e.keyCode == 40) {
        

        let objActive = document.activeElement;
        if (objActive == null || objActive.type == null) {
            return;
        }
        let objActiveType = objActive.type.toLowerCase();

        if (objActiveType == "textarea") {        //textareaはエンターキーで改行なので特別処理
            if (isAllSelect() == false) {     //全て選択されていない場合は処理しない
                return;
            }
        }
        else if (objActiveType.indexOf("select") == 0) {
            return;
        }
        
        let plusValue = 1;
        if (e.keyCode == 38) {      //上
            plusValue = -1
        }

        if (objActiveType != "hidden") {
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
            
            //親にtdが存在した場合
            if (findFlag == true) {

                //tdのindexを求める
                let parentTR = parentTD.parentNode;
                let listArray = parentTR.querySelectorAll('td');
                let findIndexTD = -1;

                for (let i = 0; i < listArray.length; i++) {
                    let obj = listArray[i];
                    if (parentTD == obj) {
                        findIndexTD = i;
                        break;
                    }
                }

                if (findIndexTD != -1) {
                    let findIndexTR = -1;
             
                    //trのindexを求める
                    let listArrayTR = parentTR.parentNode.querySelectorAll('tr');
                    for (let i = 0; i < listArrayTR.length; i++) {
                        let obj = listArrayTR[i];
                        if (parentTR == obj) {
                            findIndexTR = i + plusValue;
                            break;
                        }
                    }

                    if (findIndexTR != -1 && listArrayTR.length > findIndexTR) {
                        let nextFlag = true;
                        do {
                            try {
                                //trのindexをプラス(マイナス)して同じ位置のtdの最初のinputにフォーカスを移動
                                listArray = listArrayTR[findIndexTR].querySelectorAll('td');
                                listArray = listArray[findIndexTD].querySelectorAll('input,textarea');

                                for (let i = 0; i < listArray.length; i++) {
                                    let obj = listArray[i];
                                    let objType = obj.type.toLowerCase();
                                    if (objType == objActiveType) {
                                        //focusがセットできない場合は次
                                        if (obj.readOnly == true || obj.disabled == true) {
                                            continue;
                                        }
                                        else if (obj.tabIndex != null && (+obj.tabIndex) < 0) {
                                            continue;
                                        }
                                        //イベントのキャンセル
                                        e.preventDefault();
                                        obj.focus();
                                        
                                        ////お好みで
                                        //if (typeof obj.select == 'function') {
                                        //    obj.select();
                                        //}                                                        

                                        nextFlag = false;
                                        break;
                                    }
                                }

                            }
                            catch (e) {
                                nextFlag = false;
                            }

                            //次（前）の行
                            findIndexTR = findIndexTR + plusValue;

                        } while (nextFlag);

                    }
                }
            }
        }
    }
};

