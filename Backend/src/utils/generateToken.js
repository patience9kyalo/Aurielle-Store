const jwt = require('jsonwebtoken')

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRETE, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    })
}

module.exports = generateToken