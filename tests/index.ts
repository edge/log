// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { Log, LogContext, StdioAdaptor } from '../lib'

// this is not a 'proper' test script at this stage, as it does not handle pass/failure cases;
// it is just here to provide test logging output for inspection

const log = new Log()
log.use(new StdioAdaptor())

const messages: [string, LogContext?][] = [
  ['abc'],
  ['def', { value1: 'xyz', value2: Math.random() }],
  ['ghi', {}],
  ['jkl', {
    value1: Math.random(),
    time: Date.now(),
    value2: Math.random(),
    value3: Math.random(),
    randint: Math.floor(Math.random() * 1e6),
    value4: 'zyx'
  }],
  ['mno', 'unnamed value']
]

messages.forEach(([msg, ctx]) => {
  log.debug(msg, ctx)
  log.info(msg, ctx)
  log.warn(msg, ctx)
  log.error(msg, ctx)
})
