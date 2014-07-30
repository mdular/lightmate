/**
 * lightmate controller
 * @author Markus J Doetsch mdular.com
 */
/* global app:true */

app.registerController('lightmate', function () {
    "use strict";

    var ui;

    var init = function () {
      ui = app.getModule('ui').module;
      ui.enableDrawing();
    };

    // TODO: action concept

    return {
        init      : init
    };
});
