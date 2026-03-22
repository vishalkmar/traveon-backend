// require("dotenv").config();
// module.exports = {
//   "development": {
//     "username": process.env.DB_USERNAME || "root",
//     "password": process.env.DB_PASSWORD || "root",
//     "database": process.env.DB_DATABASE || "retreats_db",
//     "host": process.env.DB_HOST || "127.0.0.1",
//     "dialect": process.env.DB_DIALECT || "mysql",
//   },
//   "test": {
//     "username": process.env.DB_USERNAME || "root",
//     "password": process.env.DB_PASSWORD,
//     "database": process.env.DB_DATABASE || "retreats-db",
//     "host": process.env.DB_HOST || "127.0.0.1",
//     "dialect": process.env.DB_DIALECT || "mysql",
//   },
//   "production": {
//     "username": process.env.DB_USERNAME || "root",
//     "password": process.env.DB_PASSWORD,
//     "database": process.env.DB_DATABASE || "retreats-db",
//     "host": process.env.DB_HOST || "127.0.0.1",
//     "dialect": process.env.DB_DIALECT || "mysql",
//   }
// }
require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
     port: Number(process.env.DB_PORT || 3306),
    dialect: process.env.DB_DIALECT || "mysql",
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
     port: Number(process.env.DB_PORT || 3306),
    dialect: process.env.DB_DIALECT || "mysql",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
     port: Number(process.env.DB_PORT || 3306),
    dialect: process.env.DB_DIALECT || "mysql",
  },
};