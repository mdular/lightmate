var http = require('http');
var Router = require('./Router');
var Actions = require("./Actions");
var Store = require("./Store");

// TODO: bind frames to user account (guest users get random id, access by URL possible, registration required for pw protection)
// TODO: 10 frames per user
// TODO: "live" mode, "draw" trigger
// TODO: client ID, attach client to account

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
    listenPort: 8888
}

Actions.configure({
    pixelAmount: config.pixelAmount,
    historyLength: config.historyLength
});

Router.configure({
    "maxPostLength": config.maxPostLength,
    "defaultHeader": config.defaultHeader
});
Router.setActions(Actions);

Store.connect({
    "mongoURI": config.mongoURI
});

// TODO: handle server independently of app / db connection
//       > just route / static files
server = http.createServer(Router.handler);
server.on("error", function (e) {
    throw e;
})
server.listen(config.listenPort, function () {
    console.dir('http server listening on 8888');
});
