// Description: The App configuration entry point set up
// Developer: Matt Cole
// Date created: 2022-04-23
// Change history:
//  1. 
const express = require('express');
const config = require('./config');
const application = config.get('application');
const version = config.get('version');
const morgan = require('morgan');

const allowCrossOriginRequests = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization, idToken, localId');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
};

module.exports = () => {

    const app = express();
    
    app.use(express.json())
    app.use(allowCrossOriginRequests);

    app.use(morgan('[:date[clf]] :method :url :status :response-time ms - :res[content-length]'));

    app.get('/' + application + '/api/' + version, (req, res) => {
        res.status(200).json({'msg': 'Server is up!'});
    });

    require('../app/routes/auth')(app);

    return app;
}