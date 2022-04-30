// Description: Jest tests to support a TDD development approach
// Developer: Matt Cole
// Date created: 2022-01-29
// Change history:
//  1. 

const endPoint = require('./endPoint');
const crypto = require('crypto');

let localId1 = null;
let idToken1 = null;
let localId2 = null;
let idToken2 = null;
let wrongToken = '7c58e9e7cd20ae44f354d59f7a73ebb7e346d5e5a61517e33e0e97c4c79d25a826debfc57ca2e99c66108f80801059a9d2d94d14886fc98539e4ab324a5da2e125aa7e7d26af000e103fcbc75b0ed9caa75895ba26efa248fc0c2154a581786679c6a2a9120fadc9e68fef80bc30d6a8644cd19362e035a85e130d675e2e30a9';

describe('Create the system administrator account', () => {

    it('should, create a user given the right information', async done => {
        await endPoint.post('/user')
            .send({
                displayName: "System Administrator",
                email: 'sysadmin@phobos.com',
                password: crypto.createHash('sha256').update('1adminphobosA').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(201);
                expect(res.body.data.acknowledged === true)
                expect(res.body.data.insertedId)
                localId1 = res.body.data.insertedId
                done();
            })
    });

    it('should, return the user details and token given correct credentials', async done => {
        await endPoint.post('/user/login')
            .send({
                email: 'sysadmin@phobos.com',
                password: crypto.createHash('sha256').update('1adminphobosA').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(200);
                expect(res.body.user.displayName).toBe('System Administrator');
                expect(res.body.user.email).toBe('sysadmin@phobos.com');
                expect(res.body.user.idToken).toHaveLength(256);
                localId1 = res.body.user.localId;
                idToken1 = res.body.user.idToken;        
                done();
            })
    });

    it('should successfully return the users details given the correct idToken and Local Id', async done => {
        await endPoint.get('/user')
            .set({
                idToken: idToken1,
                localId: localId1
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(200);
                expect(res.body.user.displayName).toBe('System Administrator');
                expect(res.body.user.email).toBe('sysadmin@phobos.com');
                done();
            })
    });

    it('should, logout the user given the user id and idToken', async() => {
        await endPoint.post('/user/logout')
            .set({
                idToken: idToken1,
                localId: localId1
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });

    // it('should deny access if the account is disabled', async() => {
    //     const res = await sendRequest(baseUrl + '/user/login', 'POST', {
    //         email: 'admin@phobos.com',
    //         password: '1adminphobosA'
    //     }, null);
    //     expect(res.status).toBe(402);
    //     expect(res.msg).toBe('Account disabled, contact your administrator');
    // });
});

describe('Create a second test uesr', () => {

    it('should, create a second user given the right information', async done => {
        await endPoint.post('/user')
            .send({
                displayName: "Test",
                email: 'test@phobos.com',
                password: crypto.createHash('sha256').update('letmein').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(201)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(201);
                expect (res.body.data.acknowledged === true)
                expect (res.body.data.insertedId)
                localId2 = res.body.data.insertedId
                done();
            })
    });

    it('should, return auth details for second user login', async done => {
        await endPoint.post('/user/login')
            .send({
                email: 'test@phobos.com',
                password: crypto.createHash('sha256').update('letmein').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(200);
                expect(res.body.user.displayName).toBe('Test');
                expect(res.body.user.email).toBe('test@phobos.com');
                expect(res.body.user.idToken).toHaveLength(256);
                localId2 = res.body.user.localId;
                idToken2 = res.body.user.idToken;
                done();
            })
    });

    it('should successfully return the users details given the correct idToken and Local Id', async done => {
        await endPoint.get('/user')
            .set({
                idToken: idToken2,
                localId: localId2
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(200);
                expect(res.body.user.displayName).toBe('Test');
                expect(res.body.user.email).toBe('test@phobos.com');
                done();
            })
    });

    it('should fail to update the display name given a non valid display name', async() => {
        await endPoint.patch('/user/displayname')
            .set({
                localId: localId2,
                idToken: idToken2
            })
            .send({
                displayName: '123456789012345678901234567890123456789012345678901'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
                expect(res.body.msg).toBe('Bad request - validation failure');
            })
    });

    it('should update the display name', async() => {
        await endPoint.patch('/user/displayname')
            .set({
                localId: localId2,
                idToken: idToken2
            })
            .send({
                displayName: 'Test A'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });

    it('should fail to update the email adress given a non valid email address', async() => {
        await endPoint.patch('/user/email')
            .set({
                localId: localId2,
                idToken: idToken2
            })
            .send({
                email: 'testaphobos.com'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
                expect(res.body.msg).toBe('Bad request - validation failure');
            })
    });

    it('should update the email address', async() => {
        await endPoint.patch('/user/email')
            .set({
                localId: localId2,
                idToken: idToken2
            })
            .send({
                email: 'testa@phobos.com'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });

    it('should fail to update the password given a non valid password', async() => {
        await endPoint.patch('/user/password')
            .set({
                localId: localId2,
                idToken: idToken2
            })
            .send({
                password: crypto.createHash('sha256').update('1adminphobosA').digest('hex') + '1234567890'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
                expect(res.body.msg).toBe('Bad request - validation failure');
            })
    });

    it('should update the password', async() => {
        await endPoint.patch('/user/password')
            .set({
                localId: localId2,
                idToken: idToken2
            })
            .send({
                password: crypto.createHash('sha256').update('letmein1').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });

    it('should, logout the user given the user id', async() => {
        await endPoint.post('/user/logout')
            .set({
                idToken: idToken2,
                localId: localId2
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });
});

// auth deny access tests
describe('Deny Access for bad user requests', () => {

    it('login test A', async done => {
        await endPoint.post('/user/login')
            .send({
                email: 'testa@phobos.com',
                password: crypto.createHash('sha256').update('letmein1').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(200);
                expect(res.body.user.displayName).toBe('Test A');
                expect(res.body.user.email).toBe('testa@phobos.com');
                expect(res.body.user.idToken).toHaveLength(256);
                localId2 = res.body.user.localId;
                idToken2 = res.body.user.idToken;
                done();
            })
    });

    it('should, fail to return the users details given the wrong token', async() => {
        await endPoint.get('/user')
            .set({
                idToken: wrongToken,
                localId: localId2
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
    });

    it('should, fail to return the users details given no headers', async() => {
        await endPoint.get('/user')
            .set({
                
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401)
    });

    it('should, fail to return the users details given null token', async() => {
        await endPoint.get('/user')
            .set({
                idToken: null,
                localId: localId2
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401)
    });

    it('should, fail to return the users details given an empty token', async() => {
        await endPoint.get('/user')
            .set({
                idToken: '',
                localId: localId2
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401)
    });

    it('should, deny access for a non-existing user', async done => {
        await endPoint.post('/user/login')
            .send({
                email: 'donny@phobos.com',
                password: crypto.createHash('sha256').update('donnyexist').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(404);
                expect(res.body.msg).toBe('Invalid email / password supplied');
                done();
            })
    });

    it('should, deny access for an incorrect password', async done => {
        await endPoint.post('/user/login')
            .send({
                email: 'sysadmin@phobos.com',
                password: crypto.createHash('sha256').update('wrongPassword').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(401);
                expect(res.body.msg).toBe('Invalid email / password supplied');
                done();
            })
    });

    it('should, deny access for an incorrect email', async done => {
        await endPoint.post('/user/login')
            .send({
                email: 'wrong@phobos.com',
                password: crypto.createHash('sha256').update('1adminphobosA').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(404);
                expect(res.body.msg).toBe('Invalid email / password supplied');
                done();
            })
    });

    it('should, fail to create a user with an already registered email address', async done => {
        await endPoint.post('/user')
            .send({
                displayName: "Sys Admin",
                email: 'sysadmin@phobos.com',
                password: crypto.createHash('sha256').update('1adminphobosA').digest('hex')
            })
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
                expect(res.body.msg).toBe('Duplicate entry');
                done();
            })
    });

    it('should, logout the user given the user id', async() => {
        await endPoint.post('/user/logout')
            .set({
                idToken: idToken2,
                localId: localId2
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });
});

// auth input validator tests
describe('Test the user input validators', () => {

    it('should, fail validation for missing @', async done => {
        await endPoint.post('/user')
            .send({
                displayName: "Test",
                email: 'testphobos.com',
                password: crypto.createHash('sha256').update('letmein').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
                expect(res.body.msg).toBe('Bad request - validation failure');
                done();
            })
    });

    it('should, fail validation for a display name > 50 chars', async done => {
        await endPoint.post('/user')
            .send({
                displayName: "123456789012345678901234567890123456789012345678901",
                email: 'test@phobos.com',
                password: crypto.createHash('sha256').update('TestUser').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
                expect(res.body.msg).toBe('Bad request - validation failure');
                done();
            })
    });

    it('should, fail validation for a display name > 50 chars and email missing @', async done => {
        await endPoint.post('/user')
            .send({
                displayName: "123456789012345678901234567890123456789012345678901",
                email: 'testphobos.com',
                password: crypto.createHash('sha256').update('TestUser').digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
                expect(res.body.msg).toBe('Bad request - validation failure');
                done();
            })
    });

});