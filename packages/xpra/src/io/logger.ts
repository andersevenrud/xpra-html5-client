/**
 * Xpra Typescript Client
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import TypedEmitter from 'typed-emitter'
import EventEmitter from 'events'
import { XpraLogLevel } from '../types'

// eslint-disable-next-line
export type XpraLoggerArguments = any[]

export type XpraLoggerType = 'log' | 'info' | 'warn' | 'error' | 'debug'

export type XpraLoggerEventEmitters = {
  log: (level: XpraLogLevel, args: XpraLoggerArguments) => void
}

const mapped: Record<XpraLoggerType, XpraLogLevel> = {
  log: XpraLogLevel.INFO,
  info: XpraLogLevel.INFO,
  warn: XpraLogLevel.WARNING,
  error: XpraLogLevel.ERROR,
  debug: XpraLogLevel.DEBUG,
}

/**
 * @noInheritDoc
 */
export class XpraLogger extends (EventEmitter as unknown as new () => TypedEmitter<XpraLoggerEventEmitters>) {
  log(...args: XpraLoggerArguments) {
    this.perform('log', args)
  }

  info(...args: XpraLoggerArguments) {
    this.perform('info', args)
  }

  warn(...args: XpraLoggerArguments) {
    this.perform('warn', args)
  }

  error(...args: XpraLoggerArguments) {
    this.perform('error', args)
  }

  debug(...args: XpraLoggerArguments) {
    this.perform('debug', args)
  }

  private perform(level: XpraLoggerType, args: XpraLoggerArguments) {
    const cons = console[level]
    const actual = mapped[level]
    cons.apply(cons, ['-->', ...args])
    this.emit('log', actual, args)
  }
}
