// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

export { ElasticAdaptor } from './adaptors/elastic-adaptor'
export { LogtailAdaptor } from './adaptors/logtail-adaptor'
export { NewRelicAdaptor } from './adaptors/newrelic-adaptor'
export { StdioAdaptor } from './adaptors/stdio-adaptor'

import * as elastic from './adaptors/elastic-adaptor'
export type ElasticConfig = elastic.Config

export type Adaptor = {
  debug: (log: Log, message: string, context?: Record<string, unknown>) => void
  info: (log: Log, message: string, context?: Record<string, unknown>) => void
  warn: (log: Log, message: string, context?: Record<string, unknown>) => void
  error: (log: Log, message: string, context?: Record<string, unknown>) => void
}

export type LogContext = Record<string, unknown> | Error | Date | boolean | null | number | string

export enum LogLevel { Debug, Info, Warn, Error }

export type SerializedLogContext = Record<string, unknown> | boolean | null | number | string

export type ServiceInfo = {
  network?: string
  serviceId?: string
  serviceType?: string
}

export function LogLevelFromString(level: string): LogLevel {
  const levelLower = level.toLowerCase()
  if (levelLower === 'debug') return LogLevel.Debug
  else if (levelLower === 'info') return LogLevel.Info
  else if (levelLower === 'warn') return LogLevel.Warn
  else if (levelLower === 'error') return LogLevel.Error
  else return LogLevel.Info
}

function disambiguate(message: LogContext, context: LogContext | undefined): [string, LogContext?] {
  if (typeof message === 'string') return [message, serialize(context)]
  if (typeof message === 'number') return [`${message}`, serialize(context)]
  if (typeof message === 'boolean') return [`${message}`, serialize(context)]
  if (message === null) return ['null', serialize(context)]
  if (message instanceof Date) return [message.toString(), serialize(context)]
  if (message instanceof Error) return [message.toString(), mergeContexts(message, mergeContexts(context, {}) || {})]
  return ['', mergeContexts(message, mergeContexts(context, {}) || {})]
}

function mergeContexts(
  context: LogContext | undefined,
  into: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (context === undefined) return
  const serialized = serialize(context)
  switch (typeof serialized) {
  case 'string':
  case 'boolean':
  case 'number':
    into._ = serialized.toString()
    break
  case 'object':
    if (serialized === null) {
      into._ = null
      break
    }
    Object.keys(serialized).forEach(k => {
      into[k] = serialized[k]
    })
    break
  default:
    into._ = context
  }

  return Object.keys(into).length ? into : undefined
}

function serialize(context: LogContext | undefined): SerializedLogContext | undefined {
  switch (typeof context) {
  case 'string':
  case 'boolean':
  case 'number':
    return context.toString()
  case 'object':
    if (context instanceof Error) {
      return {
        message: context.message,
        name: context.name,
        stack: context.stack
      }
    }
    else if (context instanceof Date) return context.toString()
    else if (context !== null) {
      // assuming in good faith that the object contains serializable values
      const newContext = <Record<string, unknown>>{}
      Object.keys(context).forEach(k => {
        newContext[k] = serialize(context[k] as LogContext | undefined)
      })
      return newContext
    }
    return context
  default:
    return context
  }
}


export class Log {
  public readonly name?: string
  private adaptors: Adaptor[] = []
  private context?: Record<string, unknown>
  private level = LogLevel.Info

  constructor(name?: string)
  constructor(name?: string, level?: LogLevel)
  constructor(name?: string, context?: Record<string, unknown>)
  constructor(name?: string, level?: LogLevel, context?: Record<string, unknown>)
  constructor(level?: LogLevel)
  constructor(level?: LogLevel, context?: Record<string, unknown>)
  constructor(context?: Record<string, unknown>)
  constructor(adaptors?: Adaptor[])
  constructor(adaptors?: Adaptor[], name?: string)
  constructor(adaptors?: Adaptor[], level?: LogLevel)
  constructor(adaptors?: Adaptor[], context?: Record<string, unknown>)
  constructor(adaptors?: Adaptor[], name?: string, level?: LogLevel)
  constructor(adaptors?: Adaptor[], name?: string, context?: Record<string, unknown>)
  constructor(adaptors?: Adaptor[], level?: LogLevel, context?: Record<string, unknown>)
  constructor(adaptors?: Adaptor[], name?: string, level?: LogLevel, context?: Record<string, unknown>)
  constructor(
    adaptors?: Adaptor[] | string | LogLevel | Record<string, unknown>,
    name?: string | LogLevel | Record<string, unknown>,
    level?: LogLevel | Record<string, unknown>,
    context?: Record<string, unknown>
  ) {
    if (Array.isArray(adaptors)) this.adaptors = adaptors
    if (typeof adaptors === 'string') this.name = adaptors
    else if (typeof adaptors === 'number') this.level = adaptors
    else if (adaptors && !Array.isArray(adaptors)) this.context = adaptors

    if (typeof name === 'string') this.name = name
    else if (typeof name === 'number') this.level = name
    else if (name) this.context = name

    if (typeof level === 'number') this.level = level
    else if (level) this.context = level

    if (context) this.context = context
  }

  use(adaptor: Adaptor): void {
    this.adaptors.push(adaptor)
  }

  setLogLevel(level: LogLevel): void {
    this.level = level
  }

  debug(message: string): void
  debug(context: LogContext): void
  debug(message: string, context?: LogContext): void
  debug(message: LogContext, context?: LogContext): void {
    if (this.level > LogLevel.Debug) return
    const [fwdMessage, fwdContext] = disambiguate(message, context)
    this.adaptors.forEach(adaptor => adaptor.debug(this, fwdMessage, this.mergeContexts(fwdContext)))
  }

  info(message: string): void
  info(context: LogContext): void
  info(message: string, context?: LogContext): void
  info(message: LogContext, context?: LogContext): void {
    if (this.level > LogLevel.Info) return
    const [fwdMessage, fwdContext] = disambiguate(message, context)
    this.adaptors.forEach(adaptor => adaptor.info(this, fwdMessage, this.mergeContexts(fwdContext)))
  }

  warn(message: string): void
  warn(context: LogContext): void
  warn(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void {
    if (this.level > LogLevel.Warn) return
    const [fwdMessage, fwdContext] = disambiguate(message, context)
    this.adaptors.forEach(adaptor => adaptor.warn(this, fwdMessage, this.mergeContexts(fwdContext)))
  }

  error(message: string): void
  error(context: LogContext): void
  error(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void {
    if (this.level > LogLevel.Error) return
    const [fwdMessage, fwdContext] = disambiguate(message, context)
    this.adaptors.forEach(adaptor => adaptor.error(this, fwdMessage, this.mergeContexts(fwdContext)))
  }

  extend(name: string): Log
  extend(context: LogContext): Log
  extend(name: string, context: LogContext): Log
  extend(name: string | LogContext, context?: LogContext): Log {
    if (typeof name === 'string' && context) {
      return new Log(
        this.adaptors,
        [this.name, name].filter(Boolean).join(':'),
        this.level, this.mergeContexts(context))
    }
    else if (typeof name === 'string') {
      return new Log(this.adaptors, [this.name, name].filter(Boolean).join(':'), this.level, this.context)
    }
    else if (name) {
      return new Log(this.adaptors, this.name, this.level, this.mergeContexts(name))
    }
    else {
      return new Log(this.adaptors, this.name, this.level, this.context)
    }
  }

  private mergeContexts(context?: LogContext): Record<string, unknown> | undefined {
    return mergeContexts(context, { ...this.context })
  }
}
