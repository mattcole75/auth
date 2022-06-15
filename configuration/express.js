const express = require('express');
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

    require('../app/routes/auth')(app);

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!')
    });

    return app;
};