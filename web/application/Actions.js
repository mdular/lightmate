var Router = require("./Router");
var Store = require("./Store");

var Actions = {
    config: {},

    configure: function (config) {
        this.config = config;
    },

    draw: function (data, response) {
        //   console.log('draw', data);
        // validate pixels
        if (typeof data === 'undefined' || data.length !== this.config.pixelAmount) {
            console.dir('invalid draw request', data);
            Router.sendError(response, 400); // Bad request
            return;
        }

        // TODO: write to client
        console.log("TODO: write to client");

            Router.sendError(response, 200);
        })
    },

    save  : function (id, data, response) {
        var invalid = false,
        update = {};

        // TODO: store IPs / User with history
        // TODO: flood protection (+ use cloudflare)

        // prepare update data
        // TODO: strict validation for expected values!

        // validate pixels
        if (typeof data.pixels === 'undefined' && data.pixels.length !== this.config.pixelAmount) {
            invalid = true;
        } else {
            update.pixels = data.pixels;
        }

        // validate history
        if (!invalid && typeof data.history !== 'undefined') {
            if (data.history.length > this.config.historyLength) {
                invalid = true;
            }

            if (data.history.length > 0) {
                for (var i = 0, len = data.history.length; i < len; i++) {
                    var frame = data.history[i].frame;

                    if (typeof frame === 'undefined' || frame.length !== this.config.pixelAmount) {
                        invalid = true;
                    }
                }
            }

            if (!invalid) {
                update.history = data.history ;
            }
        }

        if (invalid) {
            console.dir('invalid save request', data);
            // Bad request
            Router.sendError(response, 400);
            return;
        }

        Store.saveFrame(id, update, function (err, doc) {
            if (err) {
                console.dir(err);
                // Internal server error
                Router.sendError(response, 500);
                return;
            }

            Router.sendJSONResponse(response, doc);
        });
    },

    load  : function (id, response) {
        // TODO: load response from cache, send if found

        id = id.trim();

        if (!(/[a-z0-9]{1,10}/i).test(id)) {
            // Bad request
            Router.sendError(response, 400);
            return;
        }

        Store.loadFrame(id, (err, doc) => {
            if (err) {
                console.dir(err);
                // Internal server error
                Router.sendError(response, 500);
                return;
            }

            if (!doc) {
                // Not found
                Router.sendError(response, 404, "Not found");
                return;
            } else {
                Router.sendJSONResponse(response, doc);
            }
        })

        // TODO: cache response
    }
}

module.exports = Actions;
