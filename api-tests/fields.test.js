//const globby = require('globby');
const path = require('path');
const cuid = require('cuid');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');

// `mongodb-memory-server` downloads a binary on first run in CI, which can take
// a while, so we bump up the timeout here.
jest.setTimeout(60000);

describe('Fields', () => {
  //const testModules = globby.sync(`packages/fields/src/types/**/test-fixtures.js`, {
  //  absolute: true,
  //});
  //testModules.push(path.resolve('packages/fields/tests/test-fixtures.js'));

  const testModules = [path.resolve('packages/fields/src/types/Relationship/test-fixtures.js')];

  multiAdapterRunners().map(({ runner, adapterName }) =>
    describe(`${adapterName} adapter`, () => {
      testModules.map(require).forEach(mod => {
        const keystoneTestWrapper = (testFn = () => {}) =>
          runner(
            () =>
              setupServer({
                name: `Field tests for ${mod.name} ${cuid()}`,
                adapterName,
                createLists: keystone => mod.createLists({ keystone }),
              }),
            async args => testFn({ adapterName, ...args })
          );

        describe(`${mod.name} field`, () => {
          if (mod.crudTests) {
            describe(`CRUD operations`, () => {
              mod.crudTests(keystoneTestWrapper);
            });
          } else {
            test.todo('CRUD operations - tests missing');
          }

          if (mod.isRequiredTests) {
            describe(`isRequired`, () => {
              mod.isRequiredTests(keystoneTestWrapper);
            });
          } else {
            test.todo('isRequired - tests missing');
          }

          if (mod.filterTests) {
            describe(`Filtering`, () => {
              mod.filterTests(keystoneTestWrapper);
            });
          } else {
            test.todo('Filtering - tests missing');
          }
        });
      });
    })
  );
});
