/**
 * lightmate controller
 * @author Markus J Doetsch mdular.com
 */
/* global app:true */

app.registerController('lightmate', function () {
    "use strict";

    var ui, data, history, id;

    var init = function () {
      ui = app.getModule('ui').module;
      history = app.getModule('history').module;
      data = app.getModule('data').module;

      var syncToggle = document.querySelector('[name=syncToggle]');
      var syncEnabled = syncToggle.checked;

      var frameId = document.querySelector('#frameIds');
      id = frameId.querySelector('input:checked').value || 1;

      ui.enableDrawing();
      actions.load();

      // TODO: status, errors

      // TODO: when sync is active, also sync selected frame (1s poll?)
      // TODO: server should return most recently drawn frame
      // TODO: via socket to receive push updates

      document.querySelector('#options').addEventListener('click', function (event) {
          if (!event.target.hasAttribute('data-action')) return;

          event.preventDefault();

          var action = event.target.getAttribute('data-action');
          if (typeof actions[action] !== 'function') {
              throw new Error('Action not defined.');
              return;
          }

          actions[action].call(event, this);
      }.bind(this));

      frameId.addEventListener('change', function (event) {
          id = event.target.value;
          actions.load();
      });

      syncToggle.addEventListener('change', function (event) {
          syncEnabled = event.target.checked;
      });

      pixels.addEventListener('sync', function (event) {
          if (!syncEnabled) return;

          data.draw(ui.getFrame());
      });

      pixels.addEventListener('draw', function (event) {
          if (!syncEnabled) return;

          data.draw(ui.getFrame());
      });
    };

    var actions = {
        clear: function (event) {
            ui.clear();
        },
        save: function (event) {
            data.save(id, {
                pixels: ui.getFrame(),
                history: history.getHistory()
            });
        },
        load: function (event) {
            data.load(id, function (data) {
                ui.setFrame(data.pixels, true);
                history.setHistory(data.history);
            });
        },
        draw: function (event) {
            data.draw(ui.getFrame());
        }
    };

    // TODO: action concept

    return {
        init      : init
    };
});
