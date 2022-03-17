/**
 * Xpra Typescript Client
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 */

import TypedEmitter from 'typed-emitter'
import EventEmitter from 'events'
import { XpraConnectionError } from '../errors'
import { XpraConnectionOptions } from '../types'
import { XPRA_CLOSE_CODES } from '../constants'

export type XpraConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'

export type XpraWebsocketEventEmitters = {
  open: () => void
  close: (reason?: Error) => void
  error: (error: Error) => void
  message: (message: Uint8Array) => void
  connect: (status: XpraConnectionStatus) => void
  disconnect: (status: XpraConnectionStatus) => void
}

export function createXpraCloseError(ev: CloseEvent | Event): Error {
  if (ev instanceof CloseEvent) {
    const { code, reason } = ev
    const prefix = XPRA_CLOSE_CODES[code]
      ? `'${XPRA_CLOSE_CODES[code]}' (${code})`
      : String(code)

    const suffix = reason ? `: '${reason}'` : ''

    return new XpraConnectionError(prefix + suffix)
  }

  return new XpraConnectionError('unknown error')
}

/**
 * Connection websocket abstraction to handle reconnects etc.
 * @noInheritDoc
 */
export class XpraWebsocket extends (EventEmitter as unknown as new () => TypedEmitter<XpraWebsocketEventEmitters>) {
  private ws: WebSocket | null = null
  private connectionStatus: XpraConnectionStatus = 'disconnected'
  private reconnectTimeout = 0
  private reconnectAttempt = 0
  private maxReconnectAttempts = 3
  private reconnectIntervalTime = 5 * 1000
  private host = ''

  send(message: string | Uint8Array | ArrayBufferLike) {
    if (this.ws) {
      this.ws.send(message)
    }
  }

  connect(host: string, options?: XpraConnectionOptions) {
    const reconnecting = this.connectionStatus === 'reconnecting'
    const ws = new WebSocket(host, 'binary')

    console.info('Connecting websocket', host, this.connectionStatus)

    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      console.info('Opened websocket')
      this.connectionStatus = 'connected'
      this.emit('open')
    }

    ws.onclose = (ev: CloseEvent) => {
      console.info('Closed websocket')
      this.connectionStatus = 'disconnected'
      this.emit('close', createXpraCloseError(ev))
    }

    ws.onerror = (ev: Event) => {
      this.emit('error', createXpraCloseError(ev))
    }

    ws.onmessage = (ev) => {
      const q = new Uint8Array(ev.data)
      this.emit('message', q)
    }

    if (!reconnecting) {
      this.reconnectAttempt = 0
    }

    if (options) {
      this.maxReconnectAttempts = options.reconnectAttempts
      this.reconnectIntervalTime = options.reconnectInterval
    }

    this.ws = ws
    this.host = host
    this.clearTimers()
    this.emit('connect', this.connectionStatus)
  }

  disconnect(reconnect = false) {
    if (reconnect && this.connectionStatus === 'reconnecting') {
      return
    }

    console.info('Disconnect websocket')

    this.clearTimers()
    this.connectionStatus = reconnect ? 'reconnecting' : 'disconnected'

    if (this.ws) {
      this.ws.onopen = null
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.onmessage = null
      this.ws.close()
    }

    this.ws = null

    if (reconnect) {
      if (this.reconnectAttempt >= this.maxReconnectAttempts) {
        this.disconnect(false)
      } else {
        this.reconnectAttempt++

        this.reconnectTimeout = setTimeout(
          () => this.connect(this.host),
          this.reconnectIntervalTime
        ) as unknown as number
      }
    }

    this.emit('disconnect', this.connectionStatus)
  }

  private clearTimers() {
    clearTimeout(this.reconnectTimeout)
  }

  get connected() {
    return !!this.ws
  }

  get status() {
    return this.connectionStatus
  }
}
