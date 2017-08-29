(function ($) {

    $.fn.iDialog = function (options, param) {
        var dialog = options.dialog;
        var $dialogObj = $("#" + dialog.id);
        var defaults = {
            currentDialogId: this.selector,
            width: 700,
            height: 450,//宽高限制700*450,950*500
            title: '新增/编辑',
            modal: true,
            closed: true,
            iconCls: 'fa fa-windows',
            collapsible: true,
            maximizable: true,
            minimizable: false,
            maximized: false,
            resizable: true,
            openAnimation: 'show',
            openDuration: 100,
            closeAnimation: 'show',
            closeDuration: 400,
            zIndex: 10,
            toolbar: this.selector + '-toolbar',
            buttons: this.selector + '-buttons',
            postfix: 'Edit',
            combotreeFields: '',
            refreshTreeId: '',
            onBeforeLoad: function () {
                $("#Loading").length > 0 ? showMask() : loadMask();
            },
            onBeforeOpen: function () {

            },
            onLoad: function () {
                hiddenMask();
                $.messager.progress('close');
                $(this).trigger(topJUI.eventType.initUI.form);
                $(this).dialog("center");
                if (dialog.url != undefined) {
                    // 获取选中行的数据
                    var row = getSelectedRowData(options.grid.type, options.grid.id);
                    // 如果指定了数据来源URL，则通过URL加载数据
                    var newDialogUrl = replaceUrlParamValueByBrace(dialog.url, row);
                    $.getJSON(newDialogUrl, function (data) {
                        $dialogObj.form('load', data);
                        if (typeof dialog.editor == "string" || typeof dialog.editor == "object") {
                            // kindeditor编辑器处理
                            if (typeof dialog.editor == "string") {
                                // 富文本编辑器字符串
                                var ke = [], keObj = [];
                                ke = dialog.editor.replace(/'/g, '"').split(",");
                                for (var i = 0; i < ke.length; i++) {
                                    keObj.push(strToJson(ke[i]));
                                }
                            } else {
                                // 富文本编辑数组
                                keObj = dialog.editor;
                            }
                            for (var i = 0; i < keObj.length; i++) {
                                var editorType = keObj[i]["type"];
                                var editorId = keObj[i]["id"];
                                var editorField = keObj[i]["field"];
                                if (editorType == "kindeditor") {
                                    getTabWindow().$("iframe").each(function (i) {
                                        this.contentWindow.document.body.innerHTML = html_decode(data[editorField]);
                                    });
                                } else {
                                    UE.getEditor(editorId).ready(function () {
                                        UE.getEditor(editorId).setContent(data[editorField]);
                                    });
                                }
                            }
                        }
                    });
                } else {
                    // 如果没有指定数据来源URL，则直接加载选中行的数据
                    // $dialogObj.form('load', row); // 防止新增时也加载选中行的数据，暂时屏蔽
                }

                // 如果存在父表，则将父表中指定的字段数据加载到本窗口中
                if (typeof options.parentGrid == "object") {
                    var parentRow = getSelectedRowData(options.parentGrid.type, options.parentGrid.id);
                    var jsonData = getSelectedRowJson(options.parentGrid.params, parentRow);
                    $dialogObj.form('load', jsonData);
                }
            },
            onClose: function () {
                $(dialog.currentDialogId).form('clear');
            }
        }

        dialog = $.extend(defaults, options.dialog);

        var controllerUrl = getUrl('controller');
        dialog.href = dialog.href ? dialog.href + location.search : controllerUrl + "edit" + location.search;

        $(this).dialog(dialog);
    }

    $.extend($.fn.dialog.methods, {
        createDialog: function (jq, opts) {
            if ($("#" + opts.dialog.id).length == 0) {
                //var opts = $.data(jq, "dialog").options;
                //模态窗口随机id
                if (opts.dialog.id == undefined) opts.dialog.id = getRandomNumByDef();
                var divOrForm = opts.dialog.form == false ? "div" : "form";
                var dialogDom = '<' + divOrForm + ' id="' + opts.dialog.id + '"></' + divOrForm + '>';

                // 判断是否存在linkbutton按钮组
                var buttonsDom = "", btnIdArr = [];
                if (typeof opts.dialog.buttonsGroup == "object") {
                    var btnArr = opts.dialog.buttonsGroup;
                    $.each(btnArr, function (i, btn) {
                        //默认以ajaxForm方式提交
                        if (!btn.handler) {
                            btn.handler = 'ajaxForm';
                        }
                        //按钮随机id
                        if (btn.id == undefined) btnIdArr.push(getRandomNumByDef());
                        buttonsDom += '<a id="' + btnIdArr[i] + '" href="#" data-options="menubuttonId:\'' + opts.id + '\',dialogId:\'' + opts.dialog.id + '\'">' + btn.text + '</a>';
                    });
                }
                getTabWindow().$('body').append(
                    dialogDom +
                    '<div id="' + opts.dialog.id + '-buttons" style="display:none">' +
                    buttonsDom +
                    '<a href="#" class="closeDialog" onclick="javascript:$(\'#' + opts.dialog.id + '\').dialog(\'close\')">关闭</a>' +
                    '</div>'
                );
                //渲染自定义按钮
                if (typeof opts.dialog.buttonsGroup == "object") {
                    var btnOptsArr = opts.dialog.buttonsGroup;
                    $.each(btnOptsArr, function (i, btnOpts) {
                        $("#" + btnIdArr[i]).iLinkbutton(btnOpts);
                    });
                }
                //关闭按钮
                $(".closeDialog").iLinkbutton({
                    iconCls: 'fa fa-close',
                    btnCls: 'topjui-btn-danger'
                });
                //模态对话框
                //$("#" + opts.dialog.id).iDialog(opts);
            }
        }
    });

    generateDialogDoc = function (options) {

        var defaults = {
            iconCls: 'fa fa-plus',
            parentGridUnselectedMsg: '请先选中一条主表数据！',
            dialog: {
                title: '数据详情',
                width: 650,
                height: 450
            }
        }

        options = $.extend(defaults, options);

        var divOrForm = options.dialog.form == false ? "div" : "form";
        var dialogDom = '<' + divOrForm + ' data-toggle="topjui-dialog" data-options="id:\'' + options.dialog.id + '\',href:\'' + options.dialog.href + '\',url:\'' + options.dialog.url + '\',title:\'' + options.dialog.title + '\',beforeOpenCheckUrl:\'' + options.dialog.beforeOpenCheckUrl + '\'"></' + divOrForm + '>';

        // 判断dialog是否存在linkbutton按钮组
        var buttonsDom = "";
        if (typeof options.dialog.buttonsGroup == "object") {
            var buttonsArr = options.dialog.buttonsGroup;
            var btLength = buttonsArr.length;
            if (btLength > 0) {
                for (var i = 0; i < btLength; i++) {
                    // 默认为ajaxForm提交方式
                    if (!buttonsArr[i].handler) {
                        buttonsArr[i].handler = 'ajaxForm';
                    }
                    buttonsDom += '<a href="#" data-toggle="topjui-linkbutton" data-options="menubuttonId:\'' + options.id + '\',handlerBefore:\'' + buttonsArr[i].handlerBefore + '\',handler:\'' + buttonsArr[i].handler + '\',dialog:{id:\'' + options.dialog.id + '\'},url:\'' + buttonsArr[i].url + '\',iconCls:\'' + buttonsArr[i].iconCls + '\',btnCls:\'' + buttonsArr[i].btnCls + '\'">' + buttonsArr[i].text + '</a>';
                }
            }
        }

        getTabWindow().$('body').append(
            dialogDom +
            '<div id="' + options.dialog.id + '-buttons" style="display:none">' +
            buttonsDom +
            '<a href="#" data-toggle="topjui-linkbutton" data-options="iconCls:\'fa fa-close\',btnCls:\'topjui-btn-danger\'" onclick="javascript:$(\'#' + options.dialog.id + '\').dialog(\'close\')">关闭</a>' +
            '</div>'
        );

    }

})(jQuery);