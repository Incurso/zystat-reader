import { logger } from '../utils/logger.js'
import { statisticsPortalService as service } from '../services/index.js'

export const errorResponse = (err, req, res, next) => {
  if (err) {
    logger(req, { type: 'ERROR', action: 'LINE', message: err.message })

    return res.status(401).json(err)
  }
}

export const get = async (req, res) => {
  const { queueName } = req.params
  
  const currentDate = new Date().toISOString().slice(0, 10)
  const startDate = new Date(req.query.startDate || new Date(currentDate)).getTime()
  const endDate = new Date(req.query.endDate || new Date(currentDate).setDate(new Date(currentDate).getDate() + 1)).getTime()

  console.log('controller/channelEntries', queueName)

  service.get(queueName, startDate, endDate)
    .then((result) => {
      logger(req, { type: 'INFO', action: 'GET ChannelEntries', message: queueName })

      return res.status(200).json(result)
    })
    .catch(({ status, message }) => {
      logger(req, { type: 'ERROR', action: 'GET ChannelEntries', message })

      return res.status(500).json({ message })
    })
}

export default {
  errorResponse,
  get,
}
