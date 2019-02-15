/**
 * @overview    Global beforeCreate hook
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-14 15:02:54
 * @license     MIT License
 */

'use strict'

const {get} = require('lodash')

/**
 * Create access control advice
 * @param  {Array} options.args    [description]
 * @param  {[type]} options.proceed [description]
 * @return {Promise}                 [description]
 */
module.exports = async function adviseCreateAcl({args, proceed}) {
	const [values, meta] = args
	if (!values) {
		throw new Error(`Values missing from query.`)
	}

	const user = get(meta, 'context.state.user')
	const role = get(user, 'role', 'public')
	const createPermissions = get(this, ['permissions', role, 'create'])

	if (createPermissions === true) {
		return proceed(values)
	}

	if (typeof createPermissions === 'function') {
		if (await createPermissions(values)) {
			return proceed(values)
		}
	}

	throw new Error(`Role "${role}" denied to create ${this.name}.`)
}
