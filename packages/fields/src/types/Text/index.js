import { Text, MongoTextInterface, KnexTextInterface, PrismaTextInterface } from './Implementation';
import { importView } from '@keystonejs/build-field-types';

export default {
  type: 'Text',
  implementation: Text,
  views: {
    Controller: importView('./views/Controller'),
    Field: importView('./views/Field'),
    Filter: importView('./views/Filter'),
  },
  adapters: {
    mongoose: MongoTextInterface,
    knex: KnexTextInterface,
    prisma: PrismaTextInterface,
  },
};
