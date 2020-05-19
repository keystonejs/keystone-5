const { resolveAllKeys, mapKeys, omitBy, objMerge, arrayToObject } = require('@keystonejs/utils');
const { logger } = require('@keystonejs/logger');

const graphqlLogger = logger('graphql');
const keystoneLogger = logger('keystone');

const {
  LimitsExceededError,
  ValidationFailureError,
  throwAccessDenied,
} = require('./graphqlErrors');

const opToType = {
  read: 'query',
  create: 'mutation',
  update: 'mutation',
  delete: 'mutation',
};

const mapNativeTypeToKeystoneType = (type, listKey, fieldPath) => {
  const { Text, Checkbox, Float } = require('@keystonejs/fields');

  const nativeTypeMap = new Map([
    [
      Boolean,
      {
        name: 'Boolean',
        keystoneType: Checkbox,
      },
    ],
    [
      String,
      {
        name: 'String',
        keystoneType: Text,
      },
    ],
    [
      Number,
      {
        name: 'Number',
        keystoneType: Float,
      },
    ],
  ]);

  if (!nativeTypeMap.has(type)) {
    return type;
  }

  const { name, keystoneType } = nativeTypeMap.get(type);

  keystoneLogger.warn(
    { nativeType: type, keystoneType, listKey, fieldPath },
    `Mapped field ${listKey}.${fieldPath} from native JavaScript type '${name}', to '${keystoneType.type.type}' from the @keystonejs/fields package.`
  );

  return keystoneType;
};

module.exports = class BaseList {
  initFields() {
    if (this.fieldsInitialised) return;
    this.fieldsInitialised = true;

    let sanitisedFieldsConfig = mapKeys(this._fields, (fieldConfig, path) => ({
      ...fieldConfig,
      type: mapNativeTypeToKeystoneType(fieldConfig.type, this.key, path),
    }));

    // Add an 'id' field if none supplied
    if (!sanitisedFieldsConfig.id) {
      if (typeof this.adapter.parentAdapter.getDefaultPrimaryKeyConfig !== 'function') {
        throw `No 'id' field given for the '${this.key}' list and the list adapter ` +
          `in used (${this.adapter.key}) doesn't supply a default primary key config ` +
          `(no 'getDefaultPrimaryKeyConfig()' function)`;
      }
      // Rebuild the object so id is "first"
      sanitisedFieldsConfig = {
        id: this.adapter.parentAdapter.getDefaultPrimaryKeyConfig(),
        ...sanitisedFieldsConfig,
      };
    }

    // Helpful errors for misconfigured lists
    Object.entries(sanitisedFieldsConfig).forEach(([fieldKey, fieldConfig]) => {
      if (!this.isAuxList && fieldKey[0] === '_') {
        throw `Invalid field name "${fieldKey}". Field names cannot start with an underscore.`;
      }
      if (typeof fieldConfig.type === 'undefined') {
        throw `The '${this.key}.${fieldKey}' field doesn't specify a valid type. ` +
          `(${this.key}.${fieldKey}.type is undefined)`;
      }
      const adapters = fieldConfig.type.adapters;
      if (typeof adapters === 'undefined' || Object.entries(adapters).length === 0) {
        throw `The type given for the '${this.key}.${fieldKey}' field doesn't define any adapters.`;
      }
    });

    Object.values(sanitisedFieldsConfig).forEach(({ type }) => {
      if (!type.adapters[this.adapterName]) {
        throw `Adapter type "${this.adapterName}" does not support field type "${type.type}"`;
      }
    });

    this.fieldsByPath = mapKeys(
      sanitisedFieldsConfig,
      ({ type, ...fieldSpec }, path) =>
        new type.implementation(path, fieldSpec, {
          getListByKey: this.getListByKey,
          listKey: this.key,
          listAdapter: this.adapter,
          fieldAdapterClass: type.adapters[this.adapterName],
          defaultAccess: this.defaultAccess.field,
          createAuxList: this.createAuxList,
          schemaNames: this._schemaNames,
        })
    );
    this.fields = Object.values(this.fieldsByPath);
    this.views = mapKeys(sanitisedFieldsConfig, ({ type }, path) =>
      this.fieldsByPath[path].extendAdminViews({ ...type.views })
    );
  }

  getAdminMeta({ schemaName }) {
    const schemaAccess = this.access[schemaName];
    const {
      defaultPageSize,
      defaultColumns,
      defaultSort,
      maximumPageSize,
      ...adminConfig
    } = this.adminConfig;
    return {
      key: this.key,
      // Reduce to truthy values (functions can't be passed over the webpack
      // boundary)
      access: mapKeys(schemaAccess, val => !!val),
      label: this.adminUILabels.label,
      singular: this.adminUILabels.singular,
      plural: this.adminUILabels.plural,
      path: this.adminUILabels.path,
      gqlNames: this.gqlNames,
      fields: this.fields
        .filter(field => field.access[schemaName].read)
        .map(field => field.getAdminMeta({ schemaName })),
      adminDoc: this.adminDoc,
      adminConfig: {
        defaultPageSize,
        defaultColumns: defaultColumns.replace(/\s/g, ''), // remove all whitespace
        defaultSort: defaultSort,
        maximumPageSize: Math.max(defaultPageSize, maximumPageSize),
        ...adminConfig,
      },
    };
  }

  getFieldsWithAccess({ schemaName, access }) {
    return this.fields
      .filter(({ path }) => path !== 'id') // Exclude the id fields update types
      .filter(field => field.access[schemaName][access]); // If it's globally set to false, makes sense to never let it be updated
  }

  /** Equivalent to getFieldsWithAccess but includes `id` fields. */
  getAllFieldsWithAccess({ schemaName, access }) {
    return this.fields.filter(field => field.access[schemaName][access]);
  }

  getFieldsRelatedTo(listKey) {
    return this.fields.filter(
      ({ isRelationship, refListKey }) => isRelationship && refListKey === listKey
    );
  }

  // Wrap the "inner" resolver for a single output field with list-specific modifiers
  _wrapFieldResolver(field, innerResolver) {
    return async (item, args, context, info) => {
      // Check access
      const operation = 'read';
      const access = await context.getFieldAccessControlForUser(
        this.key,
        field.path,
        undefined,
        item,
        operation
      );
      if (!access) {
        // If the client handles errors correctly, it should be able to
        // receive partial data (for the fields the user has access to),
        // and then an `errors` array of AccessDeniedError's
        throwAccessDenied(opToType[operation], context, field.path, {
          itemId: item ? item.id : null,
        });
      }

      // Only static cache hints are supported at the field level until a use-case makes it clear what parameters a dynamic hint would take
      if (field.config.cacheHint && info && info.cacheControl) {
        info.cacheControl.setCacheHint(field.config.cacheHint);
      }

      // Execute the original/inner resolver
      return innerResolver(item, args, context, info);
    };
  }

  gqlFieldResolvers({ schemaName }) {
    const schemaAccess = this.access[schemaName];
    if (!schemaAccess.read) {
      return {};
    }
    const fieldResolvers = {
      // TODO: The `_label_` output field currently circumvents access control
      _label_: this.labelResolver,
      ...objMerge(
        this.fields
          .filter(field => field.access[schemaName].read)
          .map(field =>
            // Get the resolvers for the (possibly multiple) output fields and wrap each with list-specific modifiers
            mapKeys(field.gqlOutputFieldResolvers({ schemaName }), innerResolver =>
              this._wrapFieldResolver(field, innerResolver)
            )
          )
      ),
    };
    return { [this.gqlNames.outputTypeName]: fieldResolvers };
  }

  gqlAuxQueryResolvers() {
    // TODO: Obey the same ACL rules based on parent type
    return objMerge(this.fields.map(field => field.gqlAuxQueryResolvers()));
  }

  gqlAuxMutationResolvers() {
    // TODO: Obey the same ACL rules based on parent type
    return objMerge(this.fields.map(field => field.gqlAuxMutationResolvers()));
  }

  async itemQuery(
    // prettier-ignore
    { where: { id } },
    context,
    gqlName,
    info
  ) {
    const operation = 'read';
    graphqlLogger.debug({ id, operation, type: opToType[operation], gqlName }, 'Start query');

    const access = await this.checkListAccess(context, undefined, operation, {
      gqlName,
      itemId: id,
    });

    const result = await this.getAccessControlledItem(id, access, {
      context,
      operation,
      gqlName,
      info,
    });

    graphqlLogger.debug({ id, operation, type: opToType[operation], gqlName }, 'End query');
    return result;
  }

  async _itemsQuery(args, extra) {
    // This is private because it doesn't handle access control

    const { maxResults } = this.queryLimits;

    const throwLimitsExceeded = args => {
      throw new LimitsExceededError({
        data: {
          list: this.key,
          ...args,
        },
      });
    };

    // Need to enforce List-specific query limits
    const { first = Infinity } = args;
    // We want to help devs by failing fast and noisily if limits are violated.
    // Unfortunately, we can't always be sure of intent.
    // E.g., if the query has a "first: 10", is it bad if more results could come back?
    // Maybe yes, or maybe the dev is just paginating posts.
    // But we can be sure there's a problem in two cases:
    // * The query explicitly has a "first" that exceeds the limit
    // * The query has no "first", and has more results than the limit
    if (first < Infinity && first > maxResults) {
      throwLimitsExceeded({ type: 'maxResults', limit: maxResults });
    }
    if (!(extra && extra.meta)) {
      // "first" is designed to truncate the count value, but accurate counts are still
      // needed for pagination.  resultsLimit is meant for protecting KS memory usage,
      // not DB performance, anyway, so resultsLimit is only applied to queries that
      // could return many results.
      // + 1 to allow limit violation detection
      const resultsLimit = Math.min(maxResults + 1, first);
      if (resultsLimit < Infinity) {
        args.first = resultsLimit;
      }
    }
    const results = await this.adapter.itemsQuery(args, extra);
    if (results.length > maxResults) {
      throwLimitsExceeded({ type: 'maxResults', limit: maxResults });
    }
    if (extra && extra.context) {
      const context = extra.context;
      context.totalResults += results.length;
      if (context.totalResults > context.maxTotalResults) {
        throwLimitsExceeded({ type: 'maxTotalResults', limit: context.maxTotalResults });
      }
    }

    if (extra && extra.info && extra.info.cacheControl) {
      switch (typeof this.cacheHint) {
        case 'object':
          extra.info.cacheControl.setCacheHint(this.cacheHint);
          break;

        case 'function':
          const operationName = extra.info.operation.name && extra.info.operation.name.value;
          extra.info.cacheControl.setCacheHint(
            this.cacheHint({ results, operationName, meta: !!extra.meta })
          );
          break;

        case 'undefined':
          break;
      }
    }

    return results;
  }

  _throwValidationFailure(errors, operation, data = {}) {
    throw new ValidationFailureError({
      data: {
        messages: errors.map(e => e.msg),
        errors: errors.map(e => e.data),
        listKey: this.key,
        operation,
      },
      internalData: {
        errors: errors.map(e => e.internalData),
        data,
      },
    });
  }

  _mapToFields(fields, action) {
    return resolveAllKeys(arrayToObject(fields, 'path', action)).catch(error => {
      if (!error.errors) {
        throw error;
      }
      const errorCopy = new Error(error.message || error.toString());
      errorCopy.errors = Object.values(error.errors);
      throw errorCopy;
    });
  }

  _fieldsFromObject(obj) {
    return Object.keys(obj)
      .map(fieldPath => this.fieldsByPath[fieldPath])
      .filter(field => field);
  }

  async _resolveRelationship(data, existingItem, context, getItem, mutationState) {
    const fields = this._fieldsFromObject(data).filter(field => field.isRelationship);
    const resolvedRelationships = await this._mapToFields(fields, async field => {
      const { create, connect, disconnect, currentValue } = await field.resolveNestedOperations(
        data[field.path],
        existingItem,
        context,
        getItem,
        mutationState
      );
      // This code codifies the order of operations for nested mutations:
      // 1. disconnectAll
      // 2. disconnect
      // 3. create
      // 4. connect
      if (field.many) {
        return [
          ...currentValue.filter(id => !disconnect.includes(id)),
          ...connect,
          ...create,
        ].filter(id => !!id);
      } else {
        return create && create[0]
          ? create[0]
          : connect && connect[0]
          ? connect[0]
          : disconnect && disconnect[0]
          ? null
          : currentValue;
      }
    });

    return {
      ...data,
      ...resolvedRelationships,
    };
  }

  async _resolveInput(resolvedData, existingItem, context, operation, originalInput) {
    const args = {
      resolvedData,
      existingItem,
      context,
      originalInput,
      actions: mapKeys(this.hooksActions, hook => hook(context)),
      operation,
    };

    // First we run the field type hooks
    // NOTE: resolveInput is run on _every_ field, regardless if it has a value
    // passed in or not
    resolvedData = await this._mapToFields(this.fields, field => field.resolveInput(args));

    // We then filter out the `undefined` results (they should return `null` or
    // a value)
    resolvedData = omitBy(resolvedData, key => typeof resolvedData[key] === 'undefined');

    // Run the schema-level field hooks, passing in the results from the field
    // type hooks
    resolvedData = {
      ...resolvedData,
      ...(await this._mapToFields(
        this.fields.filter(field => field.hooks.resolveInput),
        field => field.hooks.resolveInput({ ...args, resolvedData })
      )),
    };

    // And filter out the `undefined`s again.
    resolvedData = omitBy(resolvedData, key => typeof resolvedData[key] === 'undefined');

    if (this.hooks.resolveInput) {
      // And run any list-level hook
      resolvedData = await this.hooks.resolveInput({ ...args, resolvedData });
      if (typeof resolvedData !== 'object') {
        throw new Error(
          `Expected ${
            this.key
          }.hooks.resolveInput() to return an object, but got a ${typeof resolvedData}: ${resolvedData}`
        );
      }
    }

    // Finally returning the amalgamated result of all the hooks.
    return resolvedData;
  }

  async _validateInput(resolvedData, existingItem, context, operation, originalInput) {
    const args = {
      resolvedData,
      existingItem,
      context,
      originalInput,
      actions: mapKeys(this.hooksActions, hook => hook(context)),
      operation,
    };
    // Check for isRequired
    const fieldValidationErrors = this.fields
      .filter(
        field =>
          field.isRequired &&
          !field.isRelationship &&
          ((operation === 'create' &&
            (resolvedData[field.path] === undefined || resolvedData[field.path] === null)) ||
            (operation === 'update' &&
              Object.prototype.hasOwnProperty.call(resolvedData, field.path) &&
              (resolvedData[field.path] === undefined || resolvedData[field.path] === null)))
      )
      .map(f => ({
        msg: `Required field "${f.path}" is null or undefined.`,
        data: { resolvedData, operation, originalInput },
        internalData: {},
      }));
    if (fieldValidationErrors.length) {
      this._throwValidationFailure(fieldValidationErrors, operation, originalInput);
    }

    const fields = this._fieldsFromObject(resolvedData);
    await this._validateHook(args, fields, operation, 'validateInput');
  }

  async _validateHook(args, fields, operation, hookName) {
    const { originalInput } = args;
    const fieldValidationErrors = [];
    // FIXME: Can we do this in a way where we simply return validation errors instead?
    args.addFieldValidationError = (msg, _data = {}, internalData = {}) =>
      fieldValidationErrors.push({ msg, data: _data, internalData });
    await this._mapToFields(fields, field => field[hookName](args));
    await this._mapToFields(
      fields.filter(field => field.hooks[hookName]),
      field => field.hooks[hookName](args)
    );
    if (fieldValidationErrors.length) {
      this._throwValidationFailure(fieldValidationErrors, operation, originalInput);
    }

    if (this.hooks[hookName]) {
      const listValidationErrors = [];
      await this.hooks[hookName]({
        ...args,
        addValidationError: (msg, _data = {}, internalData = {}) =>
          listValidationErrors.push({ msg, data: _data, internalData }),
      });
      if (listValidationErrors.length) {
        this._throwValidationFailure(listValidationErrors, operation, originalInput);
      }
    }
  }

  async _beforeChange(resolvedData, existingItem, context, operation, originalInput) {
    const args = {
      resolvedData,
      existingItem,
      context,
      originalInput,
      actions: mapKeys(this.hooksActions, hook => hook(context)),
      operation,
    };
    await this._runHook(args, resolvedData, 'beforeChange');
  }

  async _afterChange(updatedItem, existingItem, context, operation, originalInput) {
    const args = {
      updatedItem,
      originalInput,
      existingItem,
      context,
      actions: mapKeys(this.hooksActions, hook => hook(context)),
      operation,
    };
    await this._runHook(args, updatedItem, 'afterChange');
  }

  // Used to apply hooks that only produce side effects
  async _runHook(args, fieldObject, hookName) {
    const fields = this._fieldsFromObject(fieldObject);
    await this._mapToFields(fields, field => field[hookName](args));
    await this._mapToFields(
      fields.filter(field => field.hooks[hookName]),
      field => field.hooks[hookName](args)
    );

    if (this.hooks[hookName]) await this.hooks[hookName](args);
  }

  async _nestedMutation(mutationState, context, mutation) {
    // Set up a fresh mutation state if we're the root mutation
    const isRootMutation = !mutationState;
    if (isRootMutation) {
      mutationState = {
        afterChangeStack: [], // post-hook stack
        transaction: {}, // transaction
      };
    }

    // Perform the mutation
    const { result, afterHook } = await mutation(mutationState);

    // Push after-hook onto the stack and resolve all if we're the root.
    const { afterChangeStack } = mutationState;
    afterChangeStack.push(afterHook);
    if (isRootMutation) {
      // TODO: Close transaction

      // Execute post-hook stack
      while (afterChangeStack.length) {
        await afterChangeStack.pop()();
      }
    }

    // Return the result of the mutation
    return result;
  }

  async updateMutation(id, data, context, mutationState) {
    const operation = 'update';
    const gqlName = this.gqlNames.updateMutationName;
    const extraData = { gqlName, itemId: id };

    const access = await this.checkListAccess(context, data, operation, extraData);

    const existingItem = await this.getAccessControlledItem(id, access, {
      context,
      operation,
      gqlName,
    });

    const itemsToUpdate = [{ existingItem, data }];

    await this.checkFieldAccess(operation, itemsToUpdate, context, extraData);

    return await this._updateSingle(id, data, existingItem, context, mutationState);
  }

  async _updateSingle(id, data, existingItem, context, mutationState) {
    const operation = 'update';
    return await this._nestedMutation(mutationState, context, async mutationState => {
      let resolvedData = await this._resolveRelationship(
        data,
        existingItem,
        context,
        undefined,
        mutationState
      );

      resolvedData = await this._resolveInput(resolvedData, existingItem, context, operation, data);

      await this._validateInput(resolvedData, existingItem, context, operation, data);

      await this._beforeChange(resolvedData, existingItem, context, operation, data);

      const newItem = await this.adapter.update(id, resolvedData);

      return {
        result: newItem,
        afterHook: () => this._afterChange(newItem, existingItem, context, operation, data),
      };
    });
  }

  getFieldByPath(path) {
    return this.fieldsByPath[path];
  }
  getPrimaryKey() {
    return this.fieldsByPath['id'];
  }
};
