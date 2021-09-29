export * as filter from './filter'
export * as std from './std'

export type Adapter = Record<LogLevel, LogFn>

export type Data = Record<string, unknown> | Date | boolean | null | number | string
export type DataObject = Record<string, Data>

export type LogFn = (msg: string, data?: DataObject) => void

export type LogLevel = 'debug' | 'error' | 'info' | 'warn'

export type Logger = Adapter & {
  catch: (err: unknown) => void
}

export const create = (adapters: Adapter[]): Logger => ({
  catch: (err: unknown) => adapters.forEach(adapter => adapter.error(...parseError(err))),
  debug: (msg, data) => adapters.forEach(adapter => adapter.debug(msg, data)),
  error: (msg, data) => adapters.forEach(adapter => adapter.error(msg, data)),
  info: (msg, data) => adapters.forEach(adapter => adapter.info(msg, data)),
  warn: (msg, data) => adapters.forEach(adapter => adapter.warn(msg, data))
})

export const parseError = (err: unknown): [string, DataObject?] => {
  let msg = 'caught error'
  const data: DataObject = {}
  if (err instanceof Error) {
    msg = err.toString()
    if (err.stack !== undefined) data.stack = err.stack
  }
  else switch (typeof err) {
  case 'string':
    msg = err
    break
  case 'boolean':
  case 'number':
    data.err = err
    break
  case 'object':
    if (err !== null) data.err = err.toString()
    break
  default:
    data.err = '[unsupported data]'
    break
  }
  return [msg, Object.keys(data).length ? data : undefined]
}

export const logLevels: string[] = ['debug', 'info', 'warn', 'error']

export const logLevelInt = (s: string) => {
  const n = logLevels.indexOf(s)
  if (n < 0) throw new Error(`invalid LogLevel "${s}"`)
  return n
}

export const logLevelsObject = logLevels.reduce((a, b, i) => ({ ...a, [b]: i }), {} as Record<LogLevel, number>)

export const logLevelString = (n: number) => {
  if (n < 0 || n >= logLevels.length) throw new Error(`invalid LogLevel ${n}`)
  return logLevels[n]
}
