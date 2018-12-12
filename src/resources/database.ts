import Sequelize from 'sequelize';
import config from './config';

// @ts-ignore
module.exports = new Sequelize(config.database.connectionString, {
  operatorsAliases: false,
});
