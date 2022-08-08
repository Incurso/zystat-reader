#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import http from 'http'
import yaml from 'js-yaml'
import parseArgs from 'minimist'
import app from './app.js'

const args = parseArgs(process.argv.slice(2))

// Load config file
const config = yaml.load(fs.readFileSync(path.resolve(args.config || './config/config.yml'), 'utf8'))

//app.set('port', config.LISTENING_PORT)

const server = http.createServer(app)
server.listen(config.LISTENING_PORT)
  .on('error', (e) => console.log(e))
  .on('listening', () => console.log(`Listening on port: ${config.LISTENING_PORT}`))
