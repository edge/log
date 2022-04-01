// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import superagent from 'superagent'
import { Adaptor, Log, ServiceInfo } from '..'

export type Config = {
  apiKey?: string
  /**
   * Bulk cycle controls how frequently logs are sent to NewRelic (default 1s).
   * Set to false to disable bulk send, causing every log to be sent individually.
   */
  bulkCycle?: number | false
  gzip?: boolean
  timeout?: number
  /**
   * URL to Headerless Log API, excluding API key.
   * The EU endpoint is used by default if this is not specified.
   *
   * See https://docs.newrelic.com/docs/logs/log-api/introduction-log-api/#endpoint
   */
  url?: string
}

export class NewRelicAdaptor implements Adaptor {
  private config: Config
  private interval: NodeJS.Timer | undefined = undefined
  private serviceInfo: ServiceInfo
  private queue: Record<string, unknown>[]

  constructor(config: Config, serviceInfo?: ServiceInfo) {
    this.config = {...config}
    if (!this.config.url) {
      this.config.url = 'https://log-api.eu.newrelic.com/log/v1'
    }
    this.serviceInfo = serviceInfo || {}
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
      timestamp,
      name: log.name,
      level,
      message,
      context
    }
    if (this.config.bulkCycle === false) this.send(data)
    else this.queue.push(data)
  }

  private postQueue() {
    if (this.queue.length === 0) return
    const logs = this.queue
    this.queue = []
    this.send(logs)
  }

  private async send(data: Record<string, unknown> | Record<string, unknown>[]) {
    let reqData: unknown
    if (data instanceof Array) {
      reqData = [{
        common: {
          attributes: { ...this.serviceInfo }
        },
        logs: data.map(d => {
          const { timestamp, message, ...attributes } = d
          return { timestamp, message, attributes }
        })
      }]
    }
    else {
      reqData = {
        ...data,
        ...this.serviceInfo
      }
    }

    try {
      const req = superagent.post(this.config.url as string)
        .timeout(this.config.timeout || 5000)
        .set({ 'Api-Key': this.config.apiKey })
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(reqData))

      // TODO support gzip
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
