/**
 * @overview    Jobs
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-13 11:18:19
 * @license     MIT License
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
	const Jobs = sequelize.define(
		'Jobs'
		, {
			id: {
				type: DataTypes.INTEGER(10).UNSIGNED
				, allowNull: false
				, primaryKey: true
				, autoIncrement: true
			}
			, title: {
				type: DataTypes.STRING(100)
				, allowNull: true
			}
			, description: {
				type: DataTypes.TEXT
				, allowNull: true
			}
			, minSalary: {
				type: DataTypes.DECIMAL
				, allowNull: true
			}
			, maxSalary: {
				type: DataTypes.DECIMAL
				, allowNull: true
			}
			, salaryCurrency: {
				type: DataTypes.CHAR(5)
				, allowNull: true
			}
			, isRemote: {
				type: DataTypes.INTEGER(4)
				, allowNull: true
			}
			, location: {
				type: DataTypes.TEXT
				, allowNull: true
			}
			, applicationUrl: {
				type: DataTypes.STRING(255)
				, allowNull: true
			}
		}
		, {
			tableName: 'Jobs'
		}
	)

	return Jobs
}
