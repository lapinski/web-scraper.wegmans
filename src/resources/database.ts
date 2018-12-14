import {createConnection, Connection} from "typeorm";
import config from './config';

const connection = await createConnection({
  type: config.get('db.type'),
  url: config.get('db.url'),
});

export = connection;