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

      // listen for draw events
      pixels.addEventListener('draw', function (event) {
        var historyState = {
          mode  : event.detail.mode,
          frame : ui.getFrame()
        }

        addItem(historyState);
      });

      // listen for clicks on history states
      history.addEventListener('click', function (event) {
        var re = /history/g;
        if ( !re.test(event.target.getAttribute('class')) ) {
          return;
        }

        var index = getHistoryIndex(event.target);
        ui.setFrame(historyData[index].frame);
      });
    };

    var addItem = function (historyState) {
      // add item to front of array
      historyData.unshift(historyState);

      // cap states array
      if (historyData.length > config.items) {
        historyData.pop();
      }

      // create from template
      var item = ui.getTemplate('history');

      item.innerHTML = renderHistory(historyState);

      history.insertBefore(item, history.childNodes[0]);

      if (history.childNodes.length > config.items) {
        removeItem(history.childNodes.length -1);
      }
    };

    var renderHistory = function (historyState) {
      var html = '',
          thumb = '<div class="thumb">';

      for (var i = 0; i < historyState.frame.length; i++) {
        thumb += '<span style="background: '+ historyState.frame[i] +';"></span>';
      }
      thumb += '</div>';

      // TODO: add change event msg of action

      html = thumb;
      html += historyState.mode;

      return html;
    };

    var getHistoryIndex = function (target) {
      var i = 0;
      while ((target = target.previousElementSibling) !== null) {
        i++;
      }

      return i;
    };

    var removeItem = function (index) {
      historyData.splice(index, 1);

      history.removeChild(history.childNodes[index]);
    };

    var getHistory = function () {
      return historyData;
    };

    var setHistory = function (data) {

      // clear history
      for (var i = 0, len = historyData.length; i < len; i++) {
        removeItem(0);
      }

      // add new items
      for (var i = data.length - 1; i >= 0; i--) {
        addItem(data[i]);
      }
    };

    return {
        init        : init,
        getHistory  : getHistory,
        setHistory  : setHistory
    };
});
