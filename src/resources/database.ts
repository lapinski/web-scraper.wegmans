import 'reflect-metadata';
import { createConnection, Connection, BaseEntity, Repository, ObjectType } from 'typeorm';
import config from './config';
import * as path from 'path';

export async function getConnection(): Promise<Connection> {
  return createConnection({
    type: config.get('db.type'),
    url: config.get('db.url'),
    entities: [
      path.resolve(__dirname, '..', 'entities', '*.js'),
    ],
    synchronize: true,
    logging: true,
  });
}

export async function getRepository<Entity>(entity: ObjectType<Entity>): Promise<Repository<Entity>> {
  const connection = await getConnection();
  return connection.getRepository(entity);
}