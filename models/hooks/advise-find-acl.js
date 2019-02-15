/**
 * @overview    Global beforeFind hook - Assure that it's running in the right
 *              context.
 * @author      Richard Ayotte
 * @copyright   Copyright © 2017 Richard Ayotte
 * @date        2017-06-08 13:40:36
 * @license     GNU GPL-3.0
 */

'use strict'

const {
	compact
	, get
	, intersection
	, map
	, transform
	, union
} = require('lodash')

const Sequelize = require('sequelize')
const {parse} = require('graphql/language/parser')
const log = require(`${appRoot}/lib/log`)

/**
 * selectionsToAttributesArray
 * @param  {[type]} options.selections [description]
 * @param  {[type]} options.result     [description]
 * @return {[type]}                    [description]
 */
const selectionsToAttributesArray = ({selections, result}) => {
	const attributes = map(selections, i => {
		if (i.selectionSet) {
			result[i.name.value] = selectionsToAttributesArray({
				selections: i.selectionSet.selections
				, result
			})
		}
		else if (i.name.value && i.name.value !== '__typename') {
			return i.name.value
		}
	})
	return compact(attributes)
}

/**
 * gqlAstToGqlQuery transformation
 * @param  {[type]} gqlAst [description]
 * @return {[type]}        [description]
 */
const gqlAstToGqlQuery = gqlAst => {
	const {selections} = gqlAst.selectionSet
	return transform(
		selections
		, (result, item) => {
			if (item.selectionSet) {
				result[item.name.value] = selectionsToAttributesArray({
					selections: item.selectionSet.selections
					, result
				})
			}
		}
		, {}
	)
}

/**
 * Return scoped conditions
 * @param  {[type]} options.options        [description]
 * @param  {[type]} options.readPermission [description]
 * @return {[type]}                        [description]
 */
const getScope = ({options, readPermission}) => {
	const attributes = []
	const include = []
	const where = []

	if (typeof readPermission === 'function') {
		const p = readPermission(options)
		attributes.push(...p.attributes)
		include.push(...p.include)
		where.push(p.where)
	}

	if (readPermission === true) {
		where.push(Sequelize.literal(`TRUE`))
		attributes.push(...options.attributes)
	}
	else {
		where.push(Sequelize.literal(`FALSE`))
	}

	return {
		attributes
		, include
		, where
	}
}

/**
 * getKeyAttributeNames
 * @param  {[String]} options.primaryKeyNames key attribute names
 * @param  {[Object]} options.attributes           sequelize attributes object
 * @return {[String]}                              array of attribute names
 */
const getKeyAttributeNames = ({primaryKeyNames, attributes}) => {
	const attributeNames = transform(attributes, (keys, value, key) => {
		if (value.references) {
			keys.push(key)
		}
	}, [])

	return union(
		primaryKeyNames
		, attributeNames
	)
}

/**
 * [description]
 * @param  {[type]} options.options      [description]
 * @param  {[type]} options.requestQuery [description]
 * @return {[type]}                      [description]
 */
const getGqlAttributes = ({options, requestQuery}) => {
	const [gqlAst] = parse(requestQuery).definitions
	const gqlQuery = gqlAstToGqlQuery(gqlAst)
	const tableAlias = get(options, 'meta.tableAlias')
	return gqlQuery[tableAlias] || []
}

/**
 * [description]
 * @param  {[type]} options.options [description]
 * @param  {[type]} options.context [description]
 * @return {[type]}                 [description]
 */
const getReadPermission = ({options, context}) => {
	const user = get(options, 'meta.context.state.user')
	const role = get(user, 'role', 'public')
	return get(context, `permissions.${role}.read`)
}

/**
 * Restrict queried data to the user's role
 * @param  {Object} options incoming options
 * @return {Object}         transformed options
 */
module.exports = function adviseFindAcl({args, proceed}) {
	const [options] = args

	if (!options) {
		throw new Error(`Options missing from query.`)
	}

	if (!this.permissions) {
		log.warn(`Permissions for ${this.name} undefined.`)
		throw new Error(`Permissions for ${this.name} are not defined. Access Denied.`)
	}

	// Enforce a limit of 500 rows and log when it's exceeded.
	const maxResults = 500
	if (!options.limit || options.limit > maxResults) {
		options.limit = maxResults
		log.warn(`SQL limit clause missing or exceepds ${options.limit}. ∴ Forcing to ${options.limit}.`)
	}

	const scope = getScope({
		options
		, readPermission: getReadPermission({
			options
			, context: this
		})
	})

	/**
	 * Include all attributes that are either primary or foreign keys.
	 * @type {[type]}
	 */
	const keyAttributes = getKeyAttributeNames({
		primaryKeyNames: this.primaryKeyAttributes
		, attributes: this.attributes
	})


	/**
	 * Restrict attributes to scope but include requested and all keys
	 * @type {[type]}
	 */
	const requestQuery = get(options, 'meta.context.req.body.query')
	if (!requestQuery) {
		throw new Error(`Has the koa-bodyparser middleware been installed and used before koa-graphql?`)
	}

	options.attributes = union(
		keyAttributes
		, intersection(
			getGqlAttributes({
				options
				, requestQuery
			})
			, scope.attributes
		)
	)

	/**
	 * Split the where object into two and-ed branches, the query and the or-ed
	 * scopes. This idea is important because it blocks all data leaks by
	 * default. Access must be explicitly given.
	 * @type {Object}
	 */
	options.where = {
		[Sequelize.Op.and]: {
			...options.where
			, [Sequelize.Op.or]: scope.where
		}
	}

	// Restrict scope the permission's inner joins.
	options.include = options.include || []
	options.include.push(...scope.include)
	return proceed(options)
}
