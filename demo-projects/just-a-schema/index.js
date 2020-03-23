const { Keystone } = require('@keystonejs/keystone');
const { KnexAdapter } = require('@keystonejs/adapter-knex');
const { Relationship, Text } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { StaticApp } = require('@keystonejs/app-static');

const keystone = new Keystone({
  name: 'Keystone Relationships',
  adapter: new KnexAdapter({ dropDatabase: true }),
});

keystone.createList('Left', {
  fields: {
    manyToMany: { type: Relationship, ref: 'Right.manyToMany', many: true },
    manyToManyNoRef: { type: Relationship, ref: 'Right', many: true },
    oneToMany: { type: Relationship, ref: 'Right.oneToMany', many: false },
    oneToOne: { type: Relationship, ref: 'Right.oneToOne', many: false },
    oneToOneNoRef: { type: Relationship, ref: 'Right', many: false },
  },
});

keystone.createList('Right', {
  fields: {
    manyToMany: { type: Relationship, ref: 'Left.manyToMany', many: true },
    oneToMany: { type: Relationship, ref: 'Left.oneToMany', many: true },
    oneToOne: { type: Relationship, ref: 'Left.oneToOne', many: false },
  },
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: '/', src: 'public' }),
    // Setup the optional Admin UI
    new AdminUIApp({ enableDefaultRoute: true }),
  ],
};
