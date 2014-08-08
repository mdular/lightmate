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

    var ajax = function (url, data, callback) {
        var req = new XMLHttpRequest();

        req.addEventListener('progress', function (event) {
            //console.log('progress', event);

            callback(event);
        });

        req.addEventListener('load', function (event) {
            //console.log('load', event);

            callback(event);
        });

        req.addEventListener('error', function (event) {
            //console.log('error', event);

            callback(event);
        });

        req.addEventListener('abort', function (event) {
            //console.log('abort', event);

            callback(event);
        });

        if (data) {
            req.open('post', url);
            req.send(JSON.stringify(data));
        } else {
            req.open('get', url);
            req.send();
        }
    }

    var save = function (data) {
        if (typeof id === 'undefined' || !id) {
            throw new Error('no id!');
            return;
        }

        var payload = {};
        payload.reference = id;
        payload.pixels = data;

        ajax(url + id + '/save', payload, function (event) {
            if (event.type === "load" && event.target.status === 200) {
                console.log('save OK');
            } else if (event.target.status !== 200) {
                console.log('save error', event.target.status);
            }
        });
    };

    var load = function (callback) {
        if (typeof id === 'undefined' || !id) {
            throw new Error('no id!');
            return;
        }

        ajax(url + id, false, function (event) {
            if (event.type === 'load' && event.target.status === 200) {
                callback(JSON.parse(event.target.response));
            } else if (event.target.status !== 200) {
                console.log('load error', event.target.status);
            }
        });
    };

    return {
        init      : init,
        save      : save,
        load      : load
    };
});
