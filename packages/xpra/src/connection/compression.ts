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

import * as zlib from 'pako'
import lz4 from 'lz4js'
import brotliDecompress from 'brotli/decompress'
import { XpraInflateBit, XpraRecievePacket } from '../types'

/**
 * Xpra wrapper for lz4 decompression
 */
function lz4decompress(data: Uint8Array) {
  const length = data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24)
  if (length <= 0) {
    throw new Error('invalid length: ' + length)
  } else if (length > 1024 * 1024 * 1024) {
    throw new Error('length too long: ' + length)
  }

  const inflated = new Uint8Array(length)
  lz4.decompressBlock(data, inflated, 4, length, 0)
  return inflated
}

/**
 * Decompress packet data from given level
 */
export function decompressXpraPacketData(
  packetData: Uint8Array,
  level: number
): Uint8Array {
  if (level != 0) {
    if (level & XpraInflateBit.LZ4) {
      return lz4decompress(packetData)
    } else if (level & XpraInflateBit.BROTLI) {
      return brotliDecompress(packetData.buffer as Buffer)
    } else {
      return zlib.inflate(packetData)
    }
  }

  return packetData
}

/**
 * Decompresses draw data from compression bit set in draw packet
 */
export function decompressXpraDrawData(packet: XpraRecievePacket) {
  const data = packet[7]
  const options = packet[10] || {}

  if (options.zlib > 0) {
    return zlib.inflate(data)
  } else if (options.lz4 > 0) {
    return lz4decompress(data)
  }

  return data
}
