/**
 * @overview    Logger
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-12 15:23:06
 * @license     MIT License
 */

'use strict'

const pino = require('pino')

const getPinoDestination = env => {
	if (env === 'development') {
		return
	}
	if (env === 'testing') {
		return pino.destination('/var/log/tezosjobs/error.log')
	}
	if (env === 'production') {
		return pino.destination('/var/log/tezosjobs/error.log')
	}
}

const getPinoOptions = env => {
	const options = {
		name: `Tezos Jobs`
	}

	if (env === 'development') {
		options.level = 'trace'
	}

	if (env === 'testing') {
		options.level = 'trace'
	}

	return options
}

/**
 * Logger
 * process.env.NODE_ENV must be used here instead what's in config because the
 * config is actually using this file.
 * @type {Object} logger
 */
module.exports = pino(
	getPinoOptions(process.env.NODE_ENV)
	, getPinoDestination(process.env.NODE_ENV)
)
