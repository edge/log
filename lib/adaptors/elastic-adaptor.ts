// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { StdioAdaptor } from './stdio-adaptor'
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
  private backup: Adaptor
  private config: ElasticConfig
  private options: Options

  constructor(config: ElasticConfig, options?: Options) {
    if (!config.apiKey && !config.username) {
      throw new Error('API key or username/password required')
    }
    this.backup = new StdioAdaptor()
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

  private prepareData(
    name: string | undefined,
    level: string,
    message: string,
    context?: Record<string, unknown>
  ): Record<string, unknown> {
    const timestamp = (new Date()).toISOString()
    return {
      '@timestamp': timestamp,
      name,
      level,
      message,
      context,
      ...this.options
    }
  }

  private async send(log: Log, level: string, message: string, context?: Record<string, unknown>): Promise<void> {
    try {
      const req = superagent.post(`${this.config.host}/${this.config.dataStream}/_doc`)
        .send(this.prepareData(log.name, level, message, context))

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
      this.backup.error(log, 'Failed to send log to Elasticsearch', { err })
      switch (level) {
      case 'debug':
        this.backup.debug(log, message, context)
        break
      case 'info':
        this.backup.info(log, message, context)
        break
      case 'warn':
        this.backup.warn(log, message, context)
        break
      case 'error':
        this.backup.error(log, message, context)
        break
      }
    }
  }
}
