var net = require("net");
var ClientManager = require('./ClientManager');

var SocketServer = {
    config: {},
    server: null,

    start: function (config) {
        this.config = config;

        this.server = net.createServer((conn) => {
            console.log("socket connected");

            var client = null;

            // TODO: this will not work for large json (>16000 characters)
            // http://stackoverflow.com/questions/10489168/node-send-large-json-over-net-socket
            conn.on('data', (data) => {
                try {
                    data = JSON.parse(data);
                } catch (err) {
                    console.log("Socket Error: json parsing failed", err);
                    conn.write(JSON.stringify({
                        action: 'error',
                        result: 'ERR0'
                    }));
                    return;
                }

                if (typeof data.action === 'undefined') {
                    console.log('Socket Error: action missing');
                    conn.write(JSON.stringify({
                        action: 'error',
                        result: 'ERR0'
                    }));
                    return;
                }

                if (typeof data.payload === 'undefined') {
                    console.log('Socket Error: payload missing');
                    conn.write(JSON.stringify({
                        action: data.action,
                        result: 'ERR0'
                    }));
                    return;
                }

                // handle data.action
                switch (data.action) {
                    case 'connect':
                        // TODO: token validation

                        console.log('connect request', data.payload);

                        if (typeof data.payload.token === 'undefined') {
                            console.log("Socket Error: no token provided");
                            conn.write(JSON.stringify({
                                action: 'connect',
                                result: 'ERR1'
                            }));
                            break;
                        }

                        if (typeof data.payload.ref === 'undefined') {
                            console.log("Socket Error: no ref provided");
                            conn.write(JSON.stringify({
                                action: 'connect',
                                result: 'ERR2'
                            }));
                            break;
                        }

                        // link with client instance
                        client = ClientManager.getOrCreate(data.payload.ref);
                        client.connect(conn);

                        conn.write(JSON.stringify({
                            action: 'connect',
                            result: 'OK'
                        }));
                        break;
                    default:
                        console.log("Socket Error: action could not be handled", data.action);
                        break;
                }

                // TODO: wait 5 seconds for connect request, otherwise kill
                // {
                //     action: 'connect',
                //     payload: {
                //         ref: 'A',
                //         token: '123'
                //     }
                // }
            });

            conn.on('end', () => {
                // console.log("client disconnected");
                if (client === null) {
                    return;
                }
                
                client.disconnect((err) => {
                    if (err) throw err;
                });
            });
        });

        this.server.on('error', (err) => {
            throw err;
        });

        this.server.listen(config.port, () => {
            console.log('socket server listening for clients on', this.server.address());
        });
    },
}

module.exports = SocketServer;
