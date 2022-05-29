// Description: Jest tests to support a TDD development approach
// Developer: Matt Cole
// Date created: 2022-01-29
// Change history:
//  1. 

const endPoint = require('./endPoint');
const crypto = require('crypto');
const goodUsers = require('./data/good.user.data');
const badUsers = require('./data/bad.user.data');

let localId1 = null;
let idToken1 = null;
let localId2 = null;
let idToken2 = null;
let wrongToken = '7c58e9e7cd20ae44f354d59f7a73ebb7e346d5e5a61517e33e0e97c4c79d25a826debfc57ca2e99c66108f80801059a9d2d94d14886fc98539e4ab324a5da2e125aa7e7d26af000e103fcbc75b0ed9caa75895ba26efa248fc0c2154a581786679c6a2a9120fadc9e68fef80bc30d6a8644cd19362e035a85e130d675e2e30a9';

describe('Create system users:', () => {

    goodUsers.forEach(user => {

        it('should, create a user account for: ' + user.displayName, async () => {
            await endPoint.post('/user')
                .send({
                    displayName: user.displayName,
                    email: user.email,
                    password: crypto.createHash('sha256').update(user.password).digest('hex')
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(201)
                .then(res => {
                    expect(res.body).toBeDefined();
                    expect(res.body.status).toBe(201);
                    expect(res.body.data.acknowledged === true)
                    expect(res.body.data.insertedId)
                    user.localId = res.body.data.insertedId
                })
        });
    });
});

describe('Log each user in, get their data and logout:', () => {

    goodUsers.forEach(user => {
        it('should, login and return the user details and token for: ' + user.displayName, async () => {
            await endPoint.post('/user/login')
                .send({
                    email: user.email,
                    password: crypto.createHash('sha256').update(user.password).digest('hex')
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(res => {
                    expect(res.body).toBeDefined();
                    expect(res.body.status).toBe(200);
                    expect(res.body.user.displayName).toBe(user.displayName);
                    expect(res.body.user.email).toBe(user.email);
                    expect(res.body.user.idToken).toHaveLength(256);
                    user.localId = res.body.user.localId;
                    user.idToken = res.body.user.idToken;        
                })
        });
    });

    goodUsers.forEach(user => {

        it('should, successfully return the users details for: ' + user.displayName, async () => {
            await endPoint.get('/user')
                .set({
                    idToken: user.idToken,
                    localId: user.localId
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .then(res => {
                    expect(res.body).toBeDefined();
                    expect(res.body.status).toBe(200);
                    expect(res.body.user.displayName).toBe(user.displayName);
                    expect(res.body.user.email).toBe(user.email);
                })
        });
    });

    goodUsers.forEach(user => {

        if(user.role.includes('administrator')) {
            
            let role = user.role;

            it('should, elevate specified users to the administrator role', async () => {
                await endPoint.patch('/user/role')
                    .set({
                        idToken: goodUsers[9].idToken,
                        localId: goodUsers[9].localId
                    })
                    .set('Accept', 'application/json')
                    .send({
                        idToken: user.idToken,
                        localId: user.localId,
                        role: role
                    })
                    .expect('Content-Type', /json/)
                    .then(res => {
                        expect(res.body.status).toBe(200);
                    })
            });
        }
    });

    goodUsers.forEach(user => {

        it('should, return all registered users but only for an administrator role', async () => {
            await endPoint.get('/users')
                .set({
                    idToken: user.idToken,
                    localId: user.localId
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .then(res => {
                    if(user.role.includes('administrator')){
                        // console.log(res.body);
                        expect(res.body.status).toBe(200);
                    } else {
                        expect(res.body.status).toBe(403);
                    }
                })
        });
    });

    goodUsers.forEach(user => {

        it('should, logout: ' + user.displayName, async() => {
            await endPoint.post('/user/logout')
                .set({
                    idToken: user.idToken,
                    localId: user.localId
                })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
        });
    });

});
    
describe('Deny access tests:', () => {

    it('should, deny access for incorrect email address', async () => {
        await endPoint.post('/user/login')
            .send({
                email: badUsers[0].email,
                password: crypto.createHash('sha256').update(badUsers[0].password).digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(404);
                expect(res.body.msg).toBe('Invalid email / password supplied');       
            })
    });

    it('should, deny access for incorrect password', async () => {
        await endPoint.post('/user/login')
            .send({
                email: badUsers[1].email,
                password: crypto.createHash('sha256').update(badUsers[1].password).digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(401);
                expect(res.body.msg).toBe('Invalid email / password supplied');       
            })
    });

    it('should, deny access for incorrect email and password', async () => {
        await endPoint.post('/user/login')
            .send({
                email: badUsers[2].email,
                password: crypto.createHash('sha256').update(badUsers[2].password).digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(404);
                expect(res.body.msg).toBe('Invalid email / password supplied');       
            })
    });

    it('should, login a valid user for further testing', async () => {
        await endPoint.post('/user/login')
            .send({
                email: badUsers[3].email,
                password: crypto.createHash('sha256').update(badUsers[3].password).digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(200);
                expect(res.body.user.displayName).toBe(badUsers[3].displayName);
                expect(res.body.user.email).toBe(badUsers[3].email);
                expect(res.body.user.idToken).toHaveLength(256);
                badUsers[3].localId = res.body.user.localId;
                badUsers[3].idToken = res.body.user.idToken;      
            })
    });

    it('should, fail to return user data, given a loged in user but with invadid token', async () => {
        await endPoint.get('/user')
            .set({
                idToken: wrongToken,
                localId: badUsers[3].localId
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(404);
                expect(res.body.msg).toBe('Unauthorised');
            })
    });

    it('should, fail to return user data, given a loged in user but with invadid localId', async () => {
        await endPoint.get('/user')
            .set({
                idToken: badUsers[3].idToken,
                localId: '1234567890'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(400);
                expect(res.body.msg).toBe('Bad request - validation failure');
            })
    });

    it('should, fail to return the users details given no headers', async() => {
        await endPoint.get('/user')
            .set({
                
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401)
    });

    it('should, fail to return the users details given null token', async () => {
        await endPoint.get('/user')
            .set({
                idToken: null,
                localId: badUsers[3].localId
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401)
    });

    it('should, fail to return the users details given an empty token', async () => {
        await endPoint.get('/user')
            .set({
                idToken: '',
                localId: badUsers[3].localId
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(401)
    });

    it('should, fail to create a user with an already registered email address', async () => {
        await endPoint.post('/user')
            .send({
                displayName: goodUsers[0].displayName,
                email: goodUsers[0].email,
                password: crypto.createHash('sha256').update(goodUsers[0].password).digest('hex')
            })
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
                expect(res.body.msg).toBe('Duplicate entry');
            })
    });

    it('should, logout the user given the user id', async () => {
        await endPoint.post('/user/logout')
            .set({
                idToken: badUsers[3].idToken,
                localId: badUsers[3].localId
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });

});

describe('Test the user update functionality', () => {

    it('should, login a valid user for further testing', async () => {
        await endPoint.post('/user/login')
            .send({
                email: goodUsers[0].email,
                password: crypto.createHash('sha256').update(goodUsers[0].password).digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(200);
                expect(res.body.user.displayName).toBe(goodUsers[0].displayName);
                expect(res.body.user.email).toBe(goodUsers[0].email);
                expect(res.body.user.idToken).toHaveLength(256);
                goodUsers[0].localId = res.body.user.localId;
                goodUsers[0].idToken = res.body.user.idToken;      
            })
    });

    it('should, fail to update the display name given a non valid display name', async () => {
        await endPoint.patch('/user/displayname')
            .set({
                localId: goodUsers[0].localId,
                idToken: goodUsers[0].idToken
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

    it('should, update the display name', async() => {
        await endPoint.patch('/user/displayname')
            .set({
                localId: goodUsers[0].localId,
                idToken: goodUsers[0].idToken
            })
            .send({
                displayName: 'Rand Al\'thore'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });

    it('should, fail to update the email adress given an invadid email address', async () => {
        await endPoint.patch('/user/email')
            .set({
                localId: goodUsers[0].localId,
                idToken: goodUsers[0].idToken
            })
            .send({
                email: 'rand.althorsystem.co.uk'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .then(res => {
                expect(res.body.status).toBe(400);
                expect(res.body.msg).toBe('Bad request - validation failure');
            })
    });

    it('should, update the email adress', async () => {
        await endPoint.patch('/user/email')
            .set({
                localId: goodUsers[0].localId,
                idToken: goodUsers[0].idToken
            })
            .send({
                email: 'rand.althor@system.co.uk'
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });

    it('should, fail to update the password given a non valid password', async () => {
        await endPoint.patch('/user/password')
            .set({
                localId: goodUsers[0].localId,
                idToken: goodUsers[0].idToken
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

    it('should, update the password', async () => {
        await endPoint.patch('/user/password')
            .set({
                localId: goodUsers[0].localId,
                idToken: goodUsers[0].idToken
            })
            .send({
                password: crypto.createHash('sha256').update('letmein1').digest('hex')
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

    it('should, logout the user given the user id', async () => {
        await endPoint.post('/user/logout')
            .set({
                idToken: goodUsers[0].idToken,
                localId: goodUsers[0].localId
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

    it('should, fail validation for a display name > 50 chars', async () => {
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
            })
    });

    it('should, fail validation for a display name > 50 chars and email missing @', async () => {
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
            })
    });

});

// auth token tests
describe('Authorise transaction tests', () => {

    it('should, return 404 for a non-existing', async () => {
        await endPoint.post('/approvetransaction')
            .set({
                idToken: wrongToken
            })
            .send({
                rules: {
                    roles: ['user'],
                    allowSameUser: true
                }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
    });

    it('should, return 400 for an empty string token', async () => {
        await endPoint.post('/approvetransaction')
            .set({
                idToken: ''
            })
            .send({
                rules: {
                    roles: ['user'],
                    allowSameUser: true
                }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
    });

    it('should, return 400 for no token', async () => {
        await endPoint.post('/approvetransaction')
            .set({
            
            })
            .send({
                rules: {
                    roles: ['user'],
                    allowSameUser: true
                }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
    });

    it('should, login a valid user for further testing', async () => {
        await endPoint.post('/user/login')
            .send({
                email: goodUsers[1].email,
                password: crypto.createHash('sha256').update(goodUsers[1].password).digest('hex')
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toBeDefined();
                expect(res.body.status).toBe(200);
                expect(res.body.user.displayName).toBe(goodUsers[1].displayName);
                expect(res.body.user.email).toBe(goodUsers[1].email);
                expect(res.body.user.idToken).toHaveLength(256);
                goodUsers[1].localId = res.body.user.localId;
                goodUsers[1].idToken = res.body.user.idToken;
            })
    });

    it('should, return 200 for a valid token', async () => {
        await endPoint.post('/approvetransaction')
            .set({
                idToken: goodUsers[1].idToken
            })
            .send({
                rules: {
                    roles: ['user'],
                    allowSameUser: true
                }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });

    it('should, return 403 for a valid token but no role permission', async () => {
        await endPoint.post('/approvetransaction')
            .set({
                idToken: goodUsers[1].idToken
            })
            .send({
                rules: {
                    roles: ['user', 'administrator']
                }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(403)
    });

    it('should, logout the user given the user id', async () => {
        await endPoint.post('/user/logout')
            .set({
                idToken: goodUsers[1].idToken,
                localId: goodUsers[1].localId
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    });

    it('should, return 404 for a logged out user', async () => {
        await endPoint.post('/approvetransaction')
            .set({
                idToken: goodUsers[1].idToken
            })
            .send({
                rules: {
                    roles: ['user'],
                    allowSameUser: true
                }
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
    });
});