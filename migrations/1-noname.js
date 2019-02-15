'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "Companies", deps: []
 * createTable "Jobs", deps: [Companies]
 *
 **/

var info = {
    "revision": 1,
    "name": "noname",
    "created": "2019-02-13T16:29:57.837Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "Companies",
            {
                "id": {
                    "type": Sequelize.INTEGER(10).UNSIGNED,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "name": {
                    "type": Sequelize.STRING(100),
                    "field": "name",
                    "allowNull": true
                },
                "description": {
                    "type": Sequelize.TEXT,
                    "field": "description",
                    "allowNull": true
                },
                "websiteUrl": {
                    "type": Sequelize.STRING(255),
                    "field": "websiteUrl",
                    "allowNull": true
                },
                "address": {
                    "type": Sequelize.STRING(100),
                    "field": "address",
                    "allowNull": true
                },
                "province": {
                    "type": Sequelize.INTEGER(6),
                    "field": "province",
                    "allowNull": true
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                }
            },
            {
                "charset": "utf8"
            }
        ]
    },
    {
        fn: "createTable",
        params: [
            "Jobs",
            {
                "id": {
                    "type": Sequelize.INTEGER(10).UNSIGNED,
                    "field": "id",
                    "autoIncrement": true,
                    "primaryKey": true,
                    "allowNull": false
                },
                "title": {
                    "type": Sequelize.STRING(100),
                    "field": "title",
                    "allowNull": true
                },
                "description": {
                    "type": Sequelize.TEXT,
                    "field": "description",
                    "allowNull": true
                },
                "minSalary": {
                    "type": Sequelize.DECIMAL,
                    "field": "minSalary",
                    "allowNull": true
                },
                "maxSalary": {
                    "type": Sequelize.DECIMAL,
                    "field": "maxSalary",
                    "allowNull": true
                },
                "salaryCurrency": {
                    "type": Sequelize.CHAR(5),
                    "field": "salaryCurrency",
                    "allowNull": true
                },
                "isRemote": {
                    "type": Sequelize.INTEGER(4),
                    "field": "isRemote",
                    "allowNull": true
                },
                "location": {
                    "type": Sequelize.TEXT,
                    "field": "location",
                    "allowNull": true
                },
                "applicationUrl": {
                    "type": Sequelize.STRING(255),
                    "field": "applicationUrl",
                    "allowNull": true
                },
                "createdAt": {
                    "type": Sequelize.DATE,
                    "field": "createdAt",
                    "allowNull": false
                },
                "updatedAt": {
                    "type": Sequelize.DATE,
                    "field": "updatedAt",
                    "allowNull": false
                },
                "CompanyId": {
                    "type": Sequelize.INTEGER(10).UNSIGNED,
                    "field": "CompanyId",
                    "onUpdate": "CASCADE",
                    "onDelete": "SET NULL",
                    "references": {
                        "model": "Companies",
                        "key": "id"
                    },
                    "allowNull": true
                }
            },
            {
                "charset": "utf8"
            }
        ]
    }
];

module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
