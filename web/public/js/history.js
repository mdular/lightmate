/**
 * history module
 * @author Markus J Doetsch mdular.com
 */
/* global app:true */

app.registerModule('history', function () {
    "use strict";

    var config = {
      items : 10 // how much history to keep
    };

    var history,
        historyData = [],
        ui;

    var init = function () {
      ui = app.getModule('ui').module;
      history = document.querySelector('#histories');
      
      pixels.addEventListener('change', function (event) {
        var frame = ui.getFrame();

        historyData.unshift(frame);

        if (historyData.length > config.items) {
          historyData.pop();
        }

        addItem(frame);
        //console.log('change');
      });

      history.addEventListener('click', function (event) {
        var re = /history/g;
        if ( !re.test(event.target.getAttribute('class')) ) {
          return;
        }

        var index = getHistoryIndex(event.target);
        ui.setFrame(historyData[index]);
      });
    };

    var addItem = function (data) {
      // create from template
      var item = ui.getTemplate('history');

      item.innerHTML = 'aaaa' + Math.random();

      history.insertBefore(item, history.childNodes[0]);

      if (history.childNodes.length > config.items) {
        removeItem(history.childNodes[config.items]);
      }
    };

    var renderHistory = function (data) {
      var html = '';

    };

    var getHistoryIndex = function (target) {
      var i = 0;
      while ((target = target.previousElementSibling) !== null) {
        i++;
      }

      return i;
    };

    var removeItem = function (item) {
      history.removeChild(item);
    }

    return {
        init      : init
    };
});
