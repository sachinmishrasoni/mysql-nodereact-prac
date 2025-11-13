import bcrypt from "bcryptjs";

/**
 * Hash a plain password
 * @param {string} password
 * @returns {Promise<string>} hashed password
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); // industry standard: 10–12
    return await bcrypt.hash(password, salt);
};

/**
 * Compare plain password with hashed password
 * @param {string} plain
 * @param {string} hashed
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (plain, hashed) => {
    return await bcrypt.compare(plain, hashed);
};
