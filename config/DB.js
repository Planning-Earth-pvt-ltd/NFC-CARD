require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST, // "mysql"
    port: process.env.DB_PORT, // 3306
    dialect: process.env.DB_DIALECT, // "mysql"
    dialectOptions: {
      connectTimeout: 10000
    },
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci'
    }
  }
);

module.exports = sequelize;

