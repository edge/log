<img src="https://cdn.edge.network/assets/img/edge-logo-green.svg" width="200">

# Log

Logging utility library

## Usage

The `@edge/log` package uses [adaptors](#adaptors) that act as logging middleware. The most basic adaptor is the standard input/output adaptor `StdioAdaptor` which essentially acts like an enhanced console log. Adaptors can be configured and passed in at instantiation, along with the optional parameters _name_, _level_, and _context_, or attached with the `use(adaptor)` method.

### Basic Usage

This example shows basic console logging:

```ts
import { Log, StdioAdaptor } from '@edge/log'

const log = new Log()

log.use(new StdioAdaptor())

log.debug('debugging')
log.info('for your information')
log.warn('achtung! warning!')
log.error('unfortunately, an error occurred')
```

### Full usage

It is possible to use any number of parameters when instantiating the log:

```ts
import { Log, LogLevel, LogtailAdaptor, StdioAdaptor } from '@edge/log'

const name = 'example'
const level = LogLevel.Debug
const context = { timestamp: Date.now() }

const stdioAdaptor = new StdioAdaptor()
const logtailAdaptor = new LogtailAdaptor(process.env.LOGTAIL_SOURCE_TOKEN)
const adaptors = [ stdioAdaptor, logtailAdaptor ]

const log = new Log(adaptors, name, level, context)
log.info('this is a full usage example', { isItCool: true })
```

### Log levels

There are four log levels, exposed via the `LogLevel` type.

```ts
export enum LogLevel {
  Debug,
  Info,
  Warn,
  Error
}
```

The default `LogLevel` is `Info`, but you can set this when creating your `Log` instance. All messages equal to and greater than the current log level will be processed, and the others will be ignored.

```ts
import { Log, LogLevel, StdioAdaptor } from '@edge/log'

const log = new Log(LogLevel.Warn)

log.use(new StdioAdaptor())

log.debug('you won\'t see me')
log.info('or me')
log.warn('but you will see me')
log.error('and me')
```

You can change the log level at runtime by using the `setLogLevel(level)` method:

```ts
import { Log, LogLevel, StdioAdaptor } from '@edge/log'

const log = new Log(LogLevel.Warn)

log.use(new StdioAdaptor())

log.debug('you won\'t see me')

log.setLogLevel(LogLevel.Info)
log.info('but you will see me now')
```

### Name

You can assign a name to `Log` instances, for example:

```ts
const log = new Log('readme')

log.use(new StdioAdaptor())

log.debug('this is an example')
```

You can extend the name with the `extend` method:

```ts
const log = new Log('readme')

log.use(new StdioAdaptor())

const eventLog = log.extend('event')
eventLog.info('the name of this log will be readme:event')
```

### Context

You can pass in context along with your log message. In the case of `StdioAdaptor`, this is stringified and output. For `LogtailAdaptor`, it is passed along to Logtail. How it is utilised in down to the adaptors. You can also attach context to a `Log` instance itself, therefore including it with every message.

#### Per message context

For example, you could attach debug data to a message:

```ts
const data = { ... }

log.debug('debug context example', data)
```

Or perhaps an error:

```ts
try {
  // imagine something bad happens here
}
catch (e) {
  log.error('an error was caught', e)
}
```

#### Per instance context

Context can also be attached to the `Log` instance itself, so that it is included with every message. This can be done in one of two ways.

At instantiation:

```ts
import { Log, StdioAdaptor } from '@edge/log'

const log = new Log({
  instance: generateInstanceID(),
  someFlag: true
})

log.use(new StdioAdaptor())

log.debug('debugging')
```

Or by extending an existing `Log` instance:

```ts
import { Log, StdioAdaptor } from '@edge/log'

const log = new Log()
log.use(new StdioAdaptor())

const eventLog = log.extend(event)

eventLog.info('event started')
```

#### Merging contexts

Contexts are automatically merged. This means you can extend a `Log` instance with some context, then add to it within a message, and also extend it with further context.

```ts
import { Log, StdioAdaptor } from '@edge/log'

const log = new Log({
  instance: generateInstanceID(),
  someFlag: true
})

log.use(new StdioAdaptor())

const eventLog = log.extend({ eventName: 'testEvent' })

eventLog.info('event started', { eventStartDate: new Date() })
```

The above example would start with the `log` instance and the context:

```ts
{
  instance: 'ed5eb32b-3e40-4d73-a77b-9a223387e9f0',
  someFlag: true
}
```

Then the `eventLog` instance would have the context:

```ts
{
  instance: 'ed5eb32b-3e40-4d73-a77b-9a223387e9f0',
  someFlag: true,
  eventName: 'testEvent'
}
```

And the info message would have the context:

```ts
{
  instance: 'ed5eb32b-3e40-4d73-a77b-9a223387e9f0',
  someFlag: true,
  eventName: 'testEvent',
  eventStartDate: '2021-10-04T20:16:49.988Z'
}
```

## Adaptors



### LogtailAdaptor

`LogtailAdaptor` pushes your log messages to [Logtail](https://logtail.com/). For this, you'll need an API key, or what Logtail call a Source Token.

It takes two parameters, `logtailSourceToken` and an optional `enableNameInjection` (default: `true`).

Usage:

```
const log = new Log()
const logtail = new LogtailAdaptor(process.env.LOGTAIL_SOURCE_TOKEN)
log.use(logtail)
```

> Note: if you set a [Name](#names) on the `Log` instance, the Logtail adaptor will inject this into the context that it uploads. Avoid setting a `name` field on the root of the context object or disable name injection like so:

```
const log = new Log()
const logtail = new LogtailAdaptor(process.env.LOGTAIL_SOURCE_TOKEN, false)
log.use(logtail)
```

### StdioAdaptor

`StdioAdaptor` is a simple adaptor that outputs logs to stdout (and if you configure it, stderr).

It takes one parameter, `useStderr`. If this is set, errors will be written to stderr instead of stdout.

```
// Errors will be written to stdout
const stdoutOnly = new StdioAdaptor()

// Errors will be written to stdout
const stderrToo = new StdioAdaptor(true)
```

### Using multiple adaptors

You can easily use multiple adaptors. You can either pass them in at instantiation:

```ts
import { Log, LogtailAdaptor, StdioAdaptor } from '@edge/log'

const log = new Log([
  new StdioAdaptor(),
  new LogtailAdaptor(process.env.LOGTAIL_SOURCE_TOKEN)
])

log.debug('debugging')
```

Or attach them with the `use` method:

```ts
import { Log, LogtailAdaptor, StdioAdaptor } from '@edge/log'

const log = new Log()
log.use(new StdioAdaptor())
log.use(new LogtailAdaptor(process.env.LOGTAIL_SOURCE_TOKEN))

log.debug('debugging')
```

### Custom adaptors

It is possible, encouraged even, to write and use custom adaptors. Adaptors must conform to the following type, which simply has four methods.

```ts
export type Adaptor = {
  debug: (log: Log, message: string, context?: Record<string, unknown>) => void
  info: (log: Log, message: string, context?: Record<string, unknown>) => void
  warn: (log: Log, message: string, context?: Record<string, unknown>) => void
  error: (log: Log, message: string, context?: Record<string, unknown>) => void
}
```

For example

```ts

import { Adaptor, Log } from '@edge/log'

class ConsoleLogAdaptor implements Adaptor {
  debug(log: Log, message: string, context?: Record<string, unknown>): void {
    console.log('DEBUG', message, log.name, context)
  }

  info(log: Log, message: string, context?: Record<string, unknown>): void {
    console.log('INFO', message, log.name, context)
  }

  warn(log: Log, message: string, context?: Record<string, unknown>): void {
    console.log('WARN', message, log.name, context)
  }

  error(log: Log, message: string, context?: Record<string, unknown>): void {
    console.log('ERROR', message, log.name, context)
  }
}

const log = new Log('custom log example')
log.use(new ConsoleLogAdaptor())
log.info('hello from the console')
```