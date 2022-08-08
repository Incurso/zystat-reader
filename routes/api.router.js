import { Router } from 'express'
import { statisticsPortal } from '../controllers/index.js'

const router = Router()

router.get('/channelEntries/:queueName', statisticsPortal.get, statisticsPortal.errorResponse)

router.get('*', (req, res) => { res.status(404).json({ message: 'Resource not found!' }) })

export default router
