/**
 * @overview    Create GraphQL Schema from a complete Sequelize model
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-12 16:10:41
 * @license     MIT License
 */

'use strict'

const {
	get
	, forEach
	, isEmpty
	, transform
} = require('lodash')
const {
	GraphQLInputObjectType
	, GraphQLList
	, GraphQLObjectType
	, GraphQLSchema
} = require('graphql')
const {
	attributeFields
	, defaultArgs
	, defaultListArgs
	, resolver: resolverMaker
} = require('graphql-sequelize')

const models = require(`${appRoot}/models`)

/* eslint-disable-next-line max-params */
const beforeResolve = (options = {}, args, context, info) => {
	// If args contains a where, break up the where to include
	// the tables dependant on the conditions.
	if (options.where) {
		options.include = options.include || []
		forEach(options.where, (value, key) => {
			const i = key.indexOf('.')
			if (i !== -1) {
				const includeTable = key.substr(0, i)
				const field = key.substr(i + 1)
				const where = {}
				where[field] = value
				options.include.push({
					model: models.sequelize.models[includeTable]
					, required: true
					, where
				})
				delete options.where[key]
			}
		})
	}

	options.meta = {
		context
		, tableAlias: get(info, 'fieldName')
	}

	return options
}

const objToFirst = o => {
	const [firstArgsKey] = Object.keys(o)
	return o[firstArgsKey]
}

const mutationResolverMaker = (m, options) => {
	return (mutationOptions, args, context) => {
		const newOptions = mutationOptions || {}
		if (typeof options.before === 'function') {
			options.before(newOptions, args, context)
		}
		return m.create(objToFirst(args), newOptions.meta)
	}
}

/**
 * Add fields that are associated to the model
 * @param  {object} options.associations [description]
 * @param  {object} options.types        [description]
 * @return {object} GraphQL fields
 */
const associationsToFields = ({associations, types}) => {
	if (isEmpty(associations)) {
		return {}
	}

	return transform(associations, (result, association, modelName) => {
		const typeToDefaultArgs = t => {
			if (t instanceof GraphQLList) {
				return defaultListArgs(association.target)
			}
			if (t instanceof GraphQLObjectType) {
				return defaultArgs(association.target)
			}
			throw new Error(`Unknown GraphQL Type ${t}. Can't set default args.`)
		}

		const associationTypeToType = at => {
			if (at === 'BelongsTo'
			|| at === 'HasOne'
			) {
				return types[association.target.options.name.singular]
			}
			return types[association.target.options.name.plural]
		}

		result[modelName] = {
			args: typeToDefaultArgs(types[association.target.name])
			, resolve: resolverMaker(association, {
				before: beforeResolve
				, dataLoader: false
			})
			, type: associationTypeToType(association.associationType)
		}
	}, {})
}

/**
 * Define GraphQL fields
 * @param  {object} model.sequelize.models Models
 * @param  {object} (result, m, modelName) Memo, model and model name
 * @return {object} GraphQL fields
 */
const {mutationFields, queryFields} = transform(
	models.sequelize.models, (result, m) => {
		const enumTypeCache = {}
		const pluralName = m.options.name.plural
		const singularName = m.options.name.singular

		if (pluralName === singularName) {
			throw new Error('Plural and singular table names must be different.', pluralName)
		}

		result.types[singularName] = new GraphQLObjectType({
			args: defaultArgs(m)
			, description: singularName
			, fields: () => ({
				...associationsToFields({
					associations: m.associations
					, types: result.types
				})
				, ...attributeFields(m, {
					cache: enumTypeCache
				})
			})
			, name: singularName
		})

		result.types[`${singularName}Input`] = new GraphQLInputObjectType({
			args: defaultArgs(m)
			, description: `${singularName}`
			, fields: () => ({
				...attributeFields(m, {
					allowNull: true
					, cache: enumTypeCache
				})
			})
			, name: `${singularName}Input`
		})

		result.queryFields[singularName] = {
			args: defaultArgs(m)
			, resolve: resolverMaker(m, {
				before: beforeResolve
				, dataLoader: false
			})
			, type: result.types[singularName]
		}

		result.mutationFields[`Create${singularName}`] = {
			args: {
				[`${singularName}Input`]: {
					type: result.types[`${singularName}Input`]
				}
			}
			, description: `Create ${singularName}`
			, resolve: mutationResolverMaker(m, {
				before: beforeResolve
				, dataLoader: false
			})
			, type: result.types[singularName]
		}

		result.types[pluralName] = new GraphQLList(result.types[singularName])

		result.queryFields[pluralName] = {
			args: defaultListArgs(m)
			, resolve: resolverMaker(m, {
				before: beforeResolve
				, dataLoader: false
			})
			, type: result.types[pluralName]
		}
	}
	, {
		mutationFields: {}
		, queryFields: {}
		, types: {}
	}
)

module.exports = new GraphQLSchema({
	query: new GraphQLObjectType({
		description: 'Root query object'
		, fields: queryFields
		, name: 'RootQueryType'
	})
	, mutation: new GraphQLObjectType({
		description: 'Root mutation object'
		, fields: mutationFields
		, name: 'RootMutationType'
	})
})
