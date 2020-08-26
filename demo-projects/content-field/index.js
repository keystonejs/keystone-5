//imports for Keystone app core
const { Keystone } = require('@keystonejs/keystone');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { Post } = require('./schema');

const keystone = new Keystone({
  adapter: new MongooseAdapter({ mongoUri: 'mongodb://localhost/todo' }),
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
