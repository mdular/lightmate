var Client = require('./Client');

// TODO: persist clients in store
// preserves url ref (account) link after unload
// keep some stats / historical fields

var clients = {};

var ClientManager = {
    create: function (ref) {
        var client = new Client(ref);
        clients[ref] = client;

        console.log('created client', ref);

        return this.get(ref);
    },

    getOrCreate: function (ref) {
        let client = this.get(ref);

        if (client === false) {
            return this.create(ref);
        }

        return client;
    },

    get: function (ref) {
        if (typeof clients[ref] === 'undefined') {
            return false;
        }

        return clients[ref];
    }
};

module.exports = ClientManager;
