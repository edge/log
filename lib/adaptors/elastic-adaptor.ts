// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { Adaptor, Log } from '..'

export type ElasticConfig = {
  apiKey?: string
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
  private config: ElasticConfig
  private options: Options

  constructor(config: ElasticConfig, options?: Options) {
    if (!config.apiKey && !config.username) {
      throw new Error('API key or username/password required')
    }
    this.config = config
    this.options = options || {}
  }

  debug(log: Log, message: string, context?: Record<string, unknown>): void {
    this.send(log, 'debug', message, context)
  }

  info(log: Log, message: string, context?: Record<string, unknown>): void {
    this.send(log, 'info', message, context)
  }

  warn(log: Log, message: string, context?: Record<string, unknown>): void {
    this.send(log, 'warn', message, context)
  }

  error(log: Log, message: string, context?: Record<string, unknown>): void {
    this.send(log, 'error', message, context)
  }

  private async send(log: Log, level: string, message: string, context?: Record<string, unknown>): Promise<void> {
    const timestamp = (new Date()).toISOString()
    const data = {
      '@timestamp': timestamp,
      name: log.name,
      level,
      message,
      context,
      ...this.options
    }

    try {
      const req = superagent.post(`${this.config.host}/${this.config.dataStream}/_doc`).send(data)

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
}
