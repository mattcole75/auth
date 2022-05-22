'use strict';
const dotenv = require('dotenv').config();
const database = require('./configuration/database');
const config = require('./configuration/config');
const application = config.get('application');
const express = require('./configuration/express');

if(dotenv.error) {
    console.log(dotenv.error);
    process.exit(1);
}

const PORT = process.env.PORT;

const app = express();

// app.use(function (err, _req, res) {
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });

database.connectToServer((err) => {
    if (err) {
        console.error(err);
        process.exit();
    } else {
        app.listen(PORT, () => {
            console.log(application + ` api is running on port: ${PORT}`);
        });
    }
});