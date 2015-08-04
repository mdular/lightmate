var config;

var Router = {
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

        if (typeof params[1] === 'undefined') {
            if (params[0] === 'favicon.ico') {
                return;
            }
            Router.actions.load(params[0], response);
        } else if (params[1] === 'save') {
            Router.actions.save(params[0], postData, response);
        } else {
            sendError(response, 404, 'Not found');
        }
    },
    actions : {}
};

module.exports = Router;
