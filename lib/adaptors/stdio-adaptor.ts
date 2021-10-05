// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Writable } from 'stream'
import chalk from 'chalk'
import { Adaptor, Log, LogLevel } from '..'
import { stderr, stdout } from 'process'

const logLevelColors = [
  { foreground: chalk.white, background: chalk.black.bgWhite },
  { foreground: chalk.blue, background: chalk.black.bgBlue },
  { foreground: chalk.yellow, background: chalk.black.bgYellow },
  { foreground: chalk.red, background: chalk.black.bgRed }
]

const logLevelAbbrs = [
  'DBG', 'INF', 'WRN', 'ERR'
]

export class StdioAdaptor implements Adaptor {
  private out: Writable
  private errOut: Writable

  constructor(useStderr = false) {
    this.out = stdout
    this.errOut = useStderr ? stderr : stdout
  }

  debug(log: Log, message: string, context?: Record<string, unknown>): void {
    this.writeToLog(LogLevel.Debug, message, log.name, context)
  }

  info(log: Log, message: string, context?: Record<string, unknown>): void {
    this.writeToLog(LogLevel.Info, message, log.name, context)
  }

  warn(log: Log, message: string, context?: Record<string, unknown>): void {
    this.writeToLog(LogLevel.Warn, message, log.name, context)
  }

  error(log: Log, message: string, context?: Record<string, unknown>): void {
    this.writeToLog(LogLevel.Error, message, log.name, context)
  }

  private humanTimestamp(d: Date): string {
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    const s = d.getSeconds().toString().padStart(2, '0')
    const ms = d.getMilliseconds().toString().padStart(3, '0')
    return `${h}:${m}:${s}.${ms}`
  }

  private writeToLog(level: LogLevel, message: string, name?: string, context?: Record<string, unknown>): void {
    const timestamp = chalk.gray(this.humanTimestamp(new Date()))
    const colors = logLevelColors[level]
    const levelText = colors.background(` ${logLevelAbbrs[level]} `)
    const nameText = name ? colors.foreground(`[${name}]`) : ''
    const messageText = chalk.white(message)
    const contextText = context ? chalk.bgGrey(JSON.stringify(context)) : ''
    const outputText = [timestamp, levelText, nameText, messageText, contextText].filter(s => s).join(' ') + '\n'

    if (level === LogLevel.Error) this.errOut.write(outputText)
    else this.out.write(outputText)
  }
}
