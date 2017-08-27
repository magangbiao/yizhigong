(function ($) {

    $.fn.iMenubutton = function (options, param) {
        var defaults = {
            plain: true,
            iconCls: 'fa fa-cog',
            hasDownArrow: false,
            onClick: function () {
                $(this).menubutton(options.clickEvent)
            }
        }

        var options = $.extend(defaults, options);
        options = bindMenuClickEvent($(this), options);

        $(this).menubutton(options);
    }

    $.extend($.fn.menubutton.methods, {

        openDialog: function (jq) {
            //var options = $.data(jq[0], "menubutton").options;
            //openDialog(jq[0]);
            return jq.each(function () {
                openDialog(this);
            });
        },
        openTab: function (jq) {
            return jq.each(function () {
                addParentTab(this);
            });
        },
        openWindow: function (jq) {
            return jq.each(function () {
                openWindow(this);
            });
        },
        doAjax: function (jq) {
            return jq.each(function () {
                doAjaxHandler(this);
            });
        },
        request: function (jq) {
            return jq.each(function () {
                requestHandler(this);
            });
        },
        delete: function (jq) {
            return jq.each(function () {
                deleteHandler(this);
            });
        },
        filter: function (jq) {
            return jq.each(function () {
                filterHandler(this);
            });
        },
        search: function (jq) {
            return jq.each(function () {
                searchHandler(this);
            });
        },
        export: function (jq) {
            return jq.each(function () {
                exportHandler(this);
            });
        },
        import: function (jq) {
            return jq.each(function () {
                importHandler(this);
            });
        }

    });

})(jQuery);