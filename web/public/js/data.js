/**
 * data module
 * @author Markus J Doetsch mdular.com
 */
/* global app:true */

app.registerModule('data', function () {
    "use strict";

    var url = 'http://localhost:8888/',
        id;

    var init = function () {
        var frameId = document.querySelector('#frameId');
        frameId.addEventListener('change', function (event) {
            id = event.target.value;
        });
        id = frameId.value;
    };

    var ajax = function (url, data) {
        var req = new XMLHttpRequest();

        req.addEventListener('progress', function (event) {
            console.log('progress', event);
        });

        req.addEventListener('load', function (event) {
            console.log('load', event);
        });

        req.addEventListener('error', function (event) {
            console.log('error', event);
        });

        req.addEventListener('abort', function (event) {
            console.log('abort', event);
        });

        req.open('post', url);
        req.send(JSON.stringify(data));
    }

    var save = function (data) {
        if (typeof id !== 'undefined' && id) {
            var payload = {};
            payload.reference = id;
            payload.pixels = data;
            console.log('ajax', payload);
            // ajax(url + id + '/save', data);
        } else {
            console.log('no id!');
        }
    };

    var load = function (id) {

    };

    return {
        init      : init,
        save      : save
    };
});
