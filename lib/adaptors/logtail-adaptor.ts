// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Context } from '@logtail/types'
import { Logtail } from '@logtail/node'
import { Adaptor, Log } from '..'

export class LogtailAdaptor implements Adaptor {
  private logtail: Logtail
  private enableNameInjection: boolean

  constructor(logtailSourceToken: string, enableNameInjection = true) {
    this.logtail = new Logtail(logtailSourceToken)
    this.enableNameInjection = enableNameInjection
  }

  trace(log: Log, message: string, context?: Record<string, unknown>): void {
    // no trace method - alias to debug
    this.logtail.debug(this.format(message, log.name), this.injectNameIntoContext(log, context))
  }

  debug(log: Log, message: string, context?: Record<string, unknown>): void {
    this.logtail.debug(this.format(message, log.name), this.injectNameIntoContext(log, context))
  }

  info(log: Log, message: string, context?: Record<string, unknown>): void {
    this.logtail.info(this.format(message, log.name), this.injectNameIntoContext(log, context))
  }

  warn(log: Log, message: string, context?: Record<string, unknown>): void {
    this.logtail.warn(this.format(message, log.name), this.injectNameIntoContext(log, context))
  }

  error(log: Log, message: string, context?: Record<string, unknown>): void {
    this.logtail.error(this.format(message, log.name), this.injectNameIntoContext(log, context))
  }

  private injectNameIntoContext(log: Log, context?: Record<string, unknown>): Context {
    return this.enableNameInjection
      ? { name: log.name, ...context } as Context
      : context as Context
  }

  private format(message: string, name?: string): string {
    return name ? `[${name}] ${message}` : message
  }
}
