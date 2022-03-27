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
import { XpraWorkerError } from '../errors'
import { XpraPacketWorker, XpraDecodeWorker } from '../io/worker'
import {
  XpraConnectionOptions,
  XpraSendPacket,
  XpraRecievePacket,
  XpraWorkerMessage,
  XpraWorkerData,
  XpraCipherCapability,
  XpraCapabilities,
  XpraServerCapabilities,
  XpraDraw,
} from '../types'

export type XpraWorkerMessagePacket = [XpraWorkerMessage, XpraWorkerData]

export type XpraWorkerProxyEventEmitters = {
  recieve: (packet: XpraRecievePacket) => void
  send: (data: ArrayBuffer) => void
  draw: (draw: XpraDraw, buffer: ImageBitmap | null) => void
  failure: (error: Error) => void
}

/**
 * A proxy to handle messaging between the client and a worker
 * @noInheritDoc
 */
export class XpraWorkerProxy extends (EventEmitter as unknown as new () => TypedEmitter<XpraWorkerProxyEventEmitters>) {
  private packetWorker: Worker | XpraPacketWorker | null = null
  private decodeWorker: Worker | XpraDecodeWorker | null = null

  constructor() {
    super()

    this.onWorkerMessage = this.onWorkerMessage.bind(this)
    this.onWorkerError = this.onWorkerError.bind(this)
  }

  private postPacketMessage(msg: XpraWorkerMessage, data: XpraWorkerData) {
    if (this.packetWorker) {
      this.packetWorker.postMessage([msg, data])
    }
  }

  private postDecoderMessage(data: XpraDraw) {
    if (this.decodeWorker) {
      this.decodeWorker.postMessage(['decode', data])
    }
  }

  private onMessage(msg: XpraWorkerMessage, data: XpraWorkerData) {
    switch (msg) {
      case 'send':
        this.emit('send', data as ArrayBuffer)
        break

      case 'recieve':
        this.emit('recieve', data as XpraRecievePacket)
        break

      case 'imagedata':
        const [draw, buffer] = data
        this.emit('draw', draw, buffer)
        break

      case 'failure':
        const [msg, stack] = data as [string, string]
        const err = new XpraWorkerError(`${msg} | ${stack}`)
        this.emit('failure', err)
    }
  }

  private onWorkerMessage(ev: MessageEvent) {
    const [msg, data] = ev.data as XpraWorkerMessagePacket
    this.onMessage(msg, data)
  }

  private onWorkerError(ev: ErrorEvent) {
    this.emit('failure', ev as unknown as Error)
  }

  setDecodeWorker(worker: Worker | XpraDecodeWorker) {
    this.decodeWorker = worker
    this.decodeWorker.addEventListener('message', this.onWorkerMessage)
    this.decodeWorker.addEventListener('error', this.onWorkerError)
  }

  setWorker(worker: Worker | XpraPacketWorker) {
    this.packetWorker = worker
    this.packetWorker.addEventListener('message', this.onWorkerMessage)
    this.packetWorker.addEventListener('error', this.onWorkerError)
  }

  setupRecieveCipher(capabilities: XpraCapabilities, key: string) {
    const caps = Object.fromEntries(
      Object.entries(capabilities).filter(([k]) => k.startsWith('cipher'))
    )

    this.postPacketMessage('cipher', ['in', caps, key])
  }

  setupSendCipher(
    capabilities: XpraCipherCapability | XpraServerCapabilities,
    key: string
  ) {
    const caps = Object.fromEntries(
      Object.entries(capabilities).filter(([k]) => k.startsWith('cipher'))
    )

    this.postPacketMessage('cipher', ['out', caps, key])
  }

  configure(options: XpraConnectionOptions) {
    this.postPacketMessage('configure', options)
    this.postPacketMessage('cipher', [])
  }

  setConnected(connected: boolean) {
    this.postPacketMessage('connected', connected)
  }

  pushSend(packet: XpraSendPacket) {
    this.postPacketMessage('send', packet)
  }

  pushRecieve(data: Uint8Array) {
    this.postPacketMessage('recieve', data)
  }

  pushDecode(data: XpraDraw) {
    this.postDecoderMessage(data)
  }
}
