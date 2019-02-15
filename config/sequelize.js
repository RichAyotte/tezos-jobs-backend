/**
 * @overview    Sequelize config
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-13 10:17:39
 * @license     MIT License
 */

'use strict'

const dbConfig = require('config').get('db')

module.exports = {
	[process.env.NODE_ENV]: {
		...dbConfig.options
		, database: dbConfig.name
		, password: dbConfig.password
		, username: dbConfig.username
	}
}
