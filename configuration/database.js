const { MongoClient } = require('mongodb');
const config = require('./config');
const connectionString = config.get('db.uri');

const client = new MongoClient(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let dbConnection;

module.exports = {
    connectToServer: function (callback) {
        client.connect(function (err, database) {
            if (err || !database) {
                return callback(err);
            }

            dbConnection = database.db('auth');
            console.log('Successfully connected to MongoDB.');

            return callback();
        });
    },

    getDb: function () {
        return dbConnection;
    },
};