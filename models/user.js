const pool = require('../config/db');

async function createUser(username, name, email, password) {
  const query = `
    INSERT INTO users (username, name, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, name, email
  `;
  const values = [username, name, email, password];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function findUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

async function findUserByUsername(username) {
  const query = `SELECT * FROM users WHERE username = $1`;
  const result = await pool.query(query, [username]);
  return result.rows[0];
}

async function findUserByIdentifier(identifier) {
  const query = `
    SELECT * FROM users
    WHERE email = $1 OR username = $1
  `;
  const result = await pool.query(query, [identifier]);
  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserByIdentifier,
};
