import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Encrypt/Hash a plaintext password
 * @param {string} plainText - raw password
 * @returns {Promise<string>} bcrypt hashed password
 */

export async function Encrypt(plainText) {
  if (!plainText) throw new Error("No string provided");
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainText, salt);
}

/**
 * Compare a plaintext password with a stored hash
 * @param {string} plainText - user input password
 * @param {string} hash - stored hash from DB
 * @returns {Promise<boolean>} match result
 */


export async function Compare(plainText, hash) {
  if (!plainText || !hash) return false;
  return bcrypt.compare(plainText, hash);
}
