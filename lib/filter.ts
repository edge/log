import { Adapter, DataObject, Logger, logLevelInt, logLevelsObject, parseError } from '.'

export const minimumLogLevel = (next: Logger, minLevel: number|string): Logger => {
  const level = typeof minLevel === 'string' ? logLevelInt(minLevel) : minLevel
  return {
    catch: err => logLevelsObject.error >= level && next.catch(err),
    debug: (msg, data) => logLevelsObject.debug >= level && next.debug(msg, data),
    error: (msg, data) => logLevelsObject.error >= level && next.error(msg, data),
    info: (msg, data) => logLevelsObject.info >= level && next.info(msg, data),
    warn: (msg, data) => logLevelsObject.warn >= level && next.warn(msg, data)
  }
}

export const withData = (next: Adapter, alwaysData: DataObject): Logger => {
  const update = (data?: DataObject) => {
    if (data !== undefined) return { ...alwaysData, ...data }
    return { ...alwaysData }
  }
  return {
    catch: err => {
      const [msg, data] = parseError(err)
      next.error(msg, update(data))
    },
    debug: (msg, data) => next.debug(msg, update(data)),
    error: (msg, data) => next.error(msg, update(data)),
    info: (msg, data) => next.info(msg, update(data)),
    warn: (msg, data) => next.warn(msg, update(data))
  }
}

export const withName = (next: Adapter, loggerName: string): Logger => withData(next, { loggerName })

export const withoutData = (next: Adapter, neverData: string[]): Logger => {
  const cleanup = (data?: DataObject) => {
    if (data === undefined) return undefined
    const safeKeys = Object.keys(data).filter(k => neverData.indexOf(k) === -1)
    if (safeKeys.length === 0) return undefined
    return safeKeys.reduce((a, b) => ({ ...a, [b]: data[b] }), {} as DataObject)
  }

  return {
    catch: err => {
      const [msg, data] = parseError(err)
      next.error(msg, cleanup(data))
    },
    debug: (msg, data) => next.debug(msg, cleanup(data)),
    error: (msg, data) => next.error(msg, cleanup(data)),
    info: (msg, data) => next.info(msg, cleanup(data)),
    warn: (msg, data) => next.warn(msg, cleanup(data))
  }
}
