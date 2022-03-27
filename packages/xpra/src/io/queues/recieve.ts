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
import { ord } from '../../lib/bencode'
import { XpraQueue } from '../queue'
import { decodeXpraPacketData } from '../../connection/encoding'
import { XpraInvalidHeaderError, XpraPacketError } from '../../errors'
import { decompressXpraPacketData } from '../../connection/compression'
import {
  uint8fromStringOrString,
  uint8fromStringOrUint8,
} from '../../utils/data'
import {
  createXpraCipher,
  decryptXpraPacketData,
} from '../../connection/crypto'
import {
  XpraRecieveHeader,
  XpraRecievePacket,
  XpraRecievePacketType,
  XpraCipherCapability,
  XpraInflateBit,
} from '../../types'

/**
 * Processes packets that comes from an Xpra server
 */
export class XpraRecieveQueue extends XpraQueue<Uint8Array, XpraRecievePacket> {
  private header: XpraRecieveHeader = []
  private raw: Uint8Array[] = []
  private busy = false

  setupCipher(caps: XpraCipherCapability, key: string) {
    const { iv, mode, cipher, secret, blockSize } = createXpraCipher(caps, key)
    this.cipherBlockSize = blockSize
    this.cipher = forge.cipher.createDecipher(
      `${cipher}-${mode}` as forge.cipher.Algorithm,
      secret
    )
    this.cipher.start({ iv })
  }

  process() {
    if (this.queue.length > 0 && !this.busy) {
      try {
        this.busy = true
        while (this.connected && this.processNext()) {}
      } catch (e) {
        this.emit('failure', e as Error)
      } finally {
        this.busy = false
      }
    }
  }

  clear() {
    super.clear()
    this.header = []
    this.raw = []
  }

  private processNext() {
    if (!this.processPacketHeader()) {
      return false
    }

    const [
      protoFlags,
      level,
      index,
      protoCrypto,
      packetSize,
      padding,
      realSize,
    ] = this.parsePacketHeader()

    if (realSize < packetSize) {
      return false
    }

    this.header = []

    let packetData: Uint8Array
    try {
      packetData = this.processPacketData(
        packetSize,
        protoCrypto,
        padding,
        level
      ) as Uint8Array
    } catch (e) {
      console.error('eror processing packet', e)
      this.raw = []
      return this.queue.length > 0
    }

    if (index > 0) {
      this.raw[index] = packetData

      const len = this.raw.filter((r) => r !== undefined).length
      if (len >= 4) {
        throw new XpraPacketError('too many raw packets: ' + len)
      }
    } else {
      let packet
      try {
        packet = decodeXpraPacketData(packetData, protoFlags)
        for (const index in this.raw) {
          packet[index] = this.raw[index]
        }

        this.raw = []
      } catch (e) {
        // FIXME: maybe we should error out and disconnect here?
        console.error('error decoding packet', e, packet)
        this.raw = []
        return this.queue.length > 0
      }

      try {
        packet = this.fixPacketData(packet)

        if (this.debugPackets.includes(packet[0])) {
          console.debug('XpraRecieveQueue#processNext', packet)
        }

        this.emit('message', packet)
      } catch (e) {
        // FIXME: maybe we should error out and disconnect here?
        console.error('error fixing packet', e, packet)
      }
    }

    return this.queue.length > 0
  }

  private processPacketHeader() {
    if (this.header.length < 8 && this.queue.length > 0) {
      while (this.header.length < 8 && this.queue.length > 0) {
        const slice = this.queue[0]
        const needed = 8 - this.header.length
        const n = Math.min(needed, slice.length)
        for (let i = 0; i < n; i++) {
          this.header.push(slice[i])
        }

        if (slice.length > needed) {
          this.queue[0] = slice.subarray(n)
        } else {
          this.queue.shift()
        }
      }

      this.checkPacketHeader()
    }

    return this.header.length >= 8
  }

  private checkPacketHeader() {
    if (this.header[0] !== ord('P')) {
      let msg = 'invalid packet header format: ' + this.header[0]
      if (this.header.length > 1) {
        let hex = ''
        for (let p = 0; p < this.header.length; p++) {
          const v = this.header[p].toString(16)
          if (v.length < 2) {
            hex += '0' + v
          } else {
            hex += v
          }
        }
        msg += ': 0x' + hex
      }

      throw new XpraInvalidHeaderError(msg)
    }
  }

  private parsePacketHeader() {
    let protoFlags = this.header[1]
    const level = this.header[2]
    const index = this.header[3]
    const protoCrypto = protoFlags & 0x2

    if (protoCrypto) {
      protoFlags = protoFlags & ~0x2
    }

    if (protoFlags & 0x8) {
      protoFlags = protoFlags & ~0x8
    }

    if (protoFlags > 1 && protoFlags !== 0x10) {
      throw new XpraInvalidHeaderError(
        `we can't handle this protocol flag yet: ${protoFlags}`
      )
    }

    if (level & XpraInflateBit.LZO) {
      throw new XpraInvalidHeaderError('lzo compression is not supported')
    }

    if (index >= 20) {
      throw new XpraInvalidHeaderError(`invalid packet index: ${index}`)
    }

    let packetSize = 0
    for (let i = 0; i < 4; i++) {
      packetSize = packetSize * 0x100
      packetSize += this.header[4 + i]
    }

    let padding = 0
    if (protoCrypto && this.cipherBlockSize > 0) {
      padding = this.cipherBlockSize - (packetSize % this.cipherBlockSize)
      packetSize += padding
    }

    let realSize = 0
    for (let i = 0, j = this.queue.length; i < j; ++i) {
      realSize += this.queue[i].length
    }

    return [
      protoFlags,
      level,
      index,
      protoCrypto,
      packetSize,
      padding,
      realSize,
    ]
  }

  private processPacketData(
    packetSize: number,
    protoCrypto: number,
    padding: number,
    level: number
  ) {
    let packetData
    if (this.queue[0].length === packetSize) {
      packetData = this.queue.shift()
    } else {
      packetData = new Uint8Array(packetSize)
      let rsize = 0

      while (rsize < packetSize) {
        const slice = this.queue[0]
        const needed = packetSize - rsize

        if (slice.length > needed) {
          packetData.set(slice.subarray(0, needed), rsize)
          rsize += needed
          this.queue[0] = slice.subarray(needed)
        } else {
          packetData.set(slice, rsize)
          rsize += slice.length
          this.queue.shift()
        }
      }
    }

    if (protoCrypto && packetData) {
      if (this.cipher) {
        packetData = decryptXpraPacketData(
          packetData,
          packetSize,
          padding,
          this.cipher
        )
      } else {
        throw new XpraPacketError('Decryption found no client cipher')
      }
    }

    return decompressXpraPacketData(packetData as Uint8Array, level)
  }

  private fixPacketData(packet: XpraRecievePacket) {
    packet[0] = uint8fromStringOrString(packet[0]) as XpraRecievePacketType

    if (packet[0] === 'draw') {
      packet[6] = uint8fromStringOrString(packet[6])
      packet[7] = uint8fromStringOrUint8(packet[7])
    } else if (packet[0] === 'sound-data') {
      packet[2] = uint8fromStringOrUint8(packet[2])
    } else if (packet[0] === 'notify_show') {
      packet[6] = uint8fromStringOrString(packet[6])
      packet[7] = uint8fromStringOrString(packet[7])
    } else if (packet[0] === 'challenge') {
      packet[1] = uint8fromStringOrString(packet[1])
      packet[3] = uint8fromStringOrString(packet[3])
      packet[4] = uint8fromStringOrString(packet[4])
      packet[5] = uint8fromStringOrString(packet[5])
    }

    return packet
  }
}
