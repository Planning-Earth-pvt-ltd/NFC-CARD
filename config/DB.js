const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('nfc_cards', 'root', 'taran@123', {
  host: 'localhost',
  dialect: 'mysql',

  dialectOptions: {
    connectTimeout: 10000  // ✅ Valid alternative to acquireTimeout
  },
  define: {
    charset: 'utf8',
    collate: 'utf8_general_ci'
  }
});
module.exports = sequelize;