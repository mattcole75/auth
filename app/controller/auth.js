// Description: Provides the co-ordination for the auth functionality
// Developer: Matt Cole
// Date created: 2022-01-29
// Change history:
//  1.

const auth = require('../repository/auth');
const log = require('../../utility/logger')();
const crypto = require('crypto');
const config = require('../../configuration/config');
const version = config.get('version');
const validate = require('../../validation/validate');
const { postUserRules, postLoginRules, getUserRules, postLogoutRules, getTokenRules, patchUserDisplayNameRules, patchUserEmailRules, patchUserPasswordRules } = require('../../validation/rules');
const moment = require('moment');
const { genHash, genToken } = require('../../utility/auth');


const postUser = (req, next) => {

    const errors = validate(req.body, postUserRules);

    if(errors.length > 0) {
        log.error(`POST v${version} - validation failure - postUser - status: 400, msg: ${errors}`);
        next({status: 400, msg: 'Bad request - validation failure'}, null);
    } else {

        const salt = crypto.randomBytes(256);
        const hash = genHash(req.body.password, salt);

        auth.postUser(
            {   ...req.body,
                password: hash,
                salt: salt.toString('hex'),
                inuse: true,
                lastLoggedIn: null,
                logInCount: 0,
                updated: moment().format(),
                created: moment().format()
            }, 
            (err, user) => {
            if(err) {
                log.error(`POST v${version} - failed - postUser - status: ${err.status} msg: ${err.msg}`);
                next(err, null);
            }
            else {
                // log.info(`POST v${version} - success - postuser - status: ${user.status}`);
                next(null, user);
            }
        });
    }
}

const login = (req, next) => {

    const errors = validate(req.body, postLoginRules);

    if(errors.length > 0) {
        log.error(`POST v${version} - validation failure - login - status: ${err.status} msg: ${errors}`);
        next({status: 400, msg: 'Bad request - validation failure'}, null);
    } else {
        auth.authenticate(req.body, (err, result) => {
            if(err) {
                log.error(`POST v${version} - failed - login - status: 400, msg: ${err.msg}`);
                next(err, null);
            } else {
                const params = { localId: result.data._id, idToken: genToken(), lastLoggedIn: moment().format()};
                auth.patchToken(params, (err, idToken) => {
                    if(err) {
                        log.error(`POST v${version} - failed - login - status: ${err.status} msg: ${err.msg}`);
                        next(err, null);
                    } else {
                        next(null, {
                            status: result.status,
                            user: {
                                localId: result.data._id,
                                displayName: result.data.displayName,
                                email: result.data.email,
                                idToken: idToken.idToken,
                                expiresIn: 3600
                            }
                        });
                    }
                });

            }
        });
    }
}

const getUser = (req, next) => {

    let errors = [];
    if(req.headers.localid && req.headers.localid != null && req.headers.idtoken && req.headers.idtoken != null) {
        errors = validate(req.headers, getUserRules);
    } else {
        log.error(`POST v${version} - validation failure - getUser - status: 400, msg: request header parameters missing`);
        return next({status: 400, msg: 'Bad request - validation failure'}, null);
    }
    
    if(errors.length > 0) {
        log.error(`POST v${version} - validation failure - getUser - status: 400, msg: ${errors}`);
        next({status: 400, msg: 'Bad request - validation failure'}, null);
    } else {
        auth.getUser(req.headers, (err, result) => {
            if(err) {
                log.error(`POST v${version} - failed - getUser - status: ${err.status} msg: ${err.msg}`);
                next(err, null);
            } else {
                next(null, {
                    status: result.status,
                    user: {
                        localId: result.data._id,
                        displayName: result.data.displayName,
                        email: result.data.email
                    }
                });
            }
        });
    }
}

const logout = (req, next) => {

    const errors = validate(req.headers, postLogoutRules);

    if(errors.length > 0) {
        log.error(`POST v${version} - validation failure - logout - status: 400, msg: ${errors}`);
        next({status: 400, msg: 'Bad request - validation failure'}, null);
    } else {
        const params = { localId: req.headers.localid, idToken: req.headers.idtoken};
        auth.removeToken(params, (err, res) => {
            if(err) {
                log.error(`POST v${version} - failed - getUser - status: ${err.status} msg: ${err.msg}`);
                next(err, null);
            } else {
                next(null, res);
            }
        });
    }
}

const isAuthenticated = (req, next) => {

    let errors = [];

    if( req.headers.localid && req.headers.localid != null && req.headers.localid !== null && req.headers.localid !== '' && req.headers.localid !== 'null' &&
        req.headers.idtoken && req.headers.idtoken != null && req.headers.idtoken !== null && req.headers.idtoken !== '' && req.headers.idtoken !== 'null') {
        errors = validate(req.headers, getTokenRules);
    } else {
        log.error(`POST v${version} - validation failure - isAuthenticated - status: 400, msg: request header parameters missing`);
        return next({status: 401, msg: 'Unauthorised'}, null);
    }   

    if(errors.length > 0) {
        log.error(`POST v${version} - validation failure - isAuthenticated - status: 400, msg: ${errors}`);
        next({status: 400, msg: 'Bad request - validation failure'}, null);
    } else {
        const params = { idToken: req.headers.idtoken, localId: req.headers.localid };
        auth.isAuthenticated(params, (err, data) => {
            if(err) {
                log.error(`POST v${version} - failed - isAuthenticated - status: ${err.status} msg: ${err.msg}`);
                next(err, null);
            } else {
                // log.info(`POST v${version} - success - getIdFromToken - status ${data.status}`);
                next(null, data);
            }
        });
    }
}

const patchUserDisplayName = (req, next) => {

    const errors = validate(req.body, patchUserDisplayNameRules);

    if(errors.length > 0) {
        log.error(`POST v${version} - validation failure - logout - status: 400, msg: ${errors}`);
        next({status: 400, msg: 'Bad request - validation failure'}, null);
    } else {
        const params = { localId: req.headers.localid, idToken: req.headers.idtoken, data: { displayName: req.body.displayName, updated: moment().format() } };
        auth.patchUser(params, (err, res) => {
            if(err) {
                log.error(`POST v${version} - failed - patchUser - status: ${err.status} msg: ${err.msg}`);
                next(err, null);
            } else {
                next(null, res);
            }
        });
    }
}

const patchUserEmail = (req, next) => {

    const errors = validate(req.body, patchUserEmailRules);

    if(errors.length > 0) {
        log.error(`POST v${version} - validation failure - logout - status: 400, msg: ${errors}`);
        next({status: 400, msg: 'Bad request - validation failure'}, null);
    } else {
        const params = { localId: req.headers.localid, idToken: req.headers.idtoken, data: { email: req.body.email, updated: moment().format() } };
        auth.patchUser(params, (err, res) => {
            if(err) {
                log.error(`POST v${version} - failed - patchUser - status: ${err.status} msg: ${err.msg}`);
                next(err, null);
            } else {
                next(null, res);
            }
        });
    }
}

const patchUserPassword = (req, next) => {

    const errors = validate(req.body, patchUserPasswordRules);

    const salt = crypto.randomBytes(256);
    const hash = genHash(req.body.password, salt);

    if(errors.length > 0) {
        log.error(`POST v${version} - validation failure - logout - status: 400, msg: ${errors}`);
        next({status: 400, msg: 'Bad request - validation failure'}, null);
    } else {
        const params = { localId: req.headers.localid, idToken: req.headers.idtoken, data: { salt: salt.toString('hex'), password: hash, updated: moment().format() } };
        auth.patchUser(params, (err, res) => {
            if(err) {
                log.error(`POST v${version} - failed - patchUser - status: ${err.status} msg: ${err.msg}`);
                next(err, null);
            } else {
                next(null, res);
            }
        });
    }
}

module.exports = {
    postUser: postUser,
    login: login,
    getUser: getUser,
    logout: logout,
    isAuthenticated: isAuthenticated,
    patchUserDisplayName: patchUserDisplayName,
    patchUserEmail: patchUserEmail,
    patchUserPassword: patchUserPassword
}