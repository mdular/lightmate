/**
 * lightmate controller
 * @author Markus J Doetsch mdular.com
 */
/* global app:true */

app.registerController('lightmate', function () {
    "use strict";

    var ui, data;

    var init = function () {
      ui = app.getModule('ui').module;
      ui.enableDrawing();

      data = app.getModule('data').module;

      document.querySelector('#save').addEventListener('mousedown', function (event) {
        data.save(ui.getFrame());
      });

      document.querySelector('#load').addEventListener('mousedown', function (event) {
        data.load(function (data) {
          ui.setFrame(data.pixels);
        });
      });
    };

    // TODO: action concept

    return {
        init      : init
    };
});
