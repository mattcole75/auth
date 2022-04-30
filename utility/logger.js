// Description: The application logging utility
// Developer: Matt Cole
// Date created: 2022-01-29
// Change history:
//  1. 

"use strict";
const bunyan = require('bunyan');
const config = require('../configuration/config');

const createLogger = () => {

    const logger = bunyan.createLogger({
        name: config.get('application'),
        streams: [{
            path: process.env.LOG_PATH,
        }]
    });

    return logger;
};

module.exports = createLogger;