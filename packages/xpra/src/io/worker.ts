/**
 * Xpra Typescript Client
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 *
 * ---
 *
 * Based on original Xpra source
 * @copyright Copyright (C) 2016-2022 Antoine Martin <antoine@devloop.org.uk>
 * @license Licensed under MPL 2.0, see: http://www.mozilla.org/MPL/2.0/
 * @link https://github.com/Xpra-org/xpra-html5
 */

import TypedEmitter from 'typed-emitter'
import EventEmitter from 'events'
import { XpraSendQueue } from './queues/send'
import { XpraRecieveQueue } from './queues/recieve'
import { XpraDecodeQueue } from './queues/decode'
import {
  XpraRecievePacket,
  XpraWorkerMessage,
  XpraWorkerData,
  XpraDraw,
} from '../types'

/**
 * Events emitted from the null worker to simulate a web worker
 */
export type XpraWorkerEventEmitters = {
  post: (data: XpraWorkerData) => void
  message: (data: XpraWorkerData) => void
  error: (error: string) => void
}

/**
 * Base abstraction for Xpra Workers
 * @noInheritDoc
 */
export abstract class XpraWorker extends (EventEmitter as unknown as new () => TypedEmitter<XpraWorkerEventEmitters>) {
  /* istanbul ignore next */

  /** @virtual */
  protected init() {
    /* */
  }

  /** @virtual */
  protected send(_cmd: string, _data: XpraWorkerData) {
    /* */
  }

  /** @virtual */
  protected setConnected(_connected: boolean) {
    /* */
  }

  protected processMessage(cmd: XpraWorkerMessage, data: XpraWorkerData) {
    switch (cmd) {
      case 'connected':
        this.setConnected(data)
        break
    }
  }

  /** behave like a WebWorker instance */
  addEventListener(
    name: keyof XpraWorkerEventEmitters,
    cb: (...args: any) => void
  ) {
    this.on(name, (data: any) => cb({ data }))
  }

  /** behave like a WebWorker instance */
  postMessage(message: any) {
    this.emit('post', message)
  }
}

/**
 * Base class for handling decoding queues
 */
export abstract class XpraDecodeWorker extends XpraWorker {
  private queue = new XpraDecodeQueue()

  constructor() {
    super()

    this.queue.on(
      'message',
      (message: [XpraDraw, ImageData | ImageBitmap | null]) => {
        this.send('imagedata', message)
      }
    )

    this.init()
  }

  protected setConnected(connected: boolean) {
    this.queue.setConnected(connected)
    this.queue.clear()
  }

  protected processMessage(cmd: XpraWorkerMessage, data: XpraWorkerData) {
    super.processMessage(cmd, data)

    switch (cmd) {
      case 'decode':
        this.queue.push(data)
        this.queue.process()
        break
    }
  }
}

/**
 * Base class for handling websocket message queues
 */
export abstract class XpraPacketWorker extends XpraWorker {
  private sendQueue = new XpraSendQueue()
  private recieveQueue = new XpraRecieveQueue()

  constructor() {
    super()

    this.sendQueue.on('message', (message: ArrayBufferLike) => {
      this.send('send', message)
    })

    this.recieveQueue.on('failure', (error: Error) => {
      this.send('failure', [error.message, error.stack])
    })

    this.recieveQueue.on('message', (message: XpraRecievePacket) => {
      this.send('recieve', message)
    })

    this.init()
  }

  protected setConnected(connected: boolean) {
    this.sendQueue.setConnected(connected)
    this.sendQueue.clear()

    this.recieveQueue.setConnected(connected)
    this.recieveQueue.clear()
  }

  protected processMessage(cmd: XpraWorkerMessage, data: XpraWorkerData) {
    super.processMessage(cmd, data)

    switch (cmd) {
      case 'send':
        this.sendQueue.push(data)
        this.sendQueue.process()
        break

      case 'recieve':
        this.recieveQueue.push(data)
        this.recieveQueue.process()
        break

      case 'configure':
        this.sendQueue.configure(data)
        this.recieveQueue.configure(data)
        break

      case 'cipher':
        if (data.length) {
          const [type, caps, key] = data
          if (type === 'out') {
            this.sendQueue.setupCipher(caps, key)
          } else if (type === 'in') {
            this.recieveQueue.setupCipher(caps, key)
          }
        } else {
          this.sendQueue.clearCipher()
          this.recieveQueue.clearCipher()
        }
        break
    }
  }
}
