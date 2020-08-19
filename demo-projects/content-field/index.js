//imports for Keystone app core
const { Keystone } = require('@keystonejs/keystone');
const { KnexAdapter } = require('@keystonejs/adapter-knex');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { Post } = require('./schema');

const keystone = new Keystone({
  adapter: new KnexAdapter({
    schemaName: process.env.PG_DB_SCHEMA_NAME,
    knexOptions: {
      client: 'postgres',
      connection: process.env.PG_DB_URI,
    },
  }),
});

keystone.createList('Post', Post);

const adminApp = new AdminUIApp({
  name: 'Keystone Content Demo',
});

module.exports = {
  keystone,
  apps: [new GraphQLApp(), adminApp],
  distDir: 'dist',
};
