/**
 * @overview    Create Sequelize model
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-12 11:59:24
 * @license     MIT License
 */

'use strict'

const path = require('path')
const {readdirSync, statSync} = require('fs')

const config = require('config')
const meld = require('meld')
const Sequelize = require('sequelize')

const log = require(`${appRoot}/lib/log`)
const dbConfig = config.get('db')
const adviseCreateAcl = require(`${appRoot}/models/hooks/advise-create-acl`)
const adviseFindAcl = require(`${appRoot}/models/hooks/advise-find-acl`)
// const adviseFindDataloader = require(`${appRoot}/models/hooks/advise-find-dataloader`)

const sequelize = new Sequelize(
	dbConfig.name
	, dbConfig.username
	, dbConfig.password
	, {
		define: {
			...dbConfig.options.define
		}
		, dialect: dbConfig.options.dialect
		, dialectOptions: dbConfig.options.dialectOptions
		, host: dbConfig.options.host
		, logging: dbConfig.options.logging
		, operatorsAliases: false
		, timezone: dbConfig.options.timezone
	}
)

const model = {
	sequelize
	, Sequelize
}

/**
 * I'm explicitly using readdirSync here because returning a promise complicates
 * the rest of the code. Modules that return promises need to be wrapped into a
 * function after the module resolves which eliminates much of the module
 * simplicity.
 */
readdirSync(__dirname)
.filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
.filter(file => statSync(path.join(__dirname, file)).isFile())
.forEach(file => {
	sequelize.import(path.join(__dirname, file))
})

Object
.keys(sequelize.models)
.forEach(modelName => {
	const m = sequelize.models[modelName]
	if (typeof m.associate === 'function') {
		m.associate(sequelize.models)
	}

	// Permissions
	try {
		// eslint-disable-next-line global-require
		m.permissions = require(path.join(__dirname, 'permissions', modelName))(sequelize.models)
	}
	catch (error) {
		log.warn(`Error reading ${modelName} permissions file`)
	}

	// Avice for Dataloader must run last it's the first one to be advised.
	// meld.around(m, 'findAll', adviseFindDataloader)

	// Order for the following advise does not matter.
	meld.around(m, 'create', adviseCreateAcl)
	meld.around(m, 'findAll', adviseFindAcl)
})

module.exports = model
