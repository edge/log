<img src="https://cdn.edge.network/assets/img/edge-logo-green.svg" width="200">

# Log

Logging utility library with powerful adaptor middleware.

[![npm version](https://img.shields.io/npm/v/@edge/log)](https://www.npmjs.com/package/@edge/log) [![npm downloads](https://img.shields.io/npm/dt/@edge/log)](https://www.npmjs.com/package/@edge/log) [![license](https://img.shields.io/npm/l/@edge/log)](LICENSE.md)

- [Log](#log)
  - [Usage](#usage)
    - [Basic usage](#basic-usage)
    - [Full usage](#full-usage)
    - [Log levels](#log-levels)
    - [Name](#name)
    - [Context](#context)
      - [Per message context](#per-message-context)
      - [Per instance context](#per-instance-context)
      - [Merging contexts](#merging-contexts)
  - [Adaptors](#adaptors)
    - [LogtailAdaptor](#logtailadaptor)
    - [StdioAdaptor](#stdioadaptor)
    - [Using multiple adaptors](#using-multiple-adaptors)
    - [Custom adaptors](#custom-adaptors)
  - [License](#license)

## Usage

The `@edge/log` package uses [adaptors](#adaptors) that act as logging middleware. The most basic adaptor is the standard input/output adaptor `StdioAdaptor` which essentially acts like an enhanced console log. Adaptors can be configured and passed in at instantiation, along with the optional parameters _name_, _level_, and _context_, or attached with the `use(adaptor)` method.

Install with NPM:

```bash
$ npm install @edge/log --save
```

### Basic usage

This example shows basic console logging.

Note, the default log level is `Info` so you won't see the debug message:

```ts
import { Log, StdioAdaptor } from '@edge/log'

const log = new Log()

log.use(new StdioAdaptor())

log.debug('debugging')
log.info('for your information')
log.warn('achtung! warning!')
log.error('unfortunately, an error occurred')
```

<img src="https://user-images.githubusercontent.com/1639527/136059420-5fd98ecd-66fe-4bc5-88f4-c0e87b64712e.png" width="750">

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
log.info('example', { cool: true })
```

<img src="https://user-images.githubusercontent.com/1639527/136059701-197cb6ae-3c18-43bf-8ace-3c7de4dbd52c.png" width="750">

### Log levels

There are four log levels, exposed via the `LogLevel` type.

```ts
export enum LogLevel { Debug, Info, Warn, Error }
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

<img src="https://user-images.githubusercontent.com/1639527/136059808-937e863a-3d82-4fa2-b5ca-67a9927f071d.png" width="750">

You can change the log level at runtime by using the `setLogLevel(level)` method:

```ts
import { Log, LogLevel, StdioAdaptor } from '@edge/log'

const log = new Log(LogLevel.Warn)

log.use(new StdioAdaptor())

log.debug('you won\'t see me')

log.setLogLevel(LogLevel.Info)
log.info('but you will see me now')
```

<img src="https://user-images.githubusercontent.com/1639527/136059924-7bb918c5-0379-4364-9cdf-72da42992e95.png" width="750">

### Name

You can assign a name to `Log` instances, for example:

```ts
const log = new Log('readme')

log.use(new StdioAdaptor())

log.info('this is an example')
```

<img src="https://user-images.githubusercontent.com/1639527/136044478-048f88f5-5e7e-4bb0-b54d-fd15c7e8255f.png" width="750">

You can extend the name with the `extend` method:

```ts
const log = new Log('readme')

log.use(new StdioAdaptor())

log.info('this is an example')

const eventLog = log.extend('event')
eventLog.info('the name of this log will be readme:event')
```

<img src="https://user-images.githubusercontent.com/1639527/136044704-0badf479-aa27-436f-9dc7-1ba4bce4402f.png" width="750">

### Context

You can pass in context along with your log message. In the case of `StdioAdaptor`, this is stringified and output. For `LogtailAdaptor`, it is passed along to Logtail. How it is utilised in down to the adaptors. You can also attach context to a `Log` instance itself, therefore including it with every message.

#### Per message context

For example, you could attach debug data to a message:

```ts
const log = new Log([ new StdioAdaptor() ], LogLevel.Debug)

log.debug('debug context example', { debugData: [1, 2, 3] })
```

<img src="https://user-images.githubusercontent.com/1639527/136061977-c37ed920-5905-4dd0-aaaa-9329ae584e61.png" width="750">

Or perhaps an error:

```ts
try {
  // imagine something bad happens here
  throw new Error('something bad happened')
}
catch (err: any) {
  if (err instanceof Error) log.error('an error was caught', err)
  else log.error('an unknown error was caught')
}
```

<img src="https://user-images.githubusercontent.com/1639527/136062224-9dd3ed86-d32b-4bde-997b-0a6e0c907a3e.png" width="750">

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

log.info('example')
```

<img src="https://user-images.githubusercontent.com/1639527/136058727-5343fef4-ac70-4f89-9fad-2d3c7c7214fb.png" width="750">

Or by extending an existing `Log` instance:

```ts
import { Log, StdioAdaptor } from '@edge/log'

const log = new Log()
log.use(new StdioAdaptor())

const event = { eventID: 528 }
const eventLog = log.extend(event)

eventLog.info('event started')
```

<img src="https://user-images.githubusercontent.com/1639527/136059012-139df9f4-7c5d-4411-a6ff-ce69cbdbabcc.png" width="750">

#### Merging contexts

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
  instance: 'ed5eb32b',
  someFlag: true
}
```

Then the `eventLog` instance would have the context:

```ts
{
  instance: 'ed5eb32b',
  someFlag: true,
  eventName: 'testEvent'
}
```

And the info message would have the context:

```ts
{
  instance: 'ed5eb32b',
  someFlag: true,
  eventName: 'testEvent',
  eventStartDate: '2021-10-04T20:16:49.988Z'
}
```

## Adaptors

Adaptors form the powerful middleware layer of `@edge/log`. At their most basic, they are objects with four methods: `debug`, `info`, `warn`, and `error`, and each of these methods take three parameters: the `Log` instance, a log message as a string, and an optional context object. See [custom adaptors](#custom-adaptors) below for more details.

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

<img src="https://user-images.githubusercontent.com/1639527/136059262-fd10e074-4d5c-4e6d-9f0b-819cd299f43e.png" width="750">

## License

Edge is the infrastructure of Web3. A peer-to-peer network and blockchain providing high performance decentralised web services, powered by the spare capacity all around us.

Copyright notice
(C) 2021 Edge Network Technologies Limited <support@edge.network><br />
All rights reserved

This product is part of Edge.
Edge is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version ("the GPL").

**If you wish to use Edge outside the scope of the GPL, please contact us at licensing@edge.network for details of alternative license arrangements.**

**This product may be distributed alongside other components available under different licenses (which may not be GPL). See those components themselves, or the documentation accompanying them, to determine what licenses are applicable.**

Edge is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

The GNU General Public License (GPL) is available at: https://www.gnu.org/licenses/gpl-3.0.en.html<br />
A copy can be found in the file GPL.md distributed with
these files.

This copyright notice MUST APPEAR in all copies of the product!
