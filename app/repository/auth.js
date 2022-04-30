// Description: Provides the repository for the auth app
// Developer: Matt Cole
// Date created: 2022-04-23
// Change history:
//  1. 

const { ObjectId } = require('mongodb');
const database = require('../../configuration/database');
const { genHash } = require('../../utility/auth');

const postUser = (req, next) => {
    const dbConnect = database.getDb();

    dbConnect
        .collection('user')
        .insertOne(req, (err, res) => {
        if(err){
            if(err.code === 11000) // duplicate entry
                next({ status: 400, msg: 'Duplicate entry' }, null);
            else
                next({ status: 500, msg: err }, null);
        }
        else
            next(null, { status: 201, data: res });
    });
}

const authenticate = (req, next) => {

    const dbConnect = database.getDb();

    dbConnect
        .collection('user')
        .findOne({ email: req.email }, ((err, res) => {
            if(err)
                next({ status: 500, msg: err }, null);
            else if(!res)
                next({status: 404, msg: "Invalid email / password supplied"}, null);
            else {
                if(res.password === genHash(req.password, Buffer.from(res.salt, 'hex')))
                    next(null, {status: 200, data: res});
                else 
                    next({status: 401, msg: 'Invalid email / password supplied'}, null);
            }
        }));
}

const patchToken = (req, next) => {

    const dbConnect = database.getDb();

    dbConnect
        .collection('user')
        .updateOne(
            { _id: req.localId },
            { $set: { idToken: req.idToken , lastLoggedIn: req.lastLoggedIn}, $inc: { logInCount: + 1 }},
            { upsert: true }, 
            function (err, res) {
            if (err)
                next({status: 500, msg: err}, null);
            else if (res.acknowledged === true && res.modifiedCount === 1 && res.upsertedId === null && res.upsertedCount === 0)
                next(null, {status: 200, idToken: req.idToken});
            else
                next({status: 400, msg: "Invalid request"}, null);
    });
}

const getUser = (req, next) => {

    const dbConnect = database.getDb();
    const id = new ObjectId(req.localid);

    dbConnect
        .collection('user')
        .findOne({ _id: id, idToken: req.idtoken }, ((err, res) => {
            if(err)
                next({ status: 500, msg: err }, null);
            else if(!res)
                next({status: 404, msg: "Not found"}, null);
            else if(res.inuse === false)
                next({status: 403, msg: "Account disabled, contact your system administrator"}, null);
            else
                next(null, {status: 200, data: res});
        }));
}

const removeToken = (req, next) => {

    const dbConnect = database.getDb();
    const id = new ObjectId(req.localId);

    dbConnect
        .collection('user')
        .updateOne(
            { _id: id }, 
            { $set: { idToken: ''}},
            { upsert: true }, ((err, result) => {
                if (err)
                next({status: 500, msg: err}, null);
            else if (result.acknowledged === true && result.modifiedCount === 1 && result.upsertedId === null && result.upsertedCount === 0)
                next(null, {status: 200, msg: 'OK'});
            else
                next({status: 400, msg: "Invalid request"}, null);
    }));
}

const isAuthenticated = (req, next) => {
    
    const dbConnect = database.getDb();
    const id = new ObjectId(req.localId);

    dbConnect
        .collection('user')
        .findOne({ _id: id, idToken: req.idToken }, ((err, res) => {
            if(err)
                next({ status: 500, msg: err }, null);
            else if(!res)
                next({status: 404, msg: "Unauthorised"}, null);
            else if(res.inuse === false)
                next({status: 403, msg: "Account disabled, contact your system administrator"}, null);
            else
                next(null, {status: 200, msg: 'OK'});
        }));
}

const patchUser = (req, next) => {

    const dbConnect = database.getDb();
    const id = new ObjectId(req.localId);

    dbConnect
        .collection('user')
        .updateOne(
            { _id: id }, 
            { $set: req.data },
            { upsert: true }, ((err, result) => {
                if (err)
                next({status: 500, msg: err}, null);
            else if (result.acknowledged === true && result.modifiedCount === 1 && result.upsertedId === null && result.upsertedCount === 0)
                next(null, {status: 200, msg: 'OK'});
            else
                next({status: 400, msg: "Invalid request"}, null);
    }));
}

module.exports = {
    postUser: postUser,
    authenticate: authenticate,
    patchToken: patchToken,
    getUser: getUser,
    removeToken: removeToken,
    isAuthenticated: isAuthenticated,
    patchUser: patchUser
}