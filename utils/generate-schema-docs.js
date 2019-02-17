/**
 * @overview    Generate Schema docs
 * @author      Richard Ayotte
 * @copyright   Copyright © 2019 Richard Ayotte
 * @date        2019-02-15 12:39:49
 * @license     MIT License
 */

/* eslint-disable no-sync, prefer-template */

'use strict'

const path = require('path')
const fs = require('fs').promises

const {loadSchemaJSON, renderSchema} = require('graphql-markdown')

global.appRoot = path.resolve(`${__dirname}/..`)

const main = async () => {
	const filePath = `${appRoot}/API.md`
	const schema = await loadSchemaJSON(`${appRoot}/schema`)

	let buffer = ''
	renderSchema(schema, {
		printer(md) {
			buffer += md + '\n'
		}
	})

	await fs.writeFile(filePath, buffer)
}

main()
