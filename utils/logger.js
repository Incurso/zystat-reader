import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import parseArgs from 'minimist'

const args = parseArgs(process.argv.slice(2))

// Load config file
const config = yaml.load(fs.readFileSync(path.resolve(args.config || './config/config.yml'), 'utf8'))

export const logger = (req, { type = 'INFO', action, message = '' }) => {
  const msg = {
    timestamp: new Date(),
    type,
    action,
    method: req.method,
    url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    ip: req.ip,
    user: req.body.username || req.user?.username || 'unknown',
    message
  }

  switch (type) {
    case 'ERROR':
      console.error(msg)
      break
    case 'INFO':
      console.info(msg)
      break
    default:
      console.log(msg)
  }

  if (config.LOG_FILE) {
    console.log(JSON.stringify(msg))
    // Write to log file
    fs.appendFile(path.resolve(config.LOG_FILE), `${JSON.stringify(msg)}\n`, (err) => { if (err) throw err })
  }

  // TODO: add logging to syslog
}
