/**
 * ui module
 * @author Markus J Doetsch mdular.com
 */
/* global app:true */

app.registerModule('ui', function () {
    "use strict";

    var templates,
        pixels,
        color,
        picker,
        eraser,
        filler,
        clear,
        drawmode = 'color';

    var init = function () {
        setup();
    };

    var setup = function () {
        pixels = document.querySelector('#pixels');
        templates = document.querySelector('#templates');
        color = document.querySelector('input[type=color]');
        picker = document.querySelector('#picker');
        eraser = document.querySelector('#eraser');
        filler = document.querySelector('#filler');

        createPixels(64);
    };

    var drawModes = {
        color   : function (target) {
            setPixelColor(target, color.value);
        },
        picker  : function (target) {
            var rgb = target.style.backgroundColor;

            if (typeof rgb !== 'undefined' && rgb.length > 0) {
                color.value = rgbToCssHex(rgb);
            }

            setDrawMode('color');
        },
        eraser  : function (target) {
            setPixelColor(target, false);
            //target.removeAttribute('style');
        },
        filler  : function (target) {
            var targetColor = target.style.backgroundColor;

            // TODO: detect if adjacent (row +-1, col +-1)
            for (var i = 0; i < pixels.childNodes.length; i++) {
                if (pixels.childNodes[i].style.backgroundColor === targetColor) {
                    setPixelColor(pixels.childNodes[i], color.value);
                }
            }

            setDrawMode('color');
        }
    };

    var enableDrawing = function () {
      pixels.addEventListener('mousedown', function (event) {

        var re = /pixel/g;
        if ( !re.test(event.target.getAttribute('class')) ) {
          return;
        }

        var isPicker = (drawmode === 'picker');

        var mode = drawmode;

        drawModes[drawmode].call(drawModes[drawmode], event.target);

        if (!isPicker) {
          var evt = new CustomEvent('draw', {'detail' : {'mode' : mode}});
          pixels.dispatchEvent(evt);
        }
      });

      // TODO: consolidate event delegation, using data-attrib
      picker.addEventListener('mousedown', function (event) {
        toggleDrawMode('picker');
      });

      eraser.addEventListener('mousedown', function (event) {
        toggleDrawMode('eraser');
      });

      filler.addEventListener('mousedown', function (event) {
        toggleDrawMode('filler');
      });
    };

    var clear = function () {
        for (var i = 0; i < pixels.childNodes.length; i++) {
            setPixelColor(pixels.childNodes[i], false);
        }
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
      filler.className = '';

      if (mode === 'color') { // draw color
        drawmode = 'color';
      } else if (mode === 'picker') {
        drawmode = 'picker';
        picker.className = 'active';
      } else if (mode === 'eraser') {
        drawmode = 'eraser';
        eraser.className = 'active';
      } else if (mode === 'filler') {
        drawmode = 'filler';
        filler.className = 'active';
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

    var createPixels = function (amount) {
      var html = '';

      for (var i = 0; i < amount; i++) {
        var pixel = getTemplate('pixel');

        pixels.appendChild(pixel);
      }
    };

    var rgbToCssHex = function (rgbString) {
      var hex;

      // cut away css syntax
      rgbString = rgbString.split("(")[1].split(")")[0];

      // turn into array
      rgbString = rgbString.split(',');

      // convert values
      hex = rgbString.map(function (val) {
        val = parseInt(val).toString(16);   // convert to hex

        if (val.length === 1) {
          val = "0" + val; // add leading zero
        }

        return val;
      });

      // return as combined css hex string
      return "#" + hex.join('');
    };

    var setPixelColor = function (target, value) {
      if (value) {
        target.setAttribute('style', 'background-color:' + value);
      } else {
        target.removeAttribute('style');
      }
    };

    var getFrame = function () {
      var data = [];

      for (var i = 0; i < pixels.childNodes.length; i++) {
        var value = 0;

        if (pixels.childNodes[i].style.backgroundColor.length > 0) {
          value = rgbToCssHex(pixels.childNodes[i].style.backgroundColor);
        }

        data.push(value);
      }

      return data;
    };

    var setFrame = function (data, triggerChange) {
      for (var i = 0; i < data.length; i++) {
        setPixelColor(pixels.childNodes[i], data[i]);
      }

      if (typeof triggerChange !== 'undefined' && triggerChange) {
        pixels.dispatchEvent(new Event('sync'));
      }
    };

    return {
        init      : init,
        enableDrawing : enableDrawing,
        getFrame  : getFrame,
        setFrame  : setFrame,
        getTemplate : getTemplate,
        clear: clear
    };
});
