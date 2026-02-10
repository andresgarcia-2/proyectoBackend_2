import bcrypt from 'bcrypt';

/**
@param {string} password 
@returns {string} 
*/
export const createHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

/**
@param {string} password
@param {string} hashedPassword
@returns {boolean}
*/

export const isValidPassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
};