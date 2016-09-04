var config;

var Router = {
    actions : {},

    configure: function (conf) {
        config = conf;
    },

    handler: function (req, response) {
        var params = req.url.split('/');
        params.shift();

        if (req.method === 'GET') {
            Router.route(params, response, null);
        } else if (req.method === 'POST') {
            // TODO: csrf token validation
            //       (needs to be persisted and rendered in template too...)
            // currently this is an unlimited open write!

            var body = '';
            req.on('data', function (data) {
                body += data;

                if (body.length > config.maxPostLength) {
                    sendError(response, 413); // Request Entity Too Large
                    request.connection.destroy();
                }
            });
            req.on('end', function () {
                var data = JSON.parse(body);
                Router.route(params, response, data);
            });
        }
    },

    route: function (params, response, postData) {
        // TODO: serve static files
        // TODO: default route
        // TODO: route actions
        // TODO: simple render
        // TODO: test if action exists
        // TODO: call actions with try catch, log error

        console.log("request", params);

        switch (params[0]) {
            case 'favicon.ico':
                return;
                break;
            case 'load':
                this.actions.load(params[1], response);
                break;
            case 'save':
                this.actions.save(params[1], postData, response);
                break;
            case 'draw':
                this.actions.draw(postData, response);
                break;
            default:
                this.sendError(response, 404, 'Not found');
                break;
        }
    },

    sendError: function (response, statusCode, message) {
        this.sendHeader(response, statusCode, 'text/plain');
        if (typeof message !== 'undefined') {
            response.write(message);
        }
        response.end();
    },

    sendHeader: function (response, statusCode, contentType) {
        var header = config.defaultHeader;
        header["Content-Type"] = contentType;
        response.writeHead(statusCode, header);
    }
};

module.exports = Router;
