// Description: Provides the routes for the auth functionality
// Developer: Matt Cole
// Date created: 2022-04-23
// Change history:
//  1. 

const config = require('../../configuration/config');
const application = config.get('application');
const version = config.get('version');
const auth = require('../controller/auth');

module.exports = (app) => {

    app.post('/' + application + '/api/' + version + '/user', (req, res) => {
        auth.postUser(req, (err, user) => {
            res.set('Content-Type', 'application/json');
            if(err)
                res.status(err.status).send(err);
            else
                res.status(user.status).send(user);
        });
    });

    app.post('/' + application + '/api/' + version + '/user/login', (req, res) => {
        auth.login(req, (err, auth) => {
            res.set('Content-Type', 'application/json');
            if(err)
                res.status(err.status).send(err);
            else
                res.status(auth.status).send(auth);
        });
    });

    app.get('/' + application + '/api/' + version + '/user', (req, res) => {
        res.set('Content-Type', 'application/json');
        auth.isAuthenticated(req, (err) => {
            if(err)
                res.status(err.status).send(err);
            else {
                auth.getUser(req, (err, user) => {
                    if(err)
                        res.status(err.status).send(err);
                    else
                        res.status(user.status).send(user);
                });
            }
        });
    });

    app.post('/' + application + '/api/' + version + '/user/logout', (req, res) => {
        res.set('Content-Type', 'application/json');
        auth.isAuthenticated(req, (err) => {
            if(err)
                res.status(err.status).send(err);
            else {
                auth.logout(req, (err, auth) => {
                    if(err)
                        res.status(err.status).send(err);
                    else
                        res.status(auth.status).send(auth);
                });
            }
        });
    });

    app.patch('/' + application + '/api/' + version + '/user/displayname', (req, res) => {
        res.set('Content-Type', 'application/json');
        auth.isAuthenticated(req, (err) => {
            if(err)
                res.status(err.status).send(err);
            else {
                auth.patchUserDisplayName(req, (err, user) => {
                    if(err)
                        res.status(err.status).send(err);
                    else
                        res.status(user.status).send(user);
                });
            }
        });
    });

    app.patch('/' + application + '/api/' + version + '/user/email', (req, res) => {
        res.set('Content-Type', 'application/json');
        auth.isAuthenticated(req, (err) => {
            if(err)
                res.status(err.status).send(err);
            else {
                auth.patchUserEmail(req, (err, user) => {
                    if(err)
                        res.status(err.status).send(err);
                    else
                        res.status(user.status).send(user);
                });
            }
        });
    });

    app.patch('/' + application + '/api/' + version + '/user/password', (req, res) => {
        res.set('Content-Type', 'application/json');
        auth.isAuthenticated(req, (err) => {
            if(err)
                res.status(err.status).send(err);
            else {
                auth.patchUserPassword(req, (err, user) => {
                    if(err)
                        res.status(err.status).send(err);
                    else
                        res.status(user.status).send(user);
                });
            }
        });
    });

    app.post('/' + application + '/api/' + version + '/approvetransaction', (req, res) => {
        auth.approveTransaction(req, (err, token) => {
            res.set('Content-Type', 'application/json');
            if(err)
                res.status(err.status).send(err);
            else
                res.status(token.status).send(token);
        });
    });
}