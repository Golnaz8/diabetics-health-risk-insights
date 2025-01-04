const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.CLEARDB_DATABASE_URL) {
  // Heroku ClearDB MySQL connection
  sequelize = new Sequelize(process.env.CLEARDB_DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, 
      },
    },
  });
} else {
  // Local MySQL connection
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost', 
      dialect: 'mysql',
      port: process.env.DB_PORT || 3306, 
    }
  );
}

module.exports = sequelize;
