// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Context } from '@logtail/types'
import { Logtail } from '@logtail/node'
import { Adaptor, Log } from '..'

export class LogtailAdaptor implements Adaptor {
  private logtail: Logtail

  constructor(logtailSourceToken: string) {
    this.logtail = new Logtail(logtailSourceToken)
  }

  debug(log: Log, message: string, context?: Record<string, unknown>): void {
    this.logtail.debug(this.format(message, log.name), this.addNameToContext(log, context))
  }

  info(log: Log, message: string, context?: Record<string, unknown>): void {
    this.logtail.info(this.format(message, log.name), this.addNameToContext(log, context))
  }

  warn(log: Log, message: string, context?: Record<string, unknown>): void {
    this.logtail.warn(this.format(message, log.name), this.addNameToContext(log, context))
  }

  error(log: Log, message: string, context?: Record<string, unknown>): void {
    this.logtail.error(this.format(message, log.name), this.addNameToContext(log, context))
  }

  private addNameToContext(log: Log, context?: Record<string, unknown>): Context {
    return { name: log.name, ...context } as Context
  }

  private format(message: string, name?: string): string {
    return name ? `[${name}] ${message}` : message
  }
}
