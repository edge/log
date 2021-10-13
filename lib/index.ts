// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

export { LogtailAdaptor } from './adaptors/logtail-adaptor'
export { StdioAdaptor } from './adaptors/stdio-adaptor'

export type Adaptor = {
  debug: (log: Log, message: string, context?: Record<string, unknown>) => void
  info: (log: Log, message: string, context?: Record<string, unknown>) => void
  warn: (log: Log, message: string, context?: Record<string, unknown>) => void
  error: (log: Log, message: string, context?: Record<string, unknown>) => void
}

export type LogContext = Record<string, unknown> | Error | Date | boolean | null | number | string

export enum LogLevel { Debug, Info, Warn, Error }

export function LogLevelFromString(level: string): LogLevel {
  const levelLower = level.toLowerCase()
  if (levelLower === 'debug') return LogLevel.Debug
  else if (levelLower === 'info') return LogLevel.Info
  else if (levelLower === 'warn') return LogLevel.Warn
  else if (levelLower === 'error') return LogLevel.Error
  else return LogLevel.Info
}

function disambiguate(message: LogContext, context: LogContext | undefined): [string, LogContext?] {
  if (typeof message === 'string') return [message, context]
  if (typeof message === 'number') return [`${message}`, context]
  if (typeof message === 'boolean') return [`${message}`, context]
  if (message === null) return ['null', context]
  if (message instanceof Date) return [message.toString(), context]
  if (message instanceof Error) return ['', mergeContexts(message, mergeContexts(context, {}) || {})]
  return ['', mergeContexts(message, mergeContexts(context, {}) || {})]
}

function mergeContexts(
  context: LogContext | undefined,
  into: Record<string, unknown>
): Record<string, unknown> | undefined {
  switch (typeof context) {
  case 'string':
  case 'boolean':
  case 'number':
    into._ = context.toString()
    break
  case 'object':
    if (context instanceof Error) {
      into.error = context.toString()
      if (context.stack !== undefined) into.stack = context.stack
    }
    else if (context !== null) into = { ...into, ...context }
    break
  }

  return Object.keys(into).length ? into : undefined
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
        `${this.name}:${name}`,
        this.level, this.mergeContexts(context))
    }
    else if (typeof name === 'string') return new Log(this.adaptors, `${this.name}:${name}`, this.level, this.context)
    else if (name) return new Log(this.adaptors, this.name, this.level, this.mergeContexts(name))
    else return new Log(this.adaptors, this.name, this.level, this.context)
  }

  private mergeContexts(context?: LogContext): Record<string, unknown> | undefined {
    return mergeContexts(context, { ...this.context })
  }
}
