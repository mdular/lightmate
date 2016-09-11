var MongoClient = require('mongodb').MongoClient;

var Store = {
    db: null,
    connect: function (config) {
        MongoClient.connect(config.mongoURI, (err, dbConnection) => {
          if (err) throw err;

          // TODO: handle mongo connection loss, retry, error

          this.db = dbConnection;
          console.dir('mongodb connection established');
        });
    },
    loadFrame: function (id, callback) {
        if (!this.db) {
            callback(new Error("No db connection"));
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
