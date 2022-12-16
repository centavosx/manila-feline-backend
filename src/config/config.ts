import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export const Config = (entities: EntityClassOrSchema[]) =>
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'test',
    entities: entities,
    synchronize: true,
    migrations: ['src/migration/**/*.ts'],
    migrationsRun: true,
  });
