const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for user authentication
 * @param {string} userId - The user's ID to be encoded in the token
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = generateToken;