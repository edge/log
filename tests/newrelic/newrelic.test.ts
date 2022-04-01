import dotenv from 'dotenv'
import { Config, NewRelicAdaptor } from '../../lib/adaptors/newrelic-adaptor'
import { Log, ServiceInfo, StdioAdaptor } from '../../lib'

dotenv.config()

const config: Config = {
  apiKey: process.env.NEWRELIC_API_KEY || '',
  url: process.env.NEWRELIC_URL || undefined
}

const serviceInfo: ServiceInfo = {
  network: process.env.NETWORK || undefined,
  serviceId: process.env.SERVICE_ID || undefined,
  serviceType: process.env.SERVICE_TYPE || undefined
}

let log = new Log()
log.use(new StdioAdaptor())
const newrelic = new NewRelicAdaptor(config, serviceInfo)
log.use(newrelic)

if (process.env.NAME) {
  log = log.extend(process.env.NAME)
}

log.info(process.env.MESSAGE || 'Hello from newrelic.test.ts!')
setTimeout(() => newrelic.stopCycle(), 2000)
