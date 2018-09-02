var MongoClient = require('mongodb').MongoClient;

var Store = {
    db: null,
    connect: function (config) {
        MongoClient.connect(config.mongoURI, (err, client) => {
            if (err) {
                console.dir("Error: failed to connect to database. Retrying...");
                // throw err;
                // TODO: continue here
                setTimeout(() => {
                    this.connect(config);
                }, 10000);
                return err;
            }

            this.db = client.db('lightmate');
            console.dir('Database connection established');

            client.on('close', (event) => {
                client.close();
                this.db = null;
                console.dir('Database connection lost. Attempting to reconnect.');
                this.connect(config);
            });
        });
    },
    loadFrame: function (id, callback) {
        if (!this.db) {
            callback(new Error("No db connection"));
            return;
        }

        this.db.collection('frames').findOne(
            {
                reference : id
            },
            {
                _id     : 0,
                pixels  : 1,
                history : 1
            },
            (err, doc) => {
                callback(err, doc);
            }
        );
    },
    saveFrame: function (id, data, callback) {
        if (!this.db) {
            callback(new Error("No db connection"));
            return;
        }

        this.db.collection('frames').findAndModify(
            // query
            { reference : id },

            // sort
            { reference : 1},

            // update
            { '$set' : data},

            // options
            {
                new   : true,
                upsert: true
            },
            function (err, doc) {
                delete doc._id;
                callback(err, doc);
            }
        );
    }
};

module.exports = Store;
