require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: path.join(__dirname, 'data', 'masterr2.sqlite3'),
    },
    useNullAsDefault: true,
    migrations: { directory: './migrations' },
    seeds: { directory: './seeds' },
  },
  test: {
    client: 'better-sqlite3',
    connection: {
      filename: path.join(__dirname, 'data', 'masterr2_test.sqlite3'),
    },
    useNullAsDefault: true,
    migrations: { directory: './migrations' },
    seeds: { directory: './seeds' },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    migrations: { directory: './migrations' },
    seeds: { directory: './seeds' },
  },
};
