import { Writable } from 'stream'
import chalk from 'chalk'
import { stderr, stdout } from 'process'
import { Adapter, DataObject } from '.'

export const logColors = [
  // debug
  [chalk.white, chalk.black.bgWhite],
  // info
  [chalk.blue, chalk.bgBlue],
  // warn
  [chalk.yellow, chalk.bgYellow],
  // error
  [chalk.red, chalk.bgRed]
]

export const shortLogLevels = ['DBG', 'INF', 'WRN', 'ERR']

const format = (d: Date, level: number, msg: string, data?: DataObject) => {
  const [nameColor, levelColor] = logColors[level]
  const parts = [
    chalk.gray(timestamp(d)),
    levelColor(` ${shortLogLevels[level]} `)
  ]
  if (typeof data?.loggerName === 'string') {
    parts.push(nameColor(`[${data.loggerName}]`))
  }
  parts.push(chalk.white(msg))
  if (data !== undefined) {
    const { loggerName, ...logData } = data
    if (Object.keys(logData).length) parts.push(chalk.bgGrey(JSON.stringify(logData)))
  }
  return parts.join(' ') + "\n"
}

const timestamp = (d: Date): string => {
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  const s = d.getSeconds().toString().padStart(2, '0')
  const ms = d.getMilliseconds().toString().padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}

const writer = (output: Writable): Adapter => ({
  debug: (msg, data) => output.write(format(new Date(), 0, msg, data)),
  error: (msg, data) => output.write(format(new Date(), 3, msg, data)),
  info: (msg, data) => output.write(format(new Date(), 1, msg, data)),
  warn: (msg, data) => output.write(format(new Date(), 2, msg, data))
})

export const adapter = (useStderr: boolean = false): Adapter => {
  const out = writer(stdout)
  const errOut = useStderr ? writer(stderr) : out

  return {
    debug: (msg, data) => out.debug(msg, data),
    error: (msg, data) => errOut.error(msg, data),
    info: (msg, data) => out.info(msg, data),
    warn: (msg, data) => out.warn(msg, data)
  }
}

export default adapter
