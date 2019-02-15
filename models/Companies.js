/**
 * @overview    Companies
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-13 11:17:22
 * @license     MIT License
 */

'use strict'

module.exports = (sequelize, DataTypes) => {
	const Companies = sequelize.define(
		'Companies'
		, {
			id: {
				type: DataTypes.INTEGER(10).UNSIGNED
				, allowNull: false
				, primaryKey: true
				, autoIncrement: true
			}
			, name: {
				type: DataTypes.STRING(100)
				, allowNull: true
				, unique: true
			}
			, description: {
				type: DataTypes.TEXT
				, allowNull: true
			}
			, websiteUrl: {
				type: DataTypes.STRING(255)
				, allowNull: true
			}
			, address: {
				type: DataTypes.STRING(100)
				, allowNull: true
			}
			, province: {
				type: DataTypes.INTEGER(6)
				, allowNull: true
			}
		}
		, {
			tableName: 'Companies'
		}
	)

	Companies.associate = models => {
		Companies.hasMany(models.Jobs)
	}

	return Companies
}
