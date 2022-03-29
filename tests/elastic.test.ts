import { Log } from '../lib'
import { ElasticAdaptor, ElasticConfig } from '../lib/adaptors/elastic-adaptor'

const config: ElasticConfig = {
  apiKey: 'MEQ4OTFuOEJjWGRwRk1fc2JjTEQ6Und5bWFqR2NTTW1nN0hDYi0tN0NMQQ==',
  cert: false,
  dataStream: 'log-test-local',
  host: 'https://localhost:9200'
}

const log = new Log()
log.use(new ElasticAdaptor(config, { serviceType: 'stargate', serviceId: 'notts1', network: 'local' }))

const dblog = log.extend('db')

dblog.info('added user "Anny"')
