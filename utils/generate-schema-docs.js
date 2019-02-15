/**
 * @overview    Generate Schema docs
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-15 12:39:49
 * @license     MIT License
 */

/* eslint-disable no-sync */

'use strict'

const path = require('path')
const fs = require('fs')

const {loadSchemaJSON, renderSchema} = require('graphql-markdown')

global.appRoot = path.resolve(`${__dirname}/..`)

const main = async () => {
	const filePath = `${appRoot}/API.md`

	try {
		fs.unlinkSync(filePath)
	}
	catch (error) {
		console.warn(`${filePath} not found.`)
	}

	const schema = await loadSchemaJSON(`${appRoot}/schema`)

	renderSchema(schema, {
		printer(md) {
			fs.appendFileSync(filePath, md)
		}
	})
}

main()
