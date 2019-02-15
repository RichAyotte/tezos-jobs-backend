/**
 * @overview    eslint config
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @license     MIT
 */

'use strict'

const path = require('path')
const {printSchema} = require('graphql')

global.appRoot = path.resolve(__dirname)
const schema = require(`${appRoot}/schema.js`)

module.exports = {
	env: {
		browser: false
		, node: true
	}
	, extends: ['ayotte']
	, 'plugins': [
		'graphql'
	]
	, globals: {
		appRoot: false
	}
	, 'rules': {
		'graphql/template-strings': ['error', {
			env: 'apollo'
			, schemaString: printSchema(schema)
			, tagName: 'gql'
		}]
		// Sequelize datatypes are all uppercase.
		, 'new-cap': ['error', {'capIsNewExceptions': [
			'ARRAY'
			, 'BIGINT'
			, 'BLOB'
			, 'BOOLEAN'
			, 'CHAR'
			, 'DATE'
			, 'DATEONLY'
			, 'DECIMAL'
			, 'DOUBLE'
			, 'ENUM'
			, 'FLOAT'
			, 'GEOMETRY'
			, 'INTEGER'
			, 'JSON'
			, 'JSONB'
			, 'RANGE'
			, 'REAL'
			, 'STRING'
			, 'TEXT'
			, 'UUID'
		]}]
	}
}
