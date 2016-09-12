var Client = require('./Client');

// TODO: persist clients in store
// preserves url ref (account) link after unload
// keep some stats

var clients = {};

var ClientManager = {
    create: function (ref) {
        var client = new Client(ref);
        clients[ref] = client;

        console.log('created client', ref);
    },

    getOrCreate: function (ref) {
        if (typeof clients[ref] === 'undefined') {
            this.create(ref);
        }

        return clients[ref];
    },

    get: function (ref) {
        if (typeof clients[ref] === 'undefined') {
            return false;
        }

        return clients[ref];
    }
};

module.exports = ClientManager;
