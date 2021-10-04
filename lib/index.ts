// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/* eslint-disable max-len */
/* eslint-disable nonblock-statement-body-position */

export { LogtailAdaptor } from './adaptors/logtail-adaptor'
export { StdioAdaptor } from './adaptors/stdio-adaptor'

export type Adaptor = {
  debug: (log: Log, message: string, context?: Record<string, unknown>) => void
  info: (log: Log, message: string, context?: Record<string, unknown>) => void
  warn: (log: Log, message: string, context?: Record<string, unknown>) => void
  error: (log: Log, message: string, context?: Record<string, unknown>) => void
}

export enum LogLevel {
  Debug,
  Info,
  Warn,
  Error
}

export class Log {
  public readonly name?: string
  private adaptors: Adaptor[]
  private context?: Record<string, unknown>
  private level = LogLevel.Info

  constructor(adaptors: Adaptor[])
  constructor(adaptors: Adaptor[], name?: string)
  constructor(adaptors: Adaptor[], level?: LogLevel)
  constructor(adaptors: Adaptor[], context?: Record<string, unknown>)
  constructor(adaptors: Adaptor[], name?: string, level?: LogLevel)
  constructor(adaptors: Adaptor[], name?: string, context?: Record<string, unknown>)
  constructor(adaptors: Adaptor[], level?: LogLevel, context?: Record<string, unknown>)
  constructor(adaptors: Adaptor[], name?: string, level?: LogLevel, context?: Record<string, unknown>)
  constructor(
    adaptors: Adaptor[],
    name?: string | LogLevel | Record<string, unknown>,
    level?: LogLevel | Record<string, unknown>,
    context?: Record<string, unknown>
  ) {
    this.adaptors = adaptors

    if (typeof name === 'string') this.name = name
    else if (typeof name === 'number') this.level = name
    else if (name) this.context = name

    if (typeof level === 'number') this.level = level
    else if (level) this.context = level

    if (context) this.context = context
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.level === LogLevel.Debug) this.adaptors.forEach(adaptor => adaptor.debug(this, message, this.mergeContexts(context)))
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.level <= LogLevel.Info) this.adaptors.forEach(adaptor => adaptor.info(this, message, this.mergeContexts(context)))
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (this.level <= LogLevel.Warn) this.adaptors.forEach(adaptor => adaptor.warn(this, message, this.mergeContexts(context)))
  }

  error(message: string, context?: Record<string, unknown>): void {
    if (this.level <= LogLevel.Error) this.adaptors.forEach(adaptor => adaptor.error(this, message, this.mergeContexts(context)))
  }

  extend(name: string): Log
  extend(context: Record<string, unknown>): Log
  extend(name: string, context: Record<string, unknown>): Log
  extend(name: string | Record<string, unknown>, context?: Record<string, unknown>): Log {
    if (typeof name === 'string' && context) return new Log(this.adaptors, `${this.name}:${name}`, this.level, this.mergeContexts(context))
    else if (typeof name === 'string') return new Log(this.adaptors, `${this.name}:${name}`, this.level, this.context)
    else if (name) return new Log(this.adaptors, this.name, this.level, this.mergeContexts(name))
    else return new Log(this.adaptors, this.name, this.level, this.context)
  }

  private mergeContexts(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (this.context || context) return { ...this.context, ...context }
    return undefined
  }
}
