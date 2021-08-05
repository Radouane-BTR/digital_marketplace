'use strict'

const path = require("path")

module.exports = {  
  exit: true,
  recursive: true,
  extension: 'ts',
  file: [__dirname + '/unit/setup.ts'],
  require: [
    'ts-node/register',
    'tsconfig-paths/register'
  ]
}
