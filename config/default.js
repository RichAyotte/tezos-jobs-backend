/**
 * @overview    Default config
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-12 15:43:11
 * @license     MIT License
 */

'use strict'

const timezone = 'UTC'

module.exports = {
	db: {
		name: 'tezosjobs'
		, options: {
			define: {
				charset: 'utf8'
				, collate: 'utf8_unicode_ci'
			}
			, dialect: 'mysql'
			, dialectOptions: {
				timezone
			}
			, host: '127.0.0.1'
			, logging: false
			, timezone
		}
		, username: ''
	}
	, env: process.env
	, isDebug: false
	, koaGraphql: {
		graphiql: false
		, pretty: false
	}
	, port: 9443
	, koaKeys: []
}
