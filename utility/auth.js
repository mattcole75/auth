const crypto = require('crypto');

const genHash = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex');
};

const genToken = () => {
    return crypto.randomBytes(128).toString('hex');
};

module.exports = {
    genHash: genHash,
    genToken: genToken
}