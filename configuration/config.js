const convict = require('convict');

const config = convict({
    version: {
        type: String,
        default: '0.1'
    },
    application: {
        type: String,
        default: 'auth'
    },
    db: {
        uri: {
            type: String,
            default: process.env.DB_URI
        }
    },
    adminEmail: {
        type: String,
        default: process.env.ADMIN
    }
});

module.exports = config;