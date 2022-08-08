import path from 'path'
import cors from 'cors'
import express from 'express'
import winston from 'winston'
import expressWinston from 'express-winston'
import { apiRouter } from './routes/index.js'

const app = express()

// http://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', true)

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.json()
  ),
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  msg: 'HTTP {{req.method}} {{req.url}}', // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function (req, res) { return false } // optional: allows to skip some log messages based on request and/or response
}))

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use('/api', apiRouter)

// Serving static files from client project
app.use('/', express.static(path.join(path.resolve(), '../client/build')))
// Serving static files from public
app.use('/', express.static(path.join(path.resolve(), 'public')))
// Supplying routes for react app
app.get('*', (req, res) => res.sendFile(path.join(path.resolve(), '../client/build', 'index.html')))

export default app