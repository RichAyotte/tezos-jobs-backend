/**
 * @overview    Tezos Jobs API
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-12 15:27:13
 * @license     MIT License
 */

'use strict'

const fs = require('fs')
const http2 = require('http2')
const path = require('path')

// Globals
global.appRoot = path.resolve(__dirname)

/**
 * It is important to set the server environment timezone as early as possible
 * and have it match the database and sequelize configuration. Otherwise, the
 * SQL queries will automatically be adjusted by sequelize to compensate for the
 * time difference.
 */
const config = require('config')
process.env.TZ = config.db.options.timezone

const Koa = require('koa')
const koaBodyParser = require('koa-bodyparser')
const koaGraphql = require('koa-graphql')
const koaMount = require('koa-mount')
const koaSession = require('koa-session')

const handleError = require(`${appRoot}/lib/handle-error`)
const log = require(`${appRoot}/lib/log`)
const schema = require(`${appRoot}/schema`)
const sessionsStore = require(`${appRoot}/lib/sessions-store`)

process.on('uncaughtException', error => {
	log.error(error)
})

const app = new Koa()
app.keys = config.get('koaKeys')
app.on('error', handleError)
app.use(
	koaBodyParser()
)
app.use(
	koaSession(
		{
			store: sessionsStore
		}
		, app
	)
)
app.use(
	koaMount(
		'/'
		, koaGraphql({
			...config.koaGraphql
			, schema
		})
	)
)

/* eslint-disable no-sync */
const sslOptions = {
	cert: fs.readFileSync(config.ssl.cert)
	, key: fs.readFileSync(config.ssl.key)
}
/* eslint-enable no-sync */

const sslPort = config.port
http2
.createSecureServer(sslOptions, app.callback())
.listen(sslPort, error => {
	if (error) {
		throw new Error(error)
	}
	log.info(`Tezos Jobs API server started on HTTP2 port ${sslPort}`)
})

module.exports = app
