// Description: the application configuration file
// Developer: Matt Cole
// Date created: 2022-04-18
// Change history:
//  1. 

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
    }
});

module.exports = config;