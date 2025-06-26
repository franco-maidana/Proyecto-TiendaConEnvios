import {Router} from 'express'
import {WebhookMP} from '../../controllers/webhook.controlers.js'

const webhook = Router()

webhook.post('/mercado-pago', WebhookMP);

export default webhook