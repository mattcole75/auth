const { ObjectId } = require('mongodb');

const postUserRules = {
    displayName: value => value.length > 0 && value.length <= 50,
    email: value => /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(value),
    password: value => value.length === 64
}

const postLoginRules = {
    email: value => /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(value),
    password: value => value.length === 64
}

const getUserRules = {
    localid: value => ObjectId.isValid(value),
    idtoken: value => value.length === 256
}

const postLogoutRules = {
    localid: value => ObjectId.isValid(value),
    idtoken: value => value.length === 256
}

const getTokenRules = {
    localid: value => ObjectId.isValid(value),
    idtoken: value => value.length === 256
}

const patchUserDisplayNameRules = {
    displayName: value => value.length > 0 && value.length <= 50
}

const patchUserEmailRules = {
    email: value => /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(value),
}

const patchUserPasswordRules = {
    password: value => value.length === 64
}

const patchUserRoleRules = {
    localId: value => ObjectId.isValid(value),
    idToken: value => value.length === 256,
    role: value => value.constructor === Array
}

const testTokenRules = {
    idtoken: value => value.length === 256
}

module.exports = {
    postUserRules: postUserRules,
    postLoginRules: postLoginRules,
    postLogoutRules: postLogoutRules,
    getUserRules: getUserRules,
    getTokenRules: getTokenRules,
    patchUserDisplayNameRules: patchUserDisplayNameRules,
    patchUserEmailRules: patchUserEmailRules,
    patchUserPasswordRules: patchUserPasswordRules,
    patchUserRoleRules: patchUserRoleRules,
    testTokenRules: testTokenRules
}