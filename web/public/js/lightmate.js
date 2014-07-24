/**
 * lightmade module
 * @author Markus J Doetsch mdular.com
 */
/* global app:true */

app.registerModule('lightmate', function () {
    "use strict";

    var templates,
        pixels,
        color,
        picker,
        eraser,
        drawmode = 'color';

    var init = function () {
        console.log('lightmate init');

        setup();

        enableDrawing();
    };

    var setup = function () {
      pixels = document.querySelector('#pixels');
      templates = document.querySelector('#templates');
      color = document.querySelector('input[type=color]');
      picker = document.querySelector('#picker');
      eraser = document.querySelector('#eraser');

      createPixels();
    };

    var drawModes = {
      color   : function (target) {
        target.setAttribute('style', 'background-color:' + color.value);
      },
      picker  : function (target) {
        var rgb = target.style.background;

        if (typeof rgb !== 'undefined' && rgb.length > 0) {
          color.value = rgbToCssHex(rgb);
        }

        setDrawMode('color');
      },
      eraser  : function (target) {
        target.removeAttribute('style');
      }
    };

    var enableDrawing = function () {
      pixels.addEventListener('mousedown', function (event) {

        var re = /pixel/g;
        if ( !re.test(event.target.getAttribute('class')) ) {
          return;
        }

        drawModes[drawmode].call(drawModes[drawmode], event.target);
        return;

        if (drawmode === 'color') {
          event.target.setAttribute('style', 'background-color:' + color.value);
          // TODO: update data array
          console.log(color.value);
        } else if (drawmode === 'picker') {
          //color.value = event.target.style.background;
          var rgb = event.target.style.background;

          if (typeof rgb !== 'undefined' && rgb.length > 0) {
            color.value = rgbToCssHex(rgb);
          }

          drawmode = 'color';
          picker.className = '';
        }
      });

      picker.addEventListener('mousedown', function (event) {
        toggleDrawMode('picker');
      });

      eraser.addEventListener('mousedown', function (event) {
        toggleDrawMode('eraser');
      });
    };

    var toggleDrawMode = function (mode) {
      if (drawmode === mode) {
        setDrawMode('color');
      } else {
        setDrawMode(mode);
      }
    };

    var setDrawMode = function (mode) {

      eraser.className = '';
      picker.className = '';

      if (mode === 1 || mode === 'color') { // draw color
        drawmode = 'color';
      } else if (mode === 0 || mode === 'picker') {
        drawmode = 'picker';
        picker.className = 'active';
      } else if (mode === -1 || mode === 'eraser') {
        drawmode = 'eraser';
        eraser.className = 'active';
      } else {
        throw new Error('invalid draw mode');
      }
    };

    var getTemplate = function (name) {
      var template = templates.getElementsByClassName(name);

      if (template.length > 1) {
        debug('warning: template ' + name + ' was found more than once. using [0].');
      }

      return template[0].cloneNode(true);
    };

    var createPixels = function () {
      var html = '';

      for (var i = 0; i < 64; i++) {
        var pixel = getTemplate('pixel');

        pixels.appendChild(pixel);
      }
    };

    var rgbToCssHex = function (rgbString) {
      var hex;

      // cut away css
      rgbString = rgbString.split("(")[1].split(")")[0];

      // turn into array
      rgbString = rgbString.split(',');

      // convert values
      hex = rgbString.map(function (val) {        // for each item in array
        val = parseInt(val).toString(16);   // convert to hex

        if (val.length === 1) {
          val = "0" + val; // add leading zero
        }

        return val;
      });

      // return as combined css hex string
      return "#" + hex.join('');
    };

    return {
        init: init
    };
});
