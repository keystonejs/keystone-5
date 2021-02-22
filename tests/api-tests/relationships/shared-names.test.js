const { Text, Relationship } = require('@keystonejs/fields');
const { multiAdapterRunners, setupServer } = require('@keystonejs/test-utils');
const { createItems, updateItems } = require('@keystonejs/server-side-graphql-client');

const createInitialData = async keystone => {
  const roles = await createItems({
    keystone,
    listKey: 'Role',
    items: [{ data: { name: 'RoleA' } }, { data: { name: 'RoleB' } }, { data: { name: 'RoleC' } }],
    returnFields: 'id name',
  });
  const companies = await createItems({
    keystone,
    listKey: 'Company',
    items: [
      { data: { name: 'CompanyA' } },
      { data: { name: 'CompanyB' } },
      { data: { name: 'CompanyC' } },
    ],
    returnFields: 'id name',
  });
  const employees = await createItems({
    keystone,
    listKey: 'Employee',
    items: [
      {
        data: {
          name: 'EmployeeA',
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyA').id } },
          role: { connect: { id: roles.find(({ name }) => name === 'RoleA').id } },
        },
      },
      {
        data: {
          name: 'EmployeeB',
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyB').id } },
          role: { connect: { id: roles.find(({ name }) => name === 'RoleB').id } },
        },
      },
      {
        data: {
          name: 'EmployeeC',
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyC').id } },
          role: { connect: { id: roles.find(({ name }) => name === 'RoleC').id } },
        },
      },
    ],
    returnFields: 'id name',
  });
  await createItems({
    keystone,
    listKey: 'Location',
    items: [
      {
        data: {
          name: 'LocationA',
          employees: {
            connect: employees
              .filter(e => ['EmployeeA', 'EmployeeB'].includes(e.name))
              .map(e => ({ id: e.id })),
          },
        },
      },
      {
        data: {
          name: 'LocationB',
          employees: {
            connect: employees
              .filter(e => ['EmployeeB', 'EmployeeC'].includes(e.name))
              .map(e => ({ id: e.id })),
          },
        },
      },
      {
        data: {
          name: 'LocationC',
          employees: {
            connect: employees
              .filter(e => ['EmployeeC', 'EmployeeA'].includes(e.name))
              .map(e => ({ id: e.id })),
          },
        },
      },
    ],
    returnFields: 'id name',
  });
  await updateItems({
    keystone,
    listKey: 'Role',
    items: [
      {
        id: roles.find(({ name }) => name === 'RoleA').id,
        data: {
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyA').id } },
          employees: { connect: [{ id: employees.find(({ name }) => name === 'EmployeeA').id }] },
        },
      },
      {
        id: roles.find(({ name }) => name === 'RoleB').id,
        data: {
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyB').id } },
          employees: { connect: [{ id: employees.find(({ name }) => name === 'EmployeeB').id }] },
        },
      },
      {
        id: roles.find(({ name }) => name === 'RoleC').id,
        data: {
          company: { connect: { id: companies.find(({ name }) => name === 'CompanyC').id } },
          employees: { connect: [{ id: employees.find(({ name }) => name === 'EmployeeC').id }] },
        },
      },
    ],
  });
};

const setupKeystone = adapterName =>
  setupServer({
    adapterName,
    createLists: keystone => {
      keystone.createList('Employee', {
        fields: {
          name: { type: Text },
          company: { type: Relationship, ref: 'Company.employees', many: false },
          role: { type: Relationship, ref: 'Role', many: false },
        },
      });
      keystone.createList('Company', {
        fields: {
          name: { type: Text },
          employees: { type: Relationship, ref: 'Employee.company', many: true },
        },
      });
      keystone.createList('Role', {
        fields: {
          name: { type: Text },
          company: { type: Relationship, ref: 'Company', many: false },
          employees: { type: Relationship, ref: 'Employee', many: true },
        },
      });
      keystone.createList('Location', {
        fields: {
          name: { type: Text },
          employees: { type: Relationship, ref: 'Employee', many: true },
        },
      });
    },
  });

multiAdapterRunners().map(({ runner, adapterName }) =>
  describe(`Adapter: ${adapterName}`, () => {
    test(
      'Query',
      runner(setupKeystone, async ({ keystone }) => {
        await createInitialData(keystone);
        const { data, errors } = await keystone.executeGraphQL({
          query: `{
                  allEmployees(where: {
                    company: { employees_some: { role: { name: "RoleA" } } }
                  }) { id name }
                }`,
        });
        expect(errors).toBe(undefined);
        expect(data.allEmployees).toHaveLength(1);
        expect(data.allEmployees[0].name).toEqual('EmployeeA');
      })
    );
  })
);
