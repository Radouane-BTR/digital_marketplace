import path  from 'path';
const moduleAlias = require('module-alias');

moduleAlias.addAlias('migrations', __dirname);
moduleAlias.addAlias('shared', path.resolve(__dirname, '../shared'));
moduleAlias.addAlias('back-end', path.resolve(__dirname, '../back-end'));
moduleAlias();
import { DB_MIGRATIONS_TABLE_NAME, POSTGRES_URL } from 'back-end/config';


module.exports = {
  client: 'pg',
  connection: POSTGRES_URL,
  migrations: {
    tableName: DB_MIGRATIONS_TABLE_NAME,
    directory: './tasks'
  }
};
