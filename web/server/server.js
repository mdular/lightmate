var http = require('http');
var Router = require('./Router');
var Actions = require("./Actions");
var Store = require("./Store");
var SocketServer = require("./SocketServer");

// TODO: bind frames to user account (guest users get random id, access by URL possible, registration required for pw protection)
// TODO: 10 frames per user
// TODO: client ID, attach client to account - access page via URL (even if guest, create "release" option for client UI!);
// client (id ref) > server (url ref, can be password protected)
// frames 'page' stays 1-10, 'ref' becomes server url ref
// unresistered, unused server url refs (accounts) get purged / ref released, could be reused (random chance)

var config = {
    mongoURI: 'mongodb://localhost:27017/lightmate',
    maxPostLength: 1e6, // 1.000.000 bytes
    pixelAmount: 64,
    historyLength: 10,
    defaultHeader: {
        // TODO: set proper origins when deploying this!
        "Access-Control-Allow-Origin" : "*",
        "Content-Encoding": "gzip",
        "X-Server": Math.ceil(Math.random() * 20)
    },
    httpListenPort: 8888,
    tcpListenPort: 8124
}

/**
 * http routing
 */
Router.configure({
    "maxPostLength": config.maxPostLength,
    "defaultHeader": config.defaultHeader
});
Actions.configure({
    pixelAmount: config.pixelAmount,
    historyLength: config.historyLength
});

// mount actions
Router.setActions(Actions);


/**
 * data store
 */
Store.connect({
    "mongoURI": config.mongoURI
});


/**
 * http server
 */
 // TODO: behind nginx for production
 // TODO: handle server independently of app / db connection
 //       > just route / static files
 server = http.createServer(Router.handler);
 server.on("error", function (e) {
     throw e;
 })
 server.listen(config.httpListenPort, function () {
     console.dir('http server listening on 8888');
 });


/**
 * socket server
 */
// TODO: behind nginx for production
SocketServer.start({
    port: config.tcpListenPort
});
