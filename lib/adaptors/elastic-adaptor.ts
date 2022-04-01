// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { Adaptor, Log } from '..'

export type Config = {
  apiKey?: string
  /**
   * Bulk cycle controls how frequently logs are sent to Elasticsearch (default 1s).
   * Set to false to disable bulk send, causing every log to be sent individually.
   */
  bulkCycle?: number | false
  /**
   * CA certificate. This can be set to allow connection using a self-signed certificate.
   * Set to false to disable certificate verification.
   */
  cert?: string | false
  dataStream: string
  host: string
  password?: string
  username?: string
}

export type Options = {
  network?: string
  serviceId?: string
  serviceType?: string
}

export class ElasticAdaptor implements Adaptor {
  private config: Config
  private interval: NodeJS.Timer | undefined = undefined
  private options: Options
  private queue: Record<string, unknown>[]

  constructor(config: Config, options?: Options) {
    if (!config.apiKey && !config.username) {
      throw new Error('API key or username/password required')
    }
    this.config = config
    this.options = options || {}
    this.queue = []

    if (this.config.bulkCycle !== false) this.startCycle()
  }

  debug(log: Log, message: string, context?: Record<string, unknown>): void {
    this.log(log, 'debug', message, context)
  }

  info(log: Log, message: string, context?: Record<string, unknown>): void {
    this.log(log, 'info', message, context)
  }

  warn(log: Log, message: string, context?: Record<string, unknown>): void {
    this.log(log, 'warn', message, context)
  }

  error(log: Log, message: string, context?: Record<string, unknown>): void {
    this.log(log, 'error', message, context)
  }

  private log(log: Log, level: string, message: string, context?: Record<string, unknown>) {
    const timestamp = (new Date()).toISOString()
    const data = {
      '@timestamp': timestamp,
      name: log.name,
      level,
      message,
      context,
      ...this.options
    }
    if (this.config.bulkCycle === false) this.send('_doc', data)
    else this.queue.push(data)
  }

  private postQueue() {
    if (this.queue.length === 0) return
    const docs = this.queue
    this.queue = []

    const create = JSON.stringify({ create: {} })
    const data = docs.reduce((s, doc) => {
      s.push(create, JSON.stringify(doc))
      return s
    }, <string[]>[]).join('\n')

    this.send('_bulk', data + '\n')
  }

  private async send(endpoint: string, data: string | Record<string, unknown>) {
    try {
      const url = `${this.config.host}/${this.config.dataStream}/${endpoint}`
      const req = endpoint === '_bulk' ? superagent.put(url) : superagent.post(url)

      req.set('Content-Type', 'application/json').send(data)

      if (this.config.apiKey) req.set('Authorization', `apikey ${this.config.apiKey}`)
      else {
        const auth = Buffer.from(`${this.config.username}:${this.config.password}`, 'utf-8').toString('base64')
        req.set('Authorization', `basic ${auth}`)
      }

      if (this.config.cert) req.ca(this.config.cert)
      else if (this.config.cert === false) req.disableTLSCerts()

      await req
    }
    catch (err) {
      console.error(err)
    }
  }

  startCycle(): void {
    this.interval = setInterval(this.postQueue.bind(this), this.config.bulkCycle || 1000)
  }

  stopCycle(): void {
    if (this.interval !== undefined) clearInterval(this.interval)
    this.interval = undefined
  }
}
