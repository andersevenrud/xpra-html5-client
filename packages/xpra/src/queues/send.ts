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

import forge from 'node-forge'
import { ord } from '../lib/bencode'
import { createXpraCipher, encryptXpraPacketData } from '../connection/crypto'
import { encodeXpraPacket } from '../connection/encoding'
import { XpraQueue } from '../connection/queue'
import {
  XpraSendPacket,
  XpraPacketEncoder,
  XpraConnectionOptions,
  XpraCipherCapability,
} from '../types'

/**
 * Processes packets that is to be sent to a Xpra server
 */
export class XpraSendQueue extends XpraQueue<XpraSendPacket, ArrayBufferLike> {
  private packetEncoder: XpraPacketEncoder = 'bencode'

  setupCipher(caps: XpraCipherCapability, key: string) {
    const { iv, mode, cipher, secret, blockSize } = createXpraCipher(caps, key)
    this.cipherBlockSize = blockSize
    this.cipher = forge.cipher.createCipher(`${cipher}-${mode}`, secret)
    this.cipher.start({ iv })
  }

  process() {
    while (this.queue.length > 0 && this.connected) {
      if (!this.processNext()) {
        break
      }
    }
  }

  private processNext() {
    const packet = this.queue.shift()
    if (packet) {
      if (this.debugPackets.includes(packet[0])) {
        console.debug('XpraSendQueue#processNext', packet)
      }

      try {
        const sendData = this.createSendData(packet)
        this.emit('message', sendData.buffer)
      } catch (e) {
        console.error(e)
      }

      return true
    }

    return false
  }

  private createSendData(packet: XpraSendPacket) {
    let [data, flags] = encodeXpraPacket(packet, this.packetEncoder)
    const size = data.length

    if (this.cipher) {
      flags |= 0x2
      data = encryptXpraPacketData(
        data,
        size,
        this.cipherBlockSize,
        this.cipher
      )
    }

    const actualSize = data.length
    const sendData = new Uint8Array(actualSize + 8)
    const level = 0

    sendData[0] = 'P'.charCodeAt(0)
    sendData[1] = flags
    sendData[2] = level
    sendData[3] = 0

    for (let i = 0; i < 4; i++) {
      sendData[7 - i] = (size >> (8 * i)) & 0xff
    }

    if (data instanceof Uint8Array) {
      sendData.set(data, 8)
    } else {
      for (let i = 0; i < actualSize; i++) {
        sendData[8 + i] = ord(data[i])
      }
    }

    return sendData
  }

  configure(options: XpraConnectionOptions) {
    super.configure(options)

    this.packetEncoder = options.encoder
  }
}
