/**
 * @overview    Session
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-13 12:54:25
 * @license     MIT License
 */

'use strict'

const sessions = {}

module.exports = {
	async get(key) {
		console.log(sessions)
		return sessions[key]
	}
	, async set(key, value) {
		sessions[key] = value
	}
	, async destroy(key) {
		sessions[key] = null
	}
}
