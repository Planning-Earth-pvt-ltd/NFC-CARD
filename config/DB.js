const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('nfc_cards', 'root', 'Root@123', {
  host: '80.65.208.109',
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