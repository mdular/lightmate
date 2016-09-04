/**
 * lightmate controller
 * @author Markus J Doetsch mdular.com
 */
/* global app:true */

app.registerController('lightmate', function () {
    "use strict";

    var ui, data, history;

    var init = function () {
      ui = app.getModule('ui').module;
      history = app.getModule('history').module;
      data = app.getModule('data').module;

      ui.enableDrawing();

      document.querySelector('#save').addEventListener('click', function (event) {
        event.preventDefault();

        data.save({
          pixels    : ui.getFrame(),
          history   : history.getHistory()
        });
      });

      document.querySelector('#load').addEventListener('click', function (event) {
        event.preventDefault();

        data.load(function (data) {
          ui.setFrame(data.pixels);
          history.setHistory(data.history);
        });
      });

      pixels.addEventListener('draw', function (event) {
          data.draw(ui.getFrame());
      });
    };

    // TODO: action concept

    return {
        init      : init
    };
});
