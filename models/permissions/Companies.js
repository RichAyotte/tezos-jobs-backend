/**
 * @overview    Companies ACL
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-13 11:48:37
 * @license     MIT License
 */

'use strict'

/**
 * Role permissions
 * @description CRUD is boolean or an array of attributes (fields) and scope can
 *              be either be:
 *              '*' Any
 *              'none'  None
 *              {model: Model, [id]} inner join array of ids to determine scope
 *              [id] Array of primary keys
 * @param  {Object} models Sequelize models
 * @return {Object} Permissions object with new scope
 */

module.exports = models => {
	return {
		public: {
			create: false
			, read: true
		}
		, system: {
			create: true
			, delete: true
			, read: true
			, update: true
		}
	}
}
