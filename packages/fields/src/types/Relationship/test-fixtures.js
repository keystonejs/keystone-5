import { graphqlRequest } from '@keystonejs/test-utils';
import Text from '../Text';
import Relationship from './';

const fieldType = 'Relationship';
export { fieldType as name };
export { Relationship as type };

export const createLists = ({ keystone }) => {
  keystone.createList('Post', {
    fields: {
      title: { type: Text },
      author: { type: Relationship, ref: 'User', isRequired: true },
    },
  });

  keystone.createList('User', {
    fields: {
      name: { type: Text },
      posts: { type: Relationship, ref: 'Post', many: true },
    },
  });
};

export const isRequiredTests = withKeystone => {
  describe('to-single', () => {
    test(
      'nested create',
      withKeystone(({ keystone }) => {
        return graphqlRequest({
          keystone,
          query: `mutation {
            createPost(data: {
              title: "test entry",
              author: { create: { name: "Sam" } }
            } ) {
              id
              author {
                name
              }
            }
          }`,
        }).then(({ data, errors }) => {
          expect(errors).toBe(undefined);
          expect(data.createPost).toHaveProperty('author.name', 'Sam');
        });
      })
    );

    test.todo('nested create from non-required to required');

    test(
      'Create an object without the required field',
      withKeystone(({ keystone }) => {
        return graphqlRequest({
          keystone,
          query: `mutation {
            createPost(data: {
              title: "test entry",
            } ) {
              id
            }
          }`,
        }).then(({ errors }) => {
          expect(errors[0].message).toBe('You attempted to perform an invalid mutation');
          expect(errors[0].path[0]).toBe('createPost');
        });
      })
    );

    test.todo('Update with valid value');

    test(
      'Update to null is disallowed',
      withKeystone(({ keystone }) => {
        return graphqlRequest({
          keystone,
          query: `mutation {
            createPost(data: { title: "Hi", author: { create: { name: "Sam" } } } ) {
              id
            }
          }`,
        }).then(({ data }) => {
          return graphqlRequest({
            keystone,
            query: `mutation {
              updatePost(
                id: "${data.createPost.id}"
                data: {
                  title: "test entry",
                  author: null
                }
              ) {
                id
                author {
                  name
                }
              }
            }`,
          }).then(({ errors }) => {
            expect(errors[0].message).toBe('Nested mutation operation invalid for Post.author<User>');
            expect(errors[0].path[0]).toBe('updatePost');
          });
        });
      })
    );

    test.todo('Update with required field ommitted');
  });

  describe('to-many', () => {
    // This test fails because when the related Post is created, it doesn't yet
    // know about the User, so the isRequired check on Post.author fails.
    // 🐔+🥚
    test(
      'nested create',
      withKeystone(({ keystone }) => {
        return graphqlRequest({
          keystone,
          query: `mutation {
            createUser(data: {
              name: "Sam",
              posts: { create: [{ title: "Hello" }] }
            } ) {
              id
              posts {
                title
              }
            }
          }`,
        }).then(({ data, errors }) => {
          expect(errors).toBe(undefined);
          expect(data.createUser).toHaveProperty('posts.0.title', 'Hello');
        });
      })
    );
  });
};
