import dotenv from 'dotenv'
import { Config, ElasticAdaptor, Options } from '../../lib/adaptors/elastic-adaptor'
import { Log, StdioAdaptor } from '../../lib'

dotenv.config()

const config: Config = {
  apiKey: process.env.ELASTIC_API_KEY,
  cert: false,
  dataStream: process.env.ELASTIC_DATA_STREAM || 'log-test-local',
  host: process.env.ELASTIC_HOST || 'https://localhost:9200'
}

const options: Options = {
  network: process.env.NETWORK || undefined,
  serviceId: process.env.SERVICE_ID || undefined,
  serviceType: process.env.SERVICE_TYPE || undefined
}

let log = new Log()
log.use(new StdioAdaptor())
log.use(new ElasticAdaptor(config, options))

if (process.env.NAME) {
  log = log.extend(process.env.NAME)
}

log.info(process.env.MESSAGE || 'Hello from elastic.test.ts!')
